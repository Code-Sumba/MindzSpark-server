import mongoose from 'mongoose';

const replySchema = new mongoose.Schema({
  userId: String,
  userName: String,
  text: String,
  date: { type: Date, default: Date.now }
});

const questionSchema = new mongoose.Schema({
  productId: String,
  userId: String,
  userName: String,
  text: String,
  date: { type: Date, default: Date.now },
  replies: [replySchema]
});

export default mongoose.model('Question', questionSchema); 