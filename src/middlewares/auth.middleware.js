import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiErrorHandle.js";
import {User} from "../models/user.models.js"



export const verifyJWT= asyncHandler(async(req,_,next)=>{ // when res ka use nhi tab (res = _)
    //now cookies access krne ke liye hume cookie parser middleware use krna padega else header se nikal lo token
    // Authorisation : Bearer <token>
    try{
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer","")
        if(!token){
            throw new ApiError(401,"Unauthorized access, token not found")
        }
        //if token hai to , ye sahi hai ya nhi?


        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken") 
        if(!user) {
            // TODO :discuss for frontend
            throw new ApiError(401,"Unauthorized access, user not found")
        }

        req.user= user ;
        next();
    }catch(err){
        throw new ApiError(401,"Unauthorized access, invalid token")
    } 

    
})

export {verifyJWT}