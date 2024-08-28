'use strict';
'use client';

import React, { useEffect, useState } from 'react';
import { loadModel, findTextInImage, readTextsFound } from './helpers/ai-helpers';
import { drawBoxesOnImage } from './helpers/format-helpers';
import { TFLiteModel } from '@tensorflow/tfjs-tflite';
import ShowResult from './components/showResults';
import ImageUpload from './components/imageUpload';
import ShowImage from './components/showImage';
import ExplainText from './components/explainText';

export default function Home() {
  const [inputImage, setInputImage] = useState<HTMLImageElement>();
  const [tfliteModel, setTfliteModel] = useState<TFLiteModel>();
  const [readTexts, setReadTexts] = useState<any[]>();
  const [readImages, setReadImages] = useState<any[]>();

  useEffect(() => {
    const setLoadedModel = async () => {
      setTfliteModel(await loadModel());
    }
    setLoadedModel();
  }, []);

  const findText = async () => {
    if (inputImage && tfliteModel) {
      const foundTextBoxes = findTextInImage(tfliteModel, inputImage);
      const canvas = document.getElementsByClassName('coveringCanvas')[0] as HTMLCanvasElement;
      if (foundTextBoxes && canvas) {
        drawBoxesOnImage(canvas, foundTextBoxes);
        const { readImages, readTexts } = await readTextsFound(foundTextBoxes, inputImage);
        setReadTexts(readTexts);
        setReadImages(readImages);
      }
    };
  };

  return (
    <div className='flex justify-center p-8'>
      <div className='w-80'>
        <div className='pb-8'>
          <ExplainText></ExplainText>
        </div>
        <div className='pb-8'>
        <ImageUpload setInputImage={setInputImage}></ImageUpload>
        </div>
        <div className='pb-8'>
        {inputImage && <ShowImage findText={findText} inputImageUrl={inputImage.src}></ShowImage>}
        </div>
        <div className='pb-8'>
        {readTexts && readImages && <ShowResult readImages={readImages} readTexts={readTexts}></ShowResult>}
        </div>
      </div>
    </div>
  );
}