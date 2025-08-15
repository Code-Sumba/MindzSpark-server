import Question from '../models/question.model.js';

export const addQuestion = async (req, res) => {
  try {
    const { productId, userId, userName, text } = req.body;
    if (!productId || !userId || !userName || !text) {
      return res.status(400).json({ success: false, message: 'Missing fields' });
    }
    const question = new Question({ productId, userId, userName, text });
    await question.save();
    res.json({ success: true, data: question });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getQuestions = async (req, res) => {
  try {
    const { productId } = req.query;
    if (!productId) {
      return res.status(400).json({ success: false, message: 'Missing productId' });
    }
    const questions = await Question.find({ productId }).sort({ date: -1 });
    res.json({ success: true, data: questions });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const addReply = async (req, res) => {
  try {
    const { questionId, userId, userName, text } = req.body;
    if (!questionId || !userId || !userName || !text) {
      return res.status(400).json({ success: false, message: 'Missing fields' });
    }
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }
    question.replies.push({ userId, userName, text });
    await question.save();
    res.json({ success: true, data: question });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}; 