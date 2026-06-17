import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async ()=>{
    try {
        const connectionInstance =await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n MongoDB connected !! DB host : ${connectionInstance.connection.host}`) //bcz bd for dev prod and testing are diff
    }
    catch(error){
        console.log("MONGODB connection FAILED",error)
        process.exit(1)
    }
}

export default connectDB





//i did ->{{{{}}}}
// const connnectDB = async () =>{
//     try{
//         const connectionInstance= await mongoose.connect(`${process.env.MONGODB_URI}/%{DB_NAME}`)
//         console.log("Mongo db conncetion " )
//         console.log(`db host is ${connectionInstance.connection.host}`)
//     }
//     catch(error) {
//     console(`eror is :${error}`)
//     }
// }