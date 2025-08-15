import express from 'express';
import {
    createNotification,
    getAllNotifications,
    getUserNotifications,
    updateNotification,
    deleteNotification,
    markNotificationAsRead,
    getNotificationStats
} from '../controllers/notification.controller.js';
import auth from '../middleware/auth.js';
import { admin as Admin } from '../middleware/Admin.js';

const router = express.Router();

// Admin routes (require admin authentication)
router.post('/create', auth, Admin, createNotification);
router.get('/admin/all', auth, Admin, getAllNotifications);
router.put('/admin/update/:id', auth, Admin, updateNotification);
router.delete('/admin/delete/:id', auth, Admin, deleteNotification);
router.get('/admin/stats', auth, Admin, getNotificationStats);

// User routes (require user authentication)
router.get('/user', auth, getUserNotifications);
router.put('/user/read/:id', auth, markNotificationAsRead);

export default router; 