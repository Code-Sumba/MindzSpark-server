import { Router } from 'express'
import auth from '../middleware/auth.js'
import upload from '../middleware/multer.js'
import { 
    forgotPasswordController, 
    loginController, 
    logoutController, 
    refreshToken, 
    registerUserController, 
    resetpassword, 
    updateUserDetails, 
    uploadAvatar, 
    userDetails, 
    verifyEmailController, 
    verifyForgotPasswordOtp, 
    getAllUsers, 
    addToWishlist, 
    removeFromWishlist, 
    getWishlist,
    verifyMobileOtpController,
    resendMobileOtpController,
    mobileOtpLoginController,
    verifyMobileLoginOtpController,
    getKycStatus,
    sendEmailVerification,
    sendMobileVerificationOtp,
    addEmailToAccount,
    addMobileToAccount,
    confirmOrderEmail,
    verifyConfirmOrder
} from '../controllers/user.controller.js'
const userRouter = Router()

// userRouter.post('/register',registerUserController) // registering a user
// userRouter.post('/verify-email',verifyEmailController) // verificaion of email
// userRouter.post('/login',loginController) // login a user
// userRouter.get('/logout',auth,logoutController) // logout a user
// userRouter.put('/upload-avatar',auth,upload.single('avatar'),uploadAvatar) // upload a avtar of user
// userRouter.put('/update-user',auth,updateUserDetails) // update user details uses protect route auth
// userRouter.put('/forgot-password',forgotPasswordController) // if user forgot the password
// userRouter.put('/verify-forgot-password-otp',verifyForgotPasswordOtp) // verification of forgot password otp
// userRouter.put('/reset-password',resetpassword) // resetting the password
// userRouter.post('/refresh-token',refreshToken) // refresh token Unclear now
// userRouter.get('/user-details',auth,userDetails) // get method to get user details


// userRouter.get('/get-all-users', getAllUsers)

// userRouter.post('/wishlist/add', auth, addToWishlist)
// userRouter.post('/wishlist/remove', auth, removeFromWishlist)
// userRouter.get('/wishlist', auth, getWishlist)

// Registration and verification routes
userRouter.post('/register', registerUserController) // registering a user with email or mobile
userRouter.post('/verify-email', verifyEmailController) // verification of email
userRouter.post('/verify-mobile-otp', verifyMobileOtpController) // verification of mobile OTP
userRouter.post('/resend-mobile-otp', resendMobileOtpController) // resend mobile OTP

// Login routes
userRouter.post('/login', loginController) // login with email/mobile and password
userRouter.post('/mobile-otp-login', mobileOtpLoginController) // request OTP for mobile login
userRouter.post('/verify-mobile-login-otp', verifyMobileLoginOtpController) // verify OTP for mobile login

// User management routes
userRouter.get('/logout', auth, logoutController) // logout a user
userRouter.put('/upload-avatar', auth, upload.single('avatar'), uploadAvatar) // upload avatar
userRouter.put('/update-user', auth, updateUserDetails) // update user details
userRouter.get('/user-details', auth, userDetails) // get user details
userRouter.get('/get-all-users', getAllUsers) // get all users (admin)

// Password reset routes
userRouter.put('/forgot-password', forgotPasswordController) // forgot password (email/mobile)
userRouter.put('/verify-forgot-password-otp', verifyForgotPasswordOtp) // verify forgot password OTP
userRouter.put('/reset-password', resetpassword) // reset password

// Token management
userRouter.post('/refresh-token', refreshToken) // refresh access token

// KYC and verification routes
userRouter.get('/kyc-status', auth, getKycStatus) // get KYC verification status
userRouter.post('/send-email-verification', auth, sendEmailVerification) // send email verification
userRouter.post('/send-mobile-verification-otp', auth, sendMobileVerificationOtp) // send mobile verification OTP
userRouter.post('/add-email', auth, addEmailToAccount) // add email to account
userRouter.post('/add-mobile', auth, addMobileToAccount) // add mobile to account

// Wishlist routes
userRouter.post('/wishlist/add', auth, addToWishlist)
userRouter.post('/wishlist/remove', auth, removeFromWishlist)
userRouter.get('/wishlist', auth, getWishlist)

// Order confirmation routes
userRouter.put('/confirm-order', confirmOrderEmail ) // confirm order email
userRouter.put('/verify-confirm-order', verifyConfirmOrder ) // verify confirm order email

export default userRouter