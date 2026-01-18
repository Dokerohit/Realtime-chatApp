import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const mongo_url = process.env.MONGODB_URL;
    const conn = await mongoose.connect(mongo_url);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.log("mongodb error", err.message);
    process.exit(1);
  }
};
