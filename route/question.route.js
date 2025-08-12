import express from 'express';
import { addQuestion, getQuestions, addReply } from '../controllers/question.controller.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/add', auth, addQuestion);
router.get('/get', getQuestions);
router.post('/reply', auth, addReply);

export default router; 