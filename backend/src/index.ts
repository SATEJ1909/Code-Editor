
import express from "express";
const app =  express();
import UserRouter from "./routes/user";
import SnippetRouter from "./routes/snippet";
import mongoose from "mongoose";

app.use(express.json());

app.use("/api/v1/user" , UserRouter);
app.use("/api/v1/snippet" , SnippetRouter);

 async function main(){
    await mongoose.connect("mongodb://localhost:27017/RTC-code-editor");
    app.listen(3000 ,() => {
        console.log("server running on port 3000")
    })
}
main();


