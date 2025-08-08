import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  
  // General Store Settings
  general: {
    storeName: { type: String, default: '' },
    storeDescription: { type: String, default: '' },
    storeEmail: { type: String, default: '' },
    storePhone: { type: String, default: '' },
    storeAddress: { type: String, default: '' },
    storeCity: { type: String, default: '' },
    storeState: { type: String, default: '' },
    storePincode: { type: String, default: '' },
    storeCountry: { type: String, default: 'India' },
    businessType: { type: String, enum: ['retail', 'wholesale', 'manufacturer', 'distributor'], default: 'retail' },
    gstNumber: { type: String, default: '' },
    panNumber: { type: String, default: '' }
  },
  
  // ShipRocket Integration Settings
  shipping: {
    shiprocketEmail: { type: String, default: '' },
    shiprocketPassword: { type: String, default: '' }, // Should be encrypted
    shiprocketToken: { type: String, default: '' },
    shiprocketChannelId: { type: String, default: '' },
    defaultPickupLocation: { type: String, default: '' },
    defaultLength: { type: Number, default: 10 },
    defaultBreadth: { type: Number, default: 10 },
    defaultHeight: { type: Number, default: 10 },
    defaultWeight: { type: Number, default: 0.5 },
    enableCOD: { type: Boolean, default: true },
    enablePrepaid: { type: Boolean, default: true },
    autoCreateShipment: { type: Boolean, default: false },
    defaultCourier: { type: String, default: 'auto' }
  },
  
  // Payment Gateway Settings
  payment: {
    razorpayKeyId: { type: String, default: '' },
    razorpayKeySecret: { type: String, default: '' }, // Should be encrypted
    enableRazorpay: { type: Boolean, default: true },
    enableCOD: { type: Boolean, default: true },
    codCharges: { type: Number, default: 0 },
    minOrderAmount: { type: Number, default: 0 },
    maxCODAmount: { type: Number, default: 50000 }
  },
  
  // Notification Settings
  notifications: {
    emailNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: false },
    orderConfirmation: { type: Boolean, default: true },
    orderShipped: { type: Boolean, default: true },
    orderDelivered: { type: Boolean, default: true },
    lowStock: { type: Boolean, default: true },
    newCustomer: { type: Boolean, default: false },
    dailyReport: { type: Boolean, default: true },
    weeklyReport: { type: Boolean, default: true }
  },
  
  // Security Settings
  security: {
    twoFactorAuth: { type: Boolean, default: false },
    sessionTimeout: { type: Number, default: 30 }, // in minutes
    allowedIPs: { type: String, default: '' }, // comma-separated IPs
    passwordPolicy: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' }
  }
}, {
  timestamps: true
});

// Encrypt sensitive fields before saving
settingsSchema.pre('save', function(next) {
  // In production, encrypt sensitive fields like passwords and API keys
  // For now, we'll keep them as is for development
  next();
});

const SettingsModel = mongoose.model('Settings', settingsSchema);

export default SettingsModel;