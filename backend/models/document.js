const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const documentSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  id: {
    type: String, 
    required: true
  },
  date: {
    type: Date, 
    required: true
  }
});

module.exports = mongoose.model("document", documentSchema);