import mongoose from "mongoose";
import { MONGODB_URI,PORT } from "../config.js";
import { DB_NAME } from "../constants.js";


async function connectDB() {
  try {
    const connection = await mongoose.connect(`${MONGODB_URI}`, {dbName: DB_NAME});
    console.log(`DB Connected Host: ${connection.connection.host}`);
  } catch (error) {
    console.error("DB Connection Failed", error);
  }
}

export default connectDB;
