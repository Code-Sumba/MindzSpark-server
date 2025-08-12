import express from 'express';
import upload from '../middleware/multer.js';
import { admin as Admin } from '../middleware/Admin.js';
import auth from '../middleware/auth.js';
import {
  createBanner,
  getAllBanners,
  deleteBanner
} from '../controllers/banner.controller.js';

const router = express.Router();

// Admin: Upload new banner
router.post('/banner', auth, Admin, upload.single('image'), createBanner);
// Public: Get all banners
router.get('/', getAllBanners);
// Admin: Delete banner
router.delete('/:id', auth, Admin, deleteBanner);

export default router;