'use strict';


/**
 * Creates a canvas and canvas context
 * @returns { canvas: HTMLCanvasElement; context: CanvasRenderingContext2D; } - Returns canvas and object
 */
const createCanvas = (): { canvas: HTMLCanvasElement; context: CanvasRenderingContext2D | null; } => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  return { canvas, context };
};

/**
 * Creates a canvas and canvas context
 * @param {File} inputImage - The inputImage to format
 * @returns {HTMLImageElement} - Returns the formatted image
 */
const formatImage = (inputImage: File): HTMLImageElement => {
  const formattedImage = new Image(320, 320);
  formattedImage.src = URL.createObjectURL(inputImage);
  return formattedImage;
};

/**
 * Crops an image from inputted cordinates in a canvas
 * @param {HTMLImageElement} inputImage - The image element to crop from
 * @param {number[]} boxCordinates - The array with the cordinates to crop from
 * @returns {HTMLCanvasElement} - The cropped canvas element
 */
const cropFoundTextIntoImages = (inputImage: HTMLImageElement, boxCordinates: number[]): HTMLCanvasElement => {
  // Round up all numbers for canvas
  const boxCordinateX = Math.ceil(boxCordinates[0]);
  const boxCordinateY = Math.ceil(boxCordinates[1]);
  const boxWidth = Math.ceil(boxCordinates[2]);
  const boxHeight = Math.ceil(boxCordinates[3]);

  const { canvas, context } = createCanvas();
  canvas.width = inputImage.width;
  canvas.height = inputImage.height;
  context?.drawImage(inputImage, 0, 0, inputImage.width, inputImage.height);

  const { canvas: croppedCanvas, context: croppedContext } = createCanvas();

  croppedCanvas.width = boxWidth;
  croppedCanvas.height = boxHeight;
  croppedContext?.drawImage(canvas, boxCordinateX, boxCordinateY, boxWidth, boxHeight, 0, 0, boxWidth, boxHeight);

  return croppedCanvas;
};

/**
 * Draws the boxes onto the image by the given cordinates
 * @param {HTMLCanvasElement} canvas - The canvas element to draw on
 * @param {number[]} foundTextBoxes - The cordinates to draw on the image
 */
const drawBoxesOnImage = (canvas: HTMLCanvasElement, foundTextBoxes: number[]) => {
  const context = canvas?.getContext('2d');
  if(context){
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = "black";
    context.lineWidth = 3;
    foundTextBoxes.forEach((boxCordinates: any) => {
      context.strokeRect(boxCordinates[0], boxCordinates[1], boxCordinates[2], boxCordinates[3]);
    });
  }
};

/**
 * Converts canvas to image
 * @param {string} canvasUrl - The url to the canvas image
 * @returns {HTMLImageElement} - Return the canvas as an image element
 */
const canvasToImage = (canvasUrl: string) => {
  const img = new Image();
  img.src = canvasUrl;
  return img;
};

export { formatImage, cropFoundTextIntoImages, drawBoxesOnImage, canvasToImage }

