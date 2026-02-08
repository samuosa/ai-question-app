const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Question = require('../models/Question');

// GET /api/questions
// Retrieve all questions for the authenticated user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const questions = await Question.find({ Userid: userId });
    res.json(questions);
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/questions
// Create a new question for the authenticated user
router.post('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      title,
      topic,
      question,
      a,
      b,
      c,
      d,
      correctAnswer,
      explanation,
      difficulty,
      language
    } = req.body;

    const newQuestion = new Question({
      Userid: userId,
      title,
      topic,
      question,
      a,
      b,
      c,
      d,
      correctAnswer,
      explanation,
      difficulty,
      language
    });

    await newQuestion.save();
    res.status(201).json({ message: 'Question created successfully.' });
  } catch (error) {
    console.error('Create question error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
