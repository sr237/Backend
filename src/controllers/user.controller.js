import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiErrorHandle.js"
import {User} from "../models/user.models.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"

const registerUser = asyncHandler(async (req, res) => {
    console.log("Request Body:", req.body);
    console.log("Request Files:", req.files);
    const {fullname, username, email, password} = req.body;
    console.log("email", email);

    if([fullname,username,email,password].some((field) =>  field?.trim() === ""))
    {
        throw new ApiError( 400,"All fields are required");
    }

    const existedUser =await User.findOne({
        $or:[ {username} , {email} ]
    })
    // console.log("hello console");
    if(existedUser) {
        throw new ApiError( 409,"User already exists");
    }
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar is requireds");
    }


    const avatar= await uploadOnCloudinary(avatarLocalPath) 
    const coverImage =await uploadOnCloudinary(coverImageLocalPath)




    if(!avatar){
        throw new ApiError(400,"Error in uploading avatar");
    }
    const user = await User.create({
        fullname,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        email,
        username:username.toLowerCase(),
        password
    })

    const createdUser =await User.findById(user._id).select(
        "-password -refreshToken" //v8 js ,ye fields ko hide krne ke liye use hota hai
    ) //ye user ko dobara find kr rha hai bcz password ko hide krne ke liye

    if(!createdUser){
        throw new ApiError(500,"Something went wrong while creating user"); //server error
    }
    return res.status(201).json(
        new ApiResponse(200,createdUser,"User created successfully")
    )
}); 





export { registerUser };