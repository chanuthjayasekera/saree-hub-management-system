const mongoose = require('mongoose');
require('dotenv').config();  // Ensure dotenv is being used here

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);  // Exit process with failure
  }
};

module.exports = connectDB;  // Ensure this is exported
