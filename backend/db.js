const mongoose = require("mongoose");

const uri = "mongodb+srv://twice:ilovecse356@cse356.3bebyax.mongodb.net/?retryWrites=true&w=majority";
let client;

const connectDB = async () => {
  try {
    client = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log("MongoDB connected");
  } catch (error) {
    console.log("Something went wrong with Database connection");
    process.exit(1);
  }
};

module.exports = connectDB;