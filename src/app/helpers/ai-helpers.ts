'use strict';

import * as tflite from '@tensorflow/tfjs-tflite';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-cpu';
import { createWorker } from 'tesseract.js';
import { cropFoundTextIntoImages, canvasToImage } from './format-helpers';

/**
 * Creates cordinates from where the east-text-detector was 50 procent sure it was a text.
 * @param {any[][][]} confidencesScores - The score how sure the ai is there is a text at that place
 * @param {any[][][]} locationOfText - The location of where ai think there is a text
 * @returns { boxCordinates: any[][]; boxConfidences: any[]; } - The cordinates with the confidences scores
 */
const calculateBoxes = (confidencesScores: any[][][], locationOfText: any[][][]): { boxCordinates: any[][]; boxConfidences: any[]; } => {
  const boxCordinates = [];
  const boxConfidences = [];
  const confidencesScoresArrays = confidencesScores[0][0];
  const locationOfTextArrays = locationOfText[0];
  const scoresLenght = confidencesScoresArrays.length;
  for (let y = 0; y < scoresLenght; y++) {
    const scoresData = confidencesScoresArrays[y];
    const xData0 = locationOfTextArrays[0][y];
    const xData1 = locationOfTextArrays[1][y];
    const xData2 = locationOfTextArrays[2][y];
    const xData3 = locationOfTextArrays[3][y];
    const anglesData = locationOfTextArrays[4][y];
    for (let x = 0; x < scoresLenght; x++) {
      const thresholdProcent = 0.5;
      if (scoresData[x] > thresholdProcent) {
        const angle = anglesData[x];
        const offset = [x * 4, y * 4];
        const cos = Math.cos(angle)
        const sin = Math.sin(angle)
        const height = xData0[x] + xData2[x];
        const width = xData1[x] + xData3[x];
        const endX = offset[0] + (cos * xData1[x]) + (sin * xData2[x]);
        const endY = offset[1] - (sin * xData1[x]) + (cos * xData2[x]);
        const startX = endX - width;
        const startY = endY - height;
        boxCordinates.push([startX, startY, width, height]);
        boxConfidences.push(scoresData[x]);
      }
    }
  }
  return { boxCordinates, boxConfidences };
}

/**
 * Transposes a tensor
 * @param {tf.Tensor} predictions - The results from our prediction of the tf model
 * @param {number} arrayNumber - The number that chooses what array to transpose in the tensor
 * @param {number[]} outputShape - The shape we should transpose the tensor to
 * @returns {any[][][]} - The transposed tensor
*/
const transposeTensor = (predictions: tf.Tensor, arrayNumber: number, outputShape: number[]): any[][][] => {
  const transposedTensor = tf.transpose(Object.values(predictions)[arrayNumber], outputShape);
  const tensorDataToNestedArray = transposedTensor.arraySync();
  return tensorDataToNestedArray;
}

/**
 * Take the choosen tf lite model and predict where the text is
 * @param {tflite.TFLiteModel} tfliteModel - The loaded tf lite model
 * @param {HTMLImageElement} inputImage - The image to predict where the text is
 * @returns { confidencesScores: any[][][]; locationOfText: any[][][]; } - The output of the predictions from the tf lite model
 */
const predictWhereTextis = (tfliteModel: tflite.TFLiteModel, inputImage: HTMLImageElement): { confidencesScores: any[][][]; locationOfText: any[][][]; } => {
  const tensor = tf.cast(tf.expandDims(tf.browser.fromPixels(inputImage), 0), 'float32');
  const predictions: any = tfliteModel.predict(tensor);
  const confidencesScores = transposeTensor(predictions, 0, [0, 3, 1, 2]);
  const locationOfText = transposeTensor(predictions, 1, [0, 3, 1, 2]);
  return { confidencesScores, locationOfText };
}

/**
* Finds the ten most likely cordinates where text is for a choosen image
* @param {tflite.TFLiteModel} tfliteModel - The loaded tf lite model
* @param {HTMLImageElement} inputImage - The image to predict where the text is
* @returns {any[]} - The ten filtered cordinates where text is
*/
const findTextInImage = (tfliteModel: tflite.TFLiteModel, inputImage: HTMLImageElement): any[] => {
  const choosenBoxesCordinates: any[] = [];
  if (tfliteModel && inputImage) {
    const { confidencesScores, locationOfText } = predictWhereTextis(tfliteModel, inputImage);
    const { boxCordinates, boxConfidences } = calculateBoxes(confidencesScores, locationOfText);
    if (boxCordinates.length && boxConfidences.length) {
      const noOverlappingBoxes = tf.image.nonMaxSuppression(boxCordinates, boxConfidences, 10);
      const choosenBoxes = noOverlappingBoxes.arraySync();
      choosenBoxes.forEach(box => {
        choosenBoxesCordinates.push(boxCordinates[box]);
      });
    }
  }
  return choosenBoxesCordinates;
};

/**
* Loads the tf lite model
* @returns {tflite.TFLiteModel} - The loaded model
*/
async function loadModel(): Promise<tflite.TFLiteModel> {
  // Need to set WasmPath for tfjs-lite: https://github.com/tensorflow/tfjs/issues/6026#issuecomment-1020639933
  tflite.setWasmPath(
    'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-tflite@0.0.1-alpha.9/dist/'
  );
  // Downloaded model: https://www.kaggle.com/models/spsayakpaul/east-text-detector/tfLite/fp16/1
  const tfliteModel = await tflite.loadTFLiteModel('/east-text-detector.tflite');
  return tfliteModel;
}

/**
* Crops an image from inputted cordinates in a canvas
* @param {string} inputImagePath - The path to the image to read text in
* @returns {string} - The read text in the image
*/
const readInputImageTesseract = async (inputImagePath: string): Promise<string> => {
  const worker = await createWorker('eng');
  const ret = await worker.recognize(inputImagePath);
  const readText = ret.data.text;
  await worker.terminate();
  return readText;
};


/**
* Crops the images into the choosen cordinates and read the image, also read the orignal image
* @param {any[]} foundTextBoxes - The cordinates where to crop the image
* @param {HTMLImageElement} inputImage - The image to crop the image at
* @returns {string} - The urls to the images and the read text from tesseract
*/
const readTextsFound = async (foundTextBoxes: any[], inputImage: HTMLImageElement): Promise<{ readImages: HTMLImageElement[]; readTexts: string[]; }> => {
  const readImages: any[] = [];
  const readTexts: string[] = [];
  if(inputImage){
    const orignalImageUrl = inputImage.src;
    const readTextOrignalImage = await readInputImageTesseract(orignalImageUrl);
    readImages.push(inputImage);
    readTexts.push(readTextOrignalImage);
  }
  if (foundTextBoxes.length) {
    for await (const boxCordinates of foundTextBoxes) {
      const croppedImage = cropFoundTextIntoImages(inputImage, boxCordinates);
      const croppedImageUrl = croppedImage.toDataURL();
      const readText = await readInputImageTesseract(croppedImageUrl);
      if(readText.trim().length === 0){
        readTexts.push("No text found");
      } else {
        readTexts.push(readText);
      }
      readImages.push(canvasToImage(croppedImageUrl));
    }
  }
  return { readImages, readTexts };
};

export { loadModel, findTextInImage, readTextsFound };