import { Router } from 'express';
import { addReview, getReviews } from '../controllers/review.controller.js';

const reviewRouter = Router();

reviewRouter.post('/add', addReview);
reviewRouter.get('/get', getReviews);

export default reviewRouter; 