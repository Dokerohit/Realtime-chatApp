import dotenv from "dotenv"; dotenv.config();
import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from "./src/routes/auth.route.js";
import messageRoutes from "./src/routes/message.route.js";
import { connectDB } from "./src/lib/db.js"; 
import cors from "cors";
import {app,server} from "./src/lib/socket.js";
import path from "path";

const PORT=process.env.PORT;
const __dirname=path.resolve();


app.use(express.json({limit: "10mb"}));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}));

app.use("/api/auth",authRoutes);
app.use("/api/messages",messageRoutes);

if(process.env.NODE_ENV==="production"){
    app.use(express.static(path.join(__dirname,"../frontend/dist")));
    app.get(/.*/, (req, res) => {
        res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
    });
    
}


server.listen(PORT,()=>{
    console.log("app is listening on port "+PORT);
    connectDB();
});