import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['system', 'order', 'promo', 'alert'],
        default: 'system'
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    fullMessage: {
        type: String,
        required: true,
        trim: true
    },
    priority: {
        type: String,
        required: true,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    target: {
        type: String,
        required: true,
        enum: ['all', 'new_users', 'active_users', 'premium_users'],
        default: 'all'
    },
    status: {
        type: String,
        required: true,
        enum: ['active', 'inactive', 'scheduled'],
        default: 'active'
    },
    createdBy: {
        type: String,
        required: true,
        default: 'admin'
    },
    readCount: {
        type: Number,
        default: 0
    },
    viewedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    scheduledDate: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Index for better query performance
notificationSchema.index({ status: 1, createdAt: -1 });
notificationSchema.index({ target: 1, status: 1 });

export default mongoose.model('Notification', notificationSchema); 