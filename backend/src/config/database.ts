import mongoose from "mongoose";
import { DB_NAME } from "../constants/index.js";

const connectDB = async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log("SUCCESSFULLY CONNECTED TO DATABASE");
    } catch (error: any) {
        console.error("ERROR WHILE CONNECTING TO DATABASE", error?.message);
    }
};

export { connectDB };
