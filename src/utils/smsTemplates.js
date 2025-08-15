export const mobileVerificationTemplate = ({ name, otp }) => {
    return `Hi ${name}, Your OTP for mobile verification at Mindzspark is ${otp}. Valid for 10 minutes. Do not share with anyone.`;
};

export const loginOtpTemplate = ({ name, otp }) => {
    return `Hi ${name}, Your login OTP for Mindzspark is ${otp}. Valid for 10 minutes. Do not share with anyone.`;
};

export const forgotPasswordSmsTemplate = ({ name, otp }) => {
    return `Hi ${name}, Your password reset OTP for Mindzspark is ${otp}. Valid for 10 minutes. Do not share with anyone.`;
};