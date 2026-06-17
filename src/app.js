import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials :true;
})) // this get configure

app.use(express.json({
    limit:"16kb",
}))
app.use(express.urlencoded({
    extended:true,//we can give nested objects with extended
    limit="16kb"
}))
app.use(express.stati("public")) // when we want to store pdf , files i nour server ,these are public assets

export {app} 