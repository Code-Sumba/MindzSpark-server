import BannerModel from '../models/banner.model.js';
import uploadImageClodinary from '../utils/uploadImageClodinary.js';

// Create a new banner (admin only)
export const createBanner = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded' });
    }
    // Upload image to Cloudinary
    const uploadResult = await uploadImageClodinary(req.file);
    if (!uploadResult || !uploadResult.secure_url) {
      return res.status(500).json({ success: false, message: 'Image upload failed' });
    }
    // Save banner to MongoDB
    const banner = await BannerModel.create({
      image: uploadResult.secure_url,
      caption: req.body.caption || '',
      link: req.body.link || '',
      createdBy: req.userId
    });
    res.status(201).json({ success: true, data: banner });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all banners (public)
export const getAllBanners = async (req, res) => {
  try {
    const banners = await BannerModel.find().sort({ createdAt: -1 });
    res.json({ success: true, data: banners });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a banner (admin only)
export const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await BannerModel.findByIdAndDelete(id);
    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }
    // Optionally: remove from Cloudinary (not implemented here)
    res.json({ success: true, message: 'Banner deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};