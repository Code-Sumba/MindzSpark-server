import express from 'express';
import auth from '../middleware/auth.js';
import { admin as Admin } from '../middleware/Admin.js';

const router = express.Router();

// Sending email to user form admin panel
router.post('/send-otp', Admin, )
router.post('/very-otp', Admin, )
router.post('/send-order-conformation', Admin, )
router.post('/send-verification-url', Admin, )

export default router; 