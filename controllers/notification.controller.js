import Notification from '../models/notification.model.js';
import User from '../models/user.model.js';

// Create new notification
const createNotification = async (req, res) => {
    try {
        const {
            type,
            title,
            message,
            fullMessage,
            priority,
            target,
            status,
            scheduledDate
        } = req.body;

        const notification = new Notification({
            type,
            title,
            message,
            fullMessage,
            priority,
            target,
            status,
            createdBy: 'admin',
            scheduledDate: scheduledDate ? new Date(scheduledDate) : null
        });

        const savedNotification = await notification.save();
        res.status(201).json({
            success: true,
            message: 'Notification created successfully',
            data: savedNotification
        });
    } catch (error) {
        console.error('Error creating notification:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create notification',
            error: error.message
        });
    }
};

// Get all notifications (for admin)
const getAllNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find()
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: notifications
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch notifications',
            error: error.message
        });
    }
};

// Get notifications for specific user
const getUserNotifications = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get active notifications based on target audience
        let query = { status: 'active' };

        // Filter by target audience
        const userCreatedAt = user.createdAt;
        const userOrderCount = user.orderCount || 0;
        const userRole = user.role;

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 });

        // Filter notifications based on target audience
        const filteredNotifications = notifications.filter(notification => {
            switch (notification.target) {
                case 'all':
                    return true;
                case 'new_users':
                    // Users created less than 7 days ago
                    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                    return userCreatedAt && userCreatedAt > sevenDaysAgo;
                case 'active_users':
                    // Users who have made purchases
                    return userOrderCount > 0;
                case 'premium_users':
                    // Users with premium role
                    return userRole === 'PREMIUM';
                default:
                    return true;
            }
        });

        res.status(200).json({
            success: true,
            data: filteredNotifications
        });
    } catch (error) {
        console.error('Error fetching user notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user notifications',
            error: error.message
        });
    }
};

// Update notification
const updateNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const notification = await Notification.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Notification updated successfully',
            data: notification
        });
    } catch (error) {
        console.error('Error updating notification:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update notification',
            error: error.message
        });
    }
};

// Delete notification
const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;

        const notification = await Notification.findByIdAndDelete(id);

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Notification deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete notification',
            error: error.message
        });
    }
};

// Mark notification as read by user
const markNotificationAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        const notification = await Notification.findById(id);

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        // Check if user has already viewed this notification
        const hasViewed = notification.viewedBy.includes(userId);

        if (!hasViewed) {
            notification.viewedBy.push(userId);
            notification.readCount += 1;
            await notification.save();
        }

        res.status(200).json({
            success: true,
            message: 'Notification marked as read',
            data: notification
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark notification as read',
            error: error.message
        });
    }
};

// Get notification statistics
const getNotificationStats = async (req, res) => {
    try {
        const totalNotifications = await Notification.countDocuments();
        const activeNotifications = await Notification.countDocuments({ status: 'active' });
        
        // Count unique viewers across all notifications
        const allNotifications = await Notification.find();
        const allViewers = new Set();
        allNotifications.forEach(notification => {
            notification.viewedBy.forEach(viewerId => allViewers.add(viewerId.toString()));
        });

        // Count notifications sent today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const sentToday = await Notification.countDocuments({
            createdAt: { $gte: today }
        });

        res.status(200).json({
            success: true,
            data: {
                totalNotifications,
                activeNotifications,
                totalViewers: allViewers.size,
                sentToday
            }
        });
    } catch (error) {
        console.error('Error fetching notification stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch notification statistics',
            error: error.message
        });
    }
};

export {
    createNotification,
    getAllNotifications,
    getUserNotifications,
    updateNotification,
    deleteNotification,
    markNotificationAsRead,
    getNotificationStats
}; 