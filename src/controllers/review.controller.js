import ReviewModel from '../models/review.model.js';

// Add a new review
export async function addReview(request, response) {
  try {
    const { productId, userId, userName, rating, text } = request.body;
    if (!productId || !userId || !userName || !rating || !text) {
      return response.status(400).json({
        message: 'All fields are required',
        success: false,
        error: true
      });
    }
    const review = new ReviewModel({
      product: productId,
      user: userId,
      userName,
      rating,
      text
    });
    await review.save();
    return response.json({
      message: 'Review added successfully',
      success: true,
      error: false,
      data: review
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      success: false,
      error: true
    });
  }
}

// Get all reviews for a product
export async function getReviews(request, response) {
  try {
    const { productId } = request.query;
    if (!productId) {
      return response.status(400).json({
        message: 'Product ID is required',
        success: false,
        error: true
      });
    }
    const reviews = await ReviewModel.find({ product: productId }).sort({ date: -1 });
    return response.json({
      message: 'Reviews fetched successfully',
      success: true,
      error: false,
      data: reviews
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      success: false,
      error: true
    });
  }
} 