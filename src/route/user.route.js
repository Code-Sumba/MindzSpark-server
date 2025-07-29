import { Router } from 'express'
import { forgotPasswordController, loginController, logoutController, refreshToken, registerUserController, resetpassword, updateUserDetails, uploadAvatar, userDetails, verifyEmailController, verifyForgotPasswordOtp, getAllUsers, addToWishlist, removeFromWishlist, getWishlist } from '../controllers/user.controller.js'
import auth from '../middleware/auth.js'
import upload from '../middleware/multer.js'

const userRouter = Router()

userRouter.post('/register',registerUserController) // registering a user
userRouter.post('/verify-email',verifyEmailController) // verificaion of email
userRouter.post('/login',loginController) // login a user
userRouter.get('/logout',auth,logoutController) // logout a user
userRouter.put('/upload-avatar',auth,upload.single('avatar'),uploadAvatar) // upload a avtar of user
userRouter.put('/update-user',auth,updateUserDetails) // update user details uses protect route auth
userRouter.put('/forgot-password',forgotPasswordController) // if user forgot the password
userRouter.put('/verify-forgot-password-otp',verifyForgotPasswordOtp) // verification of forgot password otp
userRouter.put('/reset-password',resetpassword) // resetting the password
userRouter.post('/refresh-token',refreshToken) // refresh token Unclear now
userRouter.get('/user-details',auth,userDetails) // get method to get user details

userRouter.get('/get-all-users', getAllUsers)

userRouter.post('/wishlist/add', auth, addToWishlist)
userRouter.post('/wishlist/remove', auth, removeFromWishlist)
userRouter.get('/wishlist', auth, getWishlist)

export default userRouter