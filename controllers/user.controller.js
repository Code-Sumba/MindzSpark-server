import sendEmail from '../config/sendEmail.js'
import UserModel from '../models/user.model.js'
import bcryptjs from 'bcryptjs'
import verifyEmailTemplate from '../utils/verifyEmailTemplate.js'
import generatedAccessToken from '../utils/generatedAccessToken.js'
import genertedRefreshToken from '../utils/generatedRefreshToken.js'
import uploadImageClodinary from '../utils/uploadImageClodinary.js'
import generatedOtp from '../utils/generatedOtp.js'
import forgotPasswordTemplate from '../utils/forgotPasswordTemplate.js'
import jwt from 'jsonwebtoken'
import sendSMS from '../utils/sendSMS.js'
import { mobileVerificationTemplate, loginOtpTemplate, forgotPasswordSmsTemplate } from '../utils/smsTemplates.js'

// Register with email or mobile
export async function registerUserController(request, response) {
    try {
        const { name, email, mobile, password, loginType = "email" } = request.body;

        if (!name || !password) {
            return response.status(400).json({
                message: "Provide name and password",
                error: true,
                success: false
            });
        }

        if (loginType === "email" && !email) {
            return response.status(400).json({
                message: "Provide email for email registration",
                error: true,
                success: false
            });
        }

        if (loginType === "mobile" && !mobile) {
            return response.status(400).json({
                message: "Provide mobile number for mobile registration",
                error: true,
                success: false
            });
        }

        // Check if user already exists
        let existingUser;
        if (loginType === "email") {
            existingUser = await UserModel.findOne({ email });
        } else {
            existingUser = await UserModel.findOne({ mobile });
        }

        if (existingUser) {
            return response.json({
                message: `Already registered ${loginType}`,
                error: true,
                success: false
            });
        }

        // Hash password
        const salt = await bcryptjs.genSalt(10);
        const hashPassword = await bcryptjs.hash(password, salt);

        // Create payload
        const payload = {
            name,
            password: hashPassword,
            login_type: loginType
        };

        if (loginType === "email") {
            payload.email = email;
        } else {
            payload.mobile = mobile;
        }

        // Save user
        const newUser = new UserModel(payload);
        const save = await newUser.save();

        if (loginType === "email") {
            // Send email verification
            const VerifyEmailUrl = `${process.env.FRONTEND_URL}/verify-email?code=${save?._id}`;
            
            await sendEmail({
                sendTo: email,
                subject: "Verify email from MindzSpark",
                html: verifyEmailTemplate({
                    name,
                    url: VerifyEmailUrl
                })
            });
        } else {
            // Send mobile OTP
            const otp = generatedOtp();
            const expireTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

            await UserModel.findByIdAndUpdate(save._id, {
                mobile_otp: otp,
                mobile_otp_expiry: expireTime
            });

            await sendSMS({
                mobile: mobile,
                message: mobileVerificationTemplate({ name, otp }),
                otp: otp
            });
        }

        return response.json({
            message: `User registered successfully. ${loginType === "email" ? "Check your email for verification" : "OTP sent to your mobile"}`,
            error: false,
            success: true,
            data: {
                _id: save._id,
                name: save.name,
                loginType: loginType
            }
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

// Verify mobile OTP
export async function verifyMobileOtpController(request, response) {
    try {
        const { mobile, otp } = request.body;

        if (!mobile || !otp) {
            return response.status(400).json({
                message: "Provide mobile number and OTP",
                error: true,
                success: false
            });
        }

        const user = await UserModel.findOne({ mobile });

        if (!user) {
            return response.status(400).json({
                message: "Mobile number not found",
                error: true,
                success: false
            });
        }

        const currentTime = new Date();

        if (user.mobile_otp_expiry < currentTime) {
            return response.status(400).json({
                message: "OTP is expired",
                error: true,
                success: false
            });
        }

        if (otp !== user.mobile_otp) {
            return response.status(400).json({
                message: "Invalid OTP",
                error: true,
                success: false
            });
        }

        // Update user as verified
        await UserModel.findByIdAndUpdate(user._id, {
            verify_mobile: true,
            mobile_otp: null,
            mobile_otp_expiry: null
        });

        return response.json({
            message: "Mobile number verified successfully",
            success: true,
            error: false
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

// Resend mobile OTP
export async function resendMobileOtpController(request, response) {
    try {
        const { mobile } = request.body;

        if (!mobile) {
            return response.status(400).json({
                message: "Provide mobile number",
                error: true,
                success: false
            });
        }

        const user = await UserModel.findOne({ mobile });

        if (!user) {
            return response.status(400).json({
                message: "Mobile number not found",
                error: true,
                success: false
            });
        }

        const otp = generatedOtp();
        const expireTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await UserModel.findByIdAndUpdate(user._id, {
            mobile_otp: otp,
            mobile_otp_expiry: expireTime
        });

        await sendSMS({
            mobile: mobile,
            message: mobileVerificationTemplate({ name: user.name, otp }),
            otp: otp
        });

        return response.json({
            message: "OTP sent successfully",
            error: false,
            success: true
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

export async function verifyEmailController(request, response) {
    try {
        const { code } = request.body;

        const user = await UserModel.findOne({ _id: code });

        if (!user) {
            return response.status(400).json({
                message: "Invalid code",
                error: true,
                success: false
            });
        }

        const updateUser = await UserModel.updateOne({ _id: code }, {
            verify_email: true
        });

        return response.json({
            message: "Verify email done",
            success: true,
            error: false
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

// Enhanced login controller supporting both email and mobile
export async function loginController(request, response) {
    try {
        const { email, mobile, password, loginType = "email" } = request.body;

        if (!password) {
            return response.status(400).json({
                message: "Provide password",
                error: true,
                success: false
            });
        }

        if (loginType === "email" && !email) {
            return response.status(400).json({
                message: "Provide email",
                error: true,
                success: false
            });
        }

        if (loginType === "mobile" && !mobile) {
            return response.status(400).json({
                message: "Provide mobile number",
                error: true,
                success: false
            });
        }

        let user;
        if (loginType === "email") {
            user = await UserModel.findOne({ email });
        } else {
            user = await UserModel.findOne({ mobile });
        }

        if (!user) {
            return response.status(400).json({
                message: "User not registered",
                error: true,
                success: false
            });
        }

        if (user.status !== "Active") {
            return response.status(400).json({
                message: "Contact to Admin",
                error: true,
                success: false
            });
        }

        const checkPassword = await bcryptjs.compare(password, user.password);

        if (!checkPassword) {
            return response.status(400).json({
                message: "Check your password",
                error: true,
                success: false
            });
        }

        const accesstoken = await generatedAccessToken(user._id);
        const refreshToken = await genertedRefreshToken(user._id);

        const updateUser = await UserModel.findByIdAndUpdate(user?._id, {
            last_login_date: new Date()
        });

        const cookiesOption = {
            httpOnly: true,
            secure: true,
            sameSite: "None"
        };
        response.cookie('accessToken', accesstoken, cookiesOption);
        response.cookie('refreshToken', refreshToken, cookiesOption);

        return response.json({
            message: "Login successfully",
            error: false,
            success: true,
            data: {
                accesstoken,
                refreshToken
            }
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

// Mobile OTP login (passwordless)
export async function mobileOtpLoginController(request, response) {
    try {
        const { mobile } = request.body;

        if (!mobile) {
            return response.status(400).json({
                message: "Provide mobile number",
                error: true,
                success: false
            });
        }

        const user = await UserModel.findOne({ mobile });

        if (!user) {
            return response.status(400).json({
                message: "Mobile number not registered",
                error: true,
                success: false
            });
        }

        if (user.status !== "Active") {
            return response.status(400).json({
                message: "Contact to Admin",
                error: true,
                success: false
            });
        }

        const otp = generatedOtp();
        const expireTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await UserModel.findByIdAndUpdate(user._id, {
            mobile_otp: otp,
            mobile_otp_expiry: expireTime
        });

        await sendSMS({
            mobile: mobile,
            message: loginOtpTemplate({ name: user.name, otp }),
            otp: otp
        });

        return response.json({
            message: "Login OTP sent successfully",
            error: false,
            success: true
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

// Verify mobile OTP for login
export async function verifyMobileLoginOtpController(request, response) {
    try {
        const { mobile, otp } = request.body;

        if (!mobile || !otp) {
            return response.status(400).json({
                message: "Provide mobile number and OTP",
                error: true,
                success: false
            });
        }

        const user = await UserModel.findOne({ mobile });

        if (!user) {
            return response.status(400).json({
                message: "Mobile number not found",
                error: true,
                success: false
            });
        }

        const currentTime = new Date();

        if (user.mobile_otp_expiry < currentTime) {
            return response.status(400).json({
                message: "OTP is expired",
                error: true,
                success: false
            });
        }

        if (otp !== user.mobile_otp) {
            return response.status(400).json({
                message: "Invalid OTP",
                error: true,
                success: false
            });
        }

        // Clear OTP
        await UserModel.findByIdAndUpdate(user._id, {
            mobile_otp: null,
            mobile_otp_expiry: null,
            last_login_date: new Date()
        });

        const accesstoken = await generatedAccessToken(user._id);
        const refreshToken = await genertedRefreshToken(user._id);

        const cookiesOption = {
            httpOnly: true,
            secure: true,
            sameSite: "None"
        };
        response.cookie('accessToken', accesstoken, cookiesOption);
        response.cookie('refreshToken', refreshToken, cookiesOption);

        return response.json({
            message: "Login successful",
            error: false,
            success: true,
            data: {
                accesstoken,
                refreshToken
            }
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

//logout controller
export async function logoutController(request, response) {
    try {
        const userid = request.userId //middleware

        const cookiesOption = {
            httpOnly: true,
            secure: true,
            sameSite: "None"
        }

        response.clearCookie("accessToken", cookiesOption)
        response.clearCookie("refreshToken", cookiesOption)

        const removeRefreshToken = await UserModel.findByIdAndUpdate(userid, {
            refresh_token: ""
        })

        return response.json({
            message: "Logout successfully",
            error: false,
            success: true
        })
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

//upload user avatar
export async function uploadAvatar(request, response) {
    try {
        const userId = request.userId // auth middlware
        const image = request.file  // multer middleware

        const upload = await uploadImageClodinary(image)

        const updateUser = await UserModel.findByIdAndUpdate(userId, {
            avatar: upload.url
        })

        return response.json({
            message: "upload profile",
            success: true,
            error: false,
            data: {
                _id: userId,
                avatar: upload.url
            }
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

//update user details
export async function updateUserDetails(request, response) {
    try {
        const userId = request.userId //auth middleware
        const { name, email, mobile, password } = request.body

        let hashPassword = ""

        if (password) {
            const salt = await bcryptjs.genSalt(10)
            hashPassword = await bcryptjs.hash(password, salt)
        }

        const updateUser = await UserModel.updateOne({ _id: userId }, {
            ...(name && { name: name }),
            ...(email && { email: email }),
            ...(mobile && { mobile: mobile }),
            ...(password && { password: hashPassword })
        })

        return response.json({
            message: "Updated successfully",
            error: false,
            success: true,
            data: updateUser
        })


    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

//forgot password not login
export async function forgotPasswordController(request, response) {
    try {
        const { email, mobile, resetType = "email" } = request.body;

        if (resetType === "email" && !email) {
            return response.status(400).json({
                message: "Email is required",
                error: true,
                success: false
            });
        }

        if (resetType === "mobile" && !mobile) {
            return response.status(400).json({
                message: "Mobile number is required",
                error: true,
                success: false
            });
        }

        let user;
        if (resetType === "email") {
            user = await UserModel.findOne({ email });
        } else {
            user = await UserModel.findOne({ mobile });
        }

        if (!user) {
            return response.status(400).json({
                message: `${resetType === "email" ? "Email" : "Mobile number"} not available`,
                error: true,
                success: false
            });
        }

        const otp = generatedOtp();
        const expireTime = new Date(Date.now() + 60 * 60 * 1000); // 1hr

        if (resetType === "email") {
            const update = await UserModel.findByIdAndUpdate(user._id, {
                forgot_password_otp: otp,
                forgot_password_expiry: expireTime
            });

            await sendEmail({
                sendTo: email,
                subject: "Forgot password from Mindzspark",
                html: forgotPasswordTemplate({
                    name: user.name,
                    otp: otp
                })
            });

            return response.json({
                message: "Check your email",
                error: false,
                success: true
            });
        } else {
            const update = await UserModel.findByIdAndUpdate(user._id, {
                mobile_otp: otp,
                mobile_otp_expiry: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes for SMS
            });

            await sendSMS({
                mobile: mobile,
                message: forgotPasswordSmsTemplate({ name: user.name, otp }),
                otp: otp
            });

            return response.json({
                message: "OTP sent to your mobile",
                error: false,
                success: true
            });
        }

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

//verify forgot password otp
export async function verifyForgotPasswordOtp(request, response) {
    try {
        const { email, mobile, otp, resetType = "email" } = request.body;

        if (!otp) {
            return response.status(400).json({
                message: "Provide OTP",
                error: true,
                success: false
            });
        }

        if (resetType === "email" && !email) {
            return response.status(400).json({
                message: "Provide email",
                error: true,
                success: false
            });
        }

        if (resetType === "mobile" && !mobile) {
            return response.status(400).json({
                message: "Provide mobile number",
                error: true,
                success: false
            });
        }

        let user;
        if (resetType === "email") {
            user = await UserModel.findOne({ email });
        } else {
            user = await UserModel.findOne({ mobile });
        }

        if (!user) {
            return response.status(400).json({
                message: `${resetType === "email" ? "Email" : "Mobile number"} not available`,
                error: true,
                success: false
            });
        }

        const currentTime = new Date();
        let otpField, expiryField;

        if (resetType === "email") {
            otpField = user.forgot_password_otp;
            expiryField = user.forgot_password_expiry;
        } else {
            otpField = user.mobile_otp;
            expiryField = user.mobile_otp_expiry;
        }

        if (expiryField < currentTime) {
            return response.status(400).json({
                message: "OTP is expired",
                error: true,
                success: false
            });
        }

        if (otp !== otpField) {
            return response.status(400).json({
                message: "Invalid OTP",
                error: true,
                success: false
            });
        }

        // Clear OTP fields
        const updateFields = {};
        if (resetType === "email") {
            updateFields.forgot_password_otp = "";
            updateFields.forgot_password_expiry = "";
        } else {
            updateFields.mobile_otp = null;
            updateFields.mobile_otp_expiry = null;
        }

        await UserModel.findByIdAndUpdate(user._id, updateFields);

        return response.json({
            message: "Verify OTP successfully",
            error: false,
            success: true
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

//reset the password
export async function resetpassword(request, response) {
    try {
        const { email, mobile, newPassword, confirmPassword, resetType = "email" } = request.body;

        if (!newPassword || !confirmPassword) {
            return response.status(400).json({
                message: "provide required fields newPassword, confirmPassword"
            });
        }

        if (resetType === "email" && !email) {
            return response.status(400).json({
                message: "Provide email",
                error: true,
                success: false
            });
        }

        if (resetType === "mobile" && !mobile) {
            return response.status(400).json({
                message: "Provide mobile number",
                error: true,
                success: false
            });
        }

        let user;
        if (resetType === "email") {
            user = await UserModel.findOne({ email });
        } else {
            user = await UserModel.findOne({ mobile });
        }

        if (!user) {
            return response.status(400).json({
                message: `${resetType === "email" ? "Email" : "Mobile number"} is not available`,
                error: true,
                success: false
            });
        }

        if (newPassword !== confirmPassword) {
            return response.status(400).json({
                message: "newPassword and confirmPassword must be same.",
                error: true,
                success: false,
            });
        }

        const salt = await bcryptjs.genSalt(10);
        const hashPassword = await bcryptjs.hash(newPassword, salt);

        const update = await UserModel.findByIdAndUpdate(user._id, {
            password: hashPassword
        });

        return response.json({
            message: "Password updated successfully.",
            error: false,
            success: true
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

//refresh token controler
export async function refreshToken(request, response) {
    try {
        const refreshToken = request.cookies.refreshToken || request?.headers?.authorization?.split(" ")[1]  /// [ Bearer token]

        if (!refreshToken) {
            return response.status(401).json({
                message: "Invalid token",
                error: true,
                success: false
            })
        }

        const verifyToken = await jwt.verify(refreshToken, process.env.SECRET_KEY_REFRESH_TOKEN)

        if (!verifyToken) {
            return response.status(401).json({
                message: "token is expired",
                error: true,
                success: false
            })
        }

        const userId = verifyToken?._id

        const newAccessToken = await generatedAccessToken(userId)

        const cookiesOption = {
            httpOnly: true,
            secure: true,
            sameSite: "None"
        }

        response.cookie('accessToken', newAccessToken, cookiesOption)

        return response.json({
            message: "New Access token generated",
            error: false,
            success: true,
            data: {
                accessToken: newAccessToken
            }
        })


    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

//get login user details
export async function userDetails(request, response) {
    try {
        const userId = request.userId

        console.log(userId)

        const user = await UserModel.findById(userId).select('-password -refresh_token')

        return response.json({
            message: 'user details',
            data: user,
            error: false,
            success: true
        })
    } catch (error) {
        return response.status(500).json({
            message: "Something is wrong",
            error: true,
            success: false
        })
    }
}

export async function getAllUsers(req, res) {
    try {
        const users = await UserModel.find();
        return res.json({
            message: "Users fetched successfully",
            data: users,
            error: false,
            success: true
        });
    } catch (error) {
        console.error("Error in getAllUsers:", error.message);
        console.error("Error in getAllUsers:", error);
        return res.status(500).json({
            message: "Something went wrong",
            error: true,
            success: false
        });
    }
}

// Wishlist: Add to wishlist
export async function addToWishlist(request, response) {
    try {
        const userId = request.userId;
        const { productId } = request.body;
        if (!productId) {
            return response.status(400).json({
                message: "Product ID is required",
                error: true,
                success: false
            });
        }
        const user = await UserModel.findById(userId);
        if (!user) {
            return response.status(404).json({
                message: "User not found",
                error: true,
                success: false
            });
        }
        if (user.wishlist.includes(productId)) {
            return response.json({
                message: "Product already in wishlist",
                error: false,
                success: true
            });
        }
        user.wishlist.push(productId);
        await user.save();
        return response.json({
            message: "Product added to wishlist",
            error: false,
            success: true
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

// Wishlist: Remove from wishlist
export async function removeFromWishlist(request, response) {
    try {
        const userId = request.userId;
        const { productId } = request.body;
        if (!productId) {
            return response.status(400).json({
                message: "Product ID is required",
                error: true,
                success: false
            });
        }
        const user = await UserModel.findById(userId);
        if (!user) {
            return response.status(404).json({
                message: "User not found",
                error: true,
                success: false
            });
        }
        user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
        await user.save();
        return response.json({
            message: "Product removed from wishlist",
            error: false,
            success: true
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

// Wishlist: Get wishlist
export async function getWishlist(request, response) {
    try {
        const userId = request.userId;
        const user = await UserModel.findById(userId).populate('wishlist');
        if (!user) {
            return response.status(404).json({
                message: "User not found",
                error: true,
                success: false
            });
        }
        return response.json({
            message: "Wishlist fetched successfully",
            error: false,
            success: true,
            data: user.wishlist
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

// Get KYC verification status
export async function getKycStatus(request, response) {
    try {
        const userId = request.userId;
        const user = await UserModel.findById(userId).select('email mobile verify_email verify_mobile');

        if (!user) {
            return response.status(404).json({
                message: "User not found",
                error: true,
                success: false
            });
        }

        const kycStatus = {
            email: {
                provided: !!user.email,
                verified: user.verify_email || false,
                value: user.email || null
            },
            mobile: {
                provided: !!user.mobile,
                verified: user.verify_mobile || false,
                value: user.mobile || null
            },
            overallStatus: (user.email && user.verify_email) || (user.mobile && user.verify_mobile) ? 'verified' : 'pending'
        };

        return response.json({
            message: "KYC status retrieved successfully",
            data: kycStatus,
            error: false,
            success: true
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

// Send email verification
export async function sendEmailVerification(request, response) {
    try {
        const userId = request.userId;
        const user = await UserModel.findById(userId);

        if (!user) {
            return response.status(404).json({
                message: "User not found",
                error: true,
                success: false
            });
        }

        if (!user.email) {
            return response.status(400).json({
                message: "No email address found for this account",
                error: true,
                success: false
            });
        }

        if (user.verify_email) {
            return response.json({
                message: "Email is already verified",
                error: false,
                success: true
            });
        }

        // Send email verification
        const VerifyEmailUrl = `${process.env.FRONTEND_URL}/verify-email?code=${user._id}`;
        
        await sendEmail({
            sendTo: user.email,
            subject: "Verify email from MindzSpark",
            html: verifyEmailTemplate({
                name: user.name,
                url: VerifyEmailUrl
            })
        });

        return response.json({
            message: "Verification email sent successfully",
            error: false,
            success: true
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

// Send mobile verification OTP
export async function sendMobileVerificationOtp(request, response) {
    try {
        const userId = request.userId;
        const user = await UserModel.findById(userId);

        if (!user) {
            return response.status(404).json({
                message: "User not found",
                error: true,
                success: false
            });
        }

        if (!user.mobile) {
            return response.status(400).json({
                message: "No mobile number found for this account",
                error: true,
                success: false
            });
        }

        if (user.verify_mobile) {
            return response.json({
                message: "Mobile number is already verified",
                error: false,
                success: true
            });
        }

        const otp = generatedOtp();
        const expireTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await UserModel.findByIdAndUpdate(userId, {
            mobile_otp: otp,
            mobile_otp_expiry: expireTime
        });

        await sendSMS({
            mobile: user.mobile,
            message: mobileVerificationTemplate({ name: user.name, otp }),
            otp: otp
        });

        return response.json({
            message: "OTP sent successfully",
            error: false,
            success: true
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

// Add email to account
export async function addEmailToAccount(request, response) {
    try {
        const userId = request.userId;
        const { email } = request.body;

        if (!email) {
            return response.status(400).json({
                message: "Email is required",
                error: true,
                success: false
            });
        }

        // Check if email already exists
        const existingUser = await UserModel.findOne({ email, _id: { $ne: userId } });
        if (existingUser) {
            return response.status(400).json({
                message: "Email is already registered with another account",
                error: true,
                success: false
            });
        }

        const user = await UserModel.findByIdAndUpdate(userId, {
            email: email,
            verify_email: false
        }, { new: true });

        // Send verification email
        const VerifyEmailUrl = `${process.env.FRONTEND_URL}/verify-email?code=${userId}`;
        
        await sendEmail({
            sendTo: email,
            subject: "Verify email from MindzSpark",
            html: verifyEmailTemplate({
                name: user.name,
                url: VerifyEmailUrl
            })
        });

        return response.json({
            message: "Email added successfully. Verification email sent.",
            error: false,
            success: true
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

// Add mobile to account
export async function addMobileToAccount(request, response) {
    try {
        const userId = request.userId;
        const { mobile } = request.body;

        if (!mobile) {
            return response.status(400).json({
                message: "Mobile number is required",
                error: true,
                success: false
            });
        }

        // Validate mobile number
        const mobileRegex = /^[6-9]\d{9}$/;
        if (!mobileRegex.test(mobile)) {
            return response.status(400).json({
                message: "Please enter a valid 10-digit mobile number",
                error: true,
                success: false
            });
        }

        // Check if mobile already exists
        const existingUser = await UserModel.findOne({ mobile, _id: { $ne: userId } });
        if (existingUser) {
            return response.status(400).json({
                message: "Mobile number is already registered with another account",
                error: true,
                success: false
            });
        }

        const otp = generatedOtp();
        const expireTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        const user = await UserModel.findByIdAndUpdate(userId, {
            mobile: mobile,
            verify_mobile: false,
            mobile_otp: otp,
            mobile_otp_expiry: expireTime
        }, { new: true });

        await sendSMS({
            mobile: mobile,
            message: mobileVerificationTemplate({ name: user.name, otp }),
            otp: otp
        });

        return response.json({
            message: "Mobile number added successfully. OTP sent for verification.",
            error: false,
            success: true
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}