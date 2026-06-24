import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors"

const app = express()
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials :true
})) // this get configure

app.use(express.json({
    limit:"16kb",
}))
app.use(express.urlencoded({
    extended:true,//we can give nested objects with extended
    limit:"16kb"}))

app.use(express.static("public")) // when we want to store pdf , files i nour server ,these are public assets


app.get("/", (req, res) => {
    res.send("Backend Working");
});
app.get("/smile", (req, res) => {
    res.send("smile Working");
});

//routes (segregation of files)
import userRouter from "./routes/user.routes.js";

//routes declaration
//app.get ki jagah app.use bcz middlewar to get router
app.use("/api/v1/users",userRouter )


app.get("/", (req, res) => {
    res.send("APP JS LOADED");
});
export {app} 