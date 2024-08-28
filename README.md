#OCR tensorflow lite js exampel

This is a exampel next.js app written with typescript that takes an image and reads it text contents.

It works as followed:
1. Upload an image
2. Run tflite.js with model east text detector to find text in a uploaded image
3. Crop image down to found text by east text detector
4. Read text of orignal image and cropped found text images with tesseract.js
5. Print out the result

Link to used tflite model: https://www.kaggle.com/models/spsayakpaul/east-text-detector/tfLite/fp16/1?tfhub-redirect=true  
Link to tesseract.js: https://tesseract.projectnaptha.com/
