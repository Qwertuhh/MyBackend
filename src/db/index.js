import mongoose from "mongoose";
import { MONGODB_URI, PORT } from "../config.js";
import { DB_NAME } from "../constants.js";

const clientOptions = { serverApi: { version: "1", strict: true, deprecationErrors: true } };

async function connectDB() {
  try {
    const connection = await mongoose.connect(`${MONGODB_URI}`, { dbName: DB_NAME, ...clientOptions });//? Connect to DB
    console.log(`DB Connected To Host: "${connection.connection.host}"`);
  } catch (error) {
    console.error("DB Connection Failed :: ", error);
  } finally {
    //? Ensures that the client will close when you finish/error
    await mongoose.disconnect();
  }
}

export default connectDB;
