import {v2 as cloudinary} from "cloudinary"
import fs from "fs" // inbuilt rehta hai

cloudinary.config({
    cloud_name :process.env.CLOUDINARY_CLOUD_NAME,
    api_key : process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRECT,
})

const uploadOnCloudinary = async (localFilePath) =>{
    try{
        if(!localFilePath) return null
        // upload file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })//.upload(filepath,options[])
        //file has been uploaded
        console.log(`successfully uploaded ${response.url}`); // .url gives public url
        return response;
    }
    catch(error) {
        fs.unlinkSync(localFilePath) // just remove the file from locally saved temp file as upload op failed
        return null;
    }
}

export {uploadOnCloudinary} 