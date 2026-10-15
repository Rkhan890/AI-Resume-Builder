import mongoose from "mongoose";
import dns from "node:dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);




const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => {
      console.log("Database connected successfully");
    });

    let mongodbURI = process.env.MONGODB_URI.trim();
    const projectName = 'resume-builder';

    if (!mongodbURI) {
      throw new Error("MONGODB_URI environment variable not set");
    }

    if (mongodbURI.endsWith('/')) {
      mongodbURI = mongodbURI.slice(0, -1);
    }

    await mongoose.connect(`${mongodbURI}/${projectName}`);

  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};

export default connectDB;