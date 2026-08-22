const mongoose = require("mongoose");

const connectDb = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL);
    console.log(`monogodb connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(`mongodb connection error : ${error.message} `);
    process.exit(1);
  }
};

module.exports = connectDb;
