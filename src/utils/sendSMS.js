// SMS service utility - You can integrate with services like Twilio, AWS SNS, or any Indian SMS provider
// For demo purposes, this will log the OTP to console

const sendSMS = async ({ mobile, message, otp }) => {
    try {
        // For development - log to console
        console.log(`SMS to ${mobile}: ${message}`);
        console.log(`OTP: ${otp}`);
        
        // In production, integrate with SMS service like:
        // - Twilio
        // - AWS SNS
        // - TextLocal
        // - MSG91
        // - Fast2SMS
        
        /*
        Example with Twilio:
        const twilio = require('twilio');
        const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        
        const result = await client.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: `+91${mobile}`
        });
        
        return result;
        */
        
        // For now, return success
        return {
            success: true,
            message: "SMS sent successfully"
        };
        
    } catch (error) {
        console.error("SMS sending error:", error);
        throw new Error("Failed to send SMS");
    }
};

export default sendSMS;