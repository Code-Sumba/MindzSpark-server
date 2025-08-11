// src/controllers/otp.controller.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { saveOtp, verifyOtp } from "../utils/otpStore.js";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: 'mindsparktech5@gmail.com',
    pass: 'hqjfsolftzlwxhut',
  },
});

export const sendOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email required" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  saveOtp(email, otp); // 5 min default TTL

  const mailOptions = {
    from: process.env.MAIL_USER,
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true, message: "OTP sent" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Mail error", error });
  }
};

export const verifyOtpController = (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ message: "Email and OTP required" });

  const isValid = verifyOtp(email, otp);
  if (!isValid) return res.status(400).json({ success: false, message: "Invalid or expired OTP" });

  return res.status(200).json({ success: true, message: "OTP verified" });
};
