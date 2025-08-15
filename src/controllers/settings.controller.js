import SettingsModel from '../models/settings.model.js';
import UserModel from '../models/user.model.js';
import crypto from 'crypto';

// Encryption key for sensitive data (in production, use environment variable)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-32-character-secret-key-here';

// Simple encryption function (use proper encryption in production)
const encrypt = (text) => {
  if (!text) return '';
  const cipher = crypto.createCipher('aes-256-cbc', ENCRYPTION_KEY);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};

// Simple decryption function
const decrypt = (encryptedText) => {
  if (!encryptedText) return '';
  try {
    const decipher = crypto.createDecipher('aes-256-cbc', ENCRYPTION_KEY);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    return encryptedText; // Return as is if decryption fails
  }
};

// Get settings for the current user
export const getSettings = async (req, res) => {
  try {
    const userId = req.userId;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Check if user is admin
    const user = await UserModel.findById(userId);
    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Forbidden: Admins only' });
    }

    let settings = await SettingsModel.findOne({ userId });
    
    if (!settings) {
      // Create default settings if none exist
      settings = new SettingsModel({ userId });
      await settings.save();
    }

    // Decrypt sensitive fields before sending
    const settingsData = settings.toObject();
    if (settingsData.shipping?.shiprocketPassword) {
      settingsData.shipping.shiprocketPassword = decrypt(settingsData.shipping.shiprocketPassword);
    }
    if (settingsData.payment?.razorpayKeySecret) {
      settingsData.payment.razorpayKeySecret = decrypt(settingsData.payment.razorpayKeySecret);
    }

    res.json({
      success: true,
      data: settingsData
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings',
      error: error.message
    });
  }
};

// Update settings for the current user
export const updateSettings = async (req, res) => {
  try {
    const userId = req.userId;
    const { section, settings: sectionSettings } = req.body;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Check if user is admin
    const user = await UserModel.findById(userId);
    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Forbidden: Admins only' });
    }

    if (!section || !sectionSettings) {
      return res.status(400).json({ 
        success: false, 
        message: 'Section and settings data are required' 
      });
    }

    let settings = await SettingsModel.findOne({ userId });
    
    if (!settings) {
      settings = new SettingsModel({ userId });
    }

    // Encrypt sensitive fields before saving
    if (section === 'shipping' && sectionSettings.shiprocketPassword) {
      sectionSettings.shiprocketPassword = encrypt(sectionSettings.shiprocketPassword);
    }
    if (section === 'payment' && sectionSettings.razorpayKeySecret) {
      sectionSettings.razorpayKeySecret = encrypt(sectionSettings.razorpayKeySecret);
    }

    // Update the specific section
    settings[section] = { ...settings[section], ...sectionSettings };
    
    await settings.save();

    res.json({
      success: true,
      message: `${section.charAt(0).toUpperCase() + section.slice(1)} settings updated successfully`,
      data: settings
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update settings',
      error: error.message
    });
  }
};

// Test ShipRocket connection
export const testShipRocketConnection = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Test ShipRocket API connection
    const response = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (data.token) {
      // Update settings with the token
      const userId = req.userId;
      let settings = await SettingsModel.findOne({ userId });
      
      if (!settings) {
        settings = new SettingsModel({ userId });
      }
      
      settings.shipping.shiprocketToken = data.token;
      settings.shipping.shiprocketEmail = email;
      settings.shipping.shiprocketPassword = encrypt(password);
      
      // Get channel ID if available
      if (data.profile && data.profile.company_id) {
        settings.shipping.shiprocketChannelId = data.profile.company_id.toString();
      }
      
      await settings.save();
      
      res.json({
        success: true,
        message: 'ShipRocket connection successful',
        data: {
          token: data.token,
          channelId: settings.shipping.shiprocketChannelId
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to connect to ShipRocket. Please check credentials.',
        error: data.message || 'Invalid credentials'
      });
    }
  } catch (error) {
    console.error('ShipRocket connection error:', error);
    res.status(500).json({
      success: false,
      message: 'Error testing ShipRocket connection',
      error: error.message
    });
  }
};

// Get ShipRocket pickup locations
export const getShipRocketPickupLocations = async (req, res) => {
  try {
    const userId = req.userId;
    const settings = await SettingsModel.findOne({ userId });
    
    if (!settings || !settings.shipping.shiprocketToken) {
      return res.status(400).json({
        success: false,
        message: 'ShipRocket not connected. Please connect first.'
      });
    }

    const response = await fetch('https://apiv2.shiprocket.in/v1/external/settings/company/pickup', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.shipping.shiprocketToken}`
      }
    });
    
    const data = await response.json();
    
    if (data.data) {
      res.json({
        success: true,
        data: data.data
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to fetch pickup locations',
        error: data.message
      });
    }
  } catch (error) {
    console.error('Error fetching pickup locations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pickup locations',
      error: error.message
    });
  }
};

// Create ShipRocket shipment
export const createShipRocketShipment = async (req, res) => {
  try {
    const userId = req.userId;
    const { orderData } = req.body;
    
    const settings = await SettingsModel.findOne({ userId });
    
    if (!settings || !settings.shipping.shiprocketToken) {
      return res.status(400).json({
        success: false,
        message: 'ShipRocket not connected. Please connect first.'
      });
    }

    // Prepare shipment data for ShipRocket
    const shipmentData = {
      order_id: orderData.orderId,
      order_date: orderData.orderDate,
      pickup_location: settings.shipping.defaultPickupLocation,
      channel_id: settings.shipping.shiprocketChannelId,
      comment: "Order from Mindzspark Shop",
      billing_customer_name: orderData.customerName,
      billing_last_name: "",
      billing_address: orderData.billingAddress,
      billing_city: orderData.billingCity,
      billing_pincode: orderData.billingPincode,
      billing_state: orderData.billingState,
      billing_country: orderData.billingCountry || "India",
      billing_email: orderData.customerEmail,
      billing_phone: orderData.customerPhone,
      shipping_is_billing: true,
      order_items: [{
        name: orderData.productName,
        sku: orderData.productSku || orderData.orderId,
        units: 1,
        selling_price: orderData.amount,
        discount: 0,
        tax: 0,
        hsn: 441122
      }],
      payment_method: orderData.paymentMethod === 'CASH ON DELIVERY' ? 'COD' : 'Prepaid',
      shipping_charges: 0,
      giftwrap_charges: 0,
      transaction_charges: 0,
      total_discount: 0,
      sub_total: orderData.amount,
      length: settings.shipping.defaultLength,
      breadth: settings.shipping.defaultBreadth,
      height: settings.shipping.defaultHeight,
      weight: settings.shipping.defaultWeight
    };

    const response = await fetch('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.shipping.shiprocketToken}`
      },
      body: JSON.stringify(shipmentData)
    });
    
    const data = await response.json();
    
    if (data.order_id) {
      res.json({
        success: true,
        message: 'Shipment created successfully',
        data: data
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to create shipment',
        error: data.message || data.errors
      });
    }
  } catch (error) {
    console.error('Error creating ShipRocket shipment:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating shipment',
      error: error.message
    });
  }
};

// Get ShipRocket tracking details
export const getShipRocketTracking = async (req, res) => {
  try {
    const userId = req.userId;
    const { shipmentId } = req.params;
    
    const settings = await SettingsModel.findOne({ userId });
    
    if (!settings || !settings.shipping.shiprocketToken) {
      return res.status(400).json({
        success: false,
        message: 'ShipRocket not connected. Please connect first.'
      });
    }

    const response = await fetch(`https://apiv2.shiprocket.in/v1/external/courier/track/shipment/${shipmentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.shipping.shiprocketToken}`
      }
    });
    
    const data = await response.json();
    
    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('Error fetching tracking details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tracking details',
      error: error.message
    });
  }
};