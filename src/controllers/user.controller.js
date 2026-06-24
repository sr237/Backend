import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiErrorHandle.js"
import {User} from "../models/user.models.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"

//yeh ek method hai jo access token aur refresh token generate krta hai aur user ke refresh token ko update krta hai
const generateAccessAndRefreshToken = async (userId)=>{
    try {
        const user = await User.findById(userId)
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave:false}); // sidha save krdo , validation mat kro varna wo password wagra ko bhi dekhta hai
        return {accessToken,refreshToken};
    } catch (error) {
        throw new ApiError(500,"Error while generating access and refresh token");
    }
}


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

const loginUser =asyncHandler(async (req,res)=>{
    //req body me email,username and password aayega
    //find the user by username or email
    //password check
    //access and refrehs token generate and send to user
    //send response to user via secure cookies 
    const {username,password,email} =req.body;
    if(!username || !email){
        throw new ApiError(400,"username or email is required")
    }
    if(!password){
        throw new ApiError(400,"password is required")
    }
    const user = await User.findOne({
        // $or is mongodb operator jo username ya email me se kisi ek ko match krne ke liye use hota hai  
        $or:[{username: username.toLowerCase()}, {email : email.toLowerCase()}]
    })
    if(!user){
        throw new ApiError(404,"user not found ie does not exist");
    }
    //password comparison ke lie bcrypt ka compare method use hota hai jo hashed password ko compare krta hai
    const isPasswordValid= await user.isPasswordCorrect(password) //ye method user model me define kiya hai

    if(!isPasswordValid){
        throw new ApiError(401,"Invalid password");
    }
    const {accessToken,refreshToken}= await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken") //ye user ko dobara find kr rha hai bcz password ko hide krne ke liye

    //sending cookies now from here
    const options ={
        httpOnly :true,
        secure :true
    }
    return res
    .status(200)
    .cookie("access token ", accessToken,options)
    .cookie("refresh token", refreshToken,options)
    .json(
        new ApiRespone(200,
            {
                user:loggedInUser,
                accessToken,
                refreshToken
            },
            "User logged in successfully"
        )
    )
});

const logoutUser= asyncHandler(async(req,res) =>{
    //yahan req.user me user ki details aa rhi hai bcz verifyJWT middleware me req.user me user ki details set kiya tha
    // 1.) refresh token db se gayab
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{refreshToken :null}
        },
        {
            new:true
        }
    )
    // 2.) cookies ko clear krna
    const options ={
        httpOnly :true,
        secure :true
    }
    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User logged out successfully"))
})


export { registerUser,loginUser,logoutUser};