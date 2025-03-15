const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  Userid: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  topic: { type: String, required: true },
  question: { type: String, required: true },
  a: { type: String, required: true },
  b: { type: String, required: true },
  c: { type: String, required: true },
  d: { type: String, required: true },
  correctAnswer: { type: String, required: true },
  explanation: { type: String, required: false },
  difficulty: { type: String, required: false },
  language: { type: String, required: false },
});

module.exports = mongoose.model('Question', questionSchema);
