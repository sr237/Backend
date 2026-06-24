import {v2 as cloudinary} from "cloudinary"
import fs from "fs" // inbuilt rehta hai

cloudinary.config({
    cloud_name :process.env.CLOUDINARY_CLOUD_NAME,
    api_key : process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET,
})

console.log("Cloud:", process.env.CLOUDINARY_CLOUD_NAME)
console.log("Key:", process.env.CLOUDINARY_API_KEY)
console.log("Secret exists:", !!process.env.CLOUDINARY_API_SECRET)


const uploadOnCloudinary = async (localFilePath) =>{
    try{
        if(!localFilePath) return null
        // upload file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })//.upload(filepath,options[])
        //file has been uploaded
        console.log(`successfully uploaded ${response.url}`); // .url gives public url
        fs.unlinkSync(localFilePath) // local file ko delete krne ke liye use hota hai ,sync bcz hum chahte hai ki file delete ho jaye uske baad hi aage ka code execute ho
        console.log(response);
        return response;
    }
    catch(error) {
    console.log("Cloudinary Error:");
    console.log(error);

    if(localFilePath){
        fs.unlinkSync(localFilePath);
    }

    return null;
}
}

export {uploadOnCloudinary} 