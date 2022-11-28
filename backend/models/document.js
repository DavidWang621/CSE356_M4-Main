const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const documentSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  content: {
    type: String, 
    required: true
  },
  lastAccessed: {
    type: Date, 
    required: true
  }
});

module.exports = mongoose.model("document", documentSchema);