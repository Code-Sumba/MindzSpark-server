import mongoose from "mongoose";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// checks wether the MongooDB url is their or not
if(!process.env.MONGODB_URI){
    throw new Error(
        "Please provide MONGODB_URI in the .env file"
    )
}

// this is an async function this is a request responce function

// async function connectDB(){
//     try {
//         await mongoose.connect(process.env.MONGODB_URI)
//         console.log("connect DB")
//     } catch (error) {
//         console.log("Mongodb connect error",error)
//         process.exit(1)
//     }
// }

// Implementing using arrow function
const connectDB = async () =>{
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log("connected to mongoodb successfully.");
    } catch (error) {
        console.log("mongoodb connect error", error)
        process.exit(1)
    }
}

export default connectDB