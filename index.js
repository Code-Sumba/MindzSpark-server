import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import helmet from 'helmet'
import connectDB from './config/connectDB.js'
import userRouter from './route/user.route.js'
import categoryRouter from './route/category.route.js'
import uploadRouter from './route/upload.router.js'
import subCategoryRouter from './route/subCategory.route.js'
import productRouter from './route/product.route.js'
import cartRouter from './route/cart.route.js'
import addressRouter from './route/address.route.js'
import orderRouter from './route/order.route.js'
import reviewRouter from './route/review.route.js'
import questionRouter from './route/question.route.js'
import notificationRouter from './route/notification.route.js'
import bannerRouter from './route/banner.route.js'
import settingsRouter from './route/settings.route.js'

const app = express()
// app.use(cors({
//     credentials : true,
//     origin : process.env.FRONTEND_URL
// }))
app.use(express.json())
app.use(cookieParser())
// app.use(morgan('combined')) // Morgan is an HTTP request logger middleware for Node.js

// helmet avoid webapps getting hacked easily
app.use(helmet({
    crossOriginResourcePolicy : false
}))
const allowedOrigins = [
  'http://localhost:5173', // shop frontend
  'http://localhost:5174'  // admin panel frontend
];

app.use(cors({
  credentials: true,
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

// || => this a OR condition
const PORT = 8080 || process.env.PORT 

// Starting the server.
app.get("/",(request,response)=>{
    ///server to client
    response.json({
        message : "Server is running " + PORT
    })
})

// Routes for handeling client requests
app.use('/api/user',userRouter)
app.use("/api/category",categoryRouter)
app.use("/api/file",uploadRouter)
app.use("/api/subcategory",subCategoryRouter)
app.use("/api/product",productRouter)
app.use("/api/cart",cartRouter)
app.use("/api/address",addressRouter)
app.use('/api/order',orderRouter)
app.use('/api/review', reviewRouter)
app.use('/api/question', questionRouter)
app.use('/api/notification', notificationRouter)
app.use('/api/banner', bannerRouter)
app.use('/api/settings', settingsRouter)

// connecting to database for database operations
connectDB().then(()=>{
    app.listen(PORT,()=>{
        console.log("Server is running",PORT)
    })
})

