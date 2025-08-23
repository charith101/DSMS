const mongoose = require('mongoose');

const MockQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, "Question is required"],
    trim: true
  },
  options: {
    type: [String],
    validate: {
      validator: arr => arr.length >= 2,
      message: "At least two options are required"
    }
  },
  correctAnswer: {
    type: String,
    required: [true, "Correct answer is required"]
  }
});

module.exports = mongoose.model('MockQuestion', MockQuestionSchema);