import Razorpay from 'razorpay'
import dotenv from 'dotenv'

dotenv.config()

let razorpay = null;

if(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET){
    razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    })
} else {
    console.log("Provide RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in the .env file for payment functionality")
}

export default razorpay 