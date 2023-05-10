const mongoose = require("mongoose");

const status = ["ToDo", "Doing", "Done"];


const taskSchema = new mongoose.Schema({
  
  name:         { type: String, required: true, min: 5, max: 255 },
  description:  { type: String, required: false, min: 5, max: 255 },
  status:       { type: String,  default: "ToDo"  },
  created_at:   { type: Date, default: Date.now, },
  deadline:     { type: String },
  author:       { type: String }
});

module.exports = mongoose.model("task", taskSchema);