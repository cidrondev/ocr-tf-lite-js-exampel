'use strict';

import Image from 'next/image'

export default function ShowImage({ inputImageUrl, findText }: Readonly<{ inputImageUrl: string; findText: Function; }>) {
    return (
        <>
            <h2 className='text-2xl text-bold pb-4'>Uploaded Image with found text:</h2>
            <div className="outsideWrapper">
                <div className="insideWrapper">
                    <Image
                        src={inputImageUrl}
                        alt="upload-preview"
                        className="coveredImage"
                        onLoad={() => { findText(); }}
                        width={320}
                        height={320} />
                    <canvas className="coveringCanvas" width="320px" height="320px"></canvas>
                </div>
            </div></>
    );
}