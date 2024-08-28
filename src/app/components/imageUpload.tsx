'use strict';

import React, { ChangeEvent } from "react";
import { formatImage } from "../helpers/format-helpers";

export default function ImageUpload({ setInputImage }: Readonly<{ setInputImage: Function; }>) {

    const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
        if (event?.target?.files) {
            const image = event.target.files[0];
            const formattedImage = formatImage(image);
            setInputImage(formattedImage);
        }
    };

    return (
        <>
            <label className="block mb-2" htmlFor="file_input">Upload file</label>
            <input id="file_input" type="file" onChange={(event) => { handleImageUpload(event) }} />
        </>
    );
}
