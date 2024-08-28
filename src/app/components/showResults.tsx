'use strict';

import Image from 'next/image'

export default function ShowResult({ readImages, readTexts }: Readonly<{ readImages: HTMLCanvasElement[]; readTexts: string[]; }>) {
  return (
    <div>
      <div>
        <h2 className='text-2xl text-bold pb-4'>Results from readtext:</h2>
        {Boolean(readImages.length === 0) && Boolean(readTexts.length === 0) && <p>No text found</p>}
        {readImages.map((image: any, index: number) =>
          <div className='p-8 mb-4 border-4 border-white rounded-lg' key={readTexts[index] + index}>
            <Image
              src={image.src}
              width={image.width}
              height={image.height}
              alt="upload-preview" />
              <p className='pt-8'>{readTexts[index]}</p>
          </div>
        )}
      </div>
    </div>
  );
}