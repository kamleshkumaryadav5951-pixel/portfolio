import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import OTP from '../models/OTP.js';
import { protect } from '../middlewares/auth.js';
import nodemailer from 'nodemailer';
import twilio from 'twilio';
import { OAuth2Client } from 'google-auth-library';

const router = express.Router();

const generateToken = (id) => {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET missing');
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Google Auth setup
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Email and SMS setups
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const twilioClient = process.env.TWILIO_ACCOUNT_SID ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN) : null;

router.post('/google', async (req, res) => {
  const { token } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID, 
    });
    const payload = ticket.getPayload();
    const { email, name, sub: googleId } = payload;

    let user = await User.findOne({ email });

    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        user.isVerified = true;
        await user.save();
      }
    } else {
      user = await User.create({
        name,
        email,
        googleId,
        isVerified: true
      });
    }

    res.json({ _id: user._id, name: user.name, email: user.email, role: user.role, token: generateToken(user._id) });
  } catch (error) {
    res.status(401).json({ message: 'Google Authentication failed', details: error.message });
  }
});

router.post('/send-otp', async (req, res) => {
  const { email, phone } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });
    
    // Generate a 6-digit OTP 
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    await OTP.deleteMany({ email });
    await OTP.create({ email, otp: otpCode });
    
    let emailSent = false;
    if (email) {
      try {
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your Account Verification OTP',
            text: `Your OTP for registration is: ${otpCode}. It is valid for 5 minutes.`
          });
          console.log(`Email OTP sent to ${email}`);
          emailSent = true;
        } else {
          console.warn('EMAIL_USER/EMAIL_PASS not configured in .env. Falling back to console log.');
          console.log(`[SIMULATED EMAIL] To: ${email} -> OTP: ${otpCode}`);
        }
      } catch (err) {
        console.error('Failed to send email:', err);
      }
    }

    let smsSent = false;
    if (phone) {
      try {
        if (twilioClient && process.env.TWILIO_PHONE_NUMBER) {
          await twilioClient.messages.create({
            body: `Your OTP for registration is: ${otpCode}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phone
          });
          console.log(`SMS OTP sent to ${phone}`);
          smsSent = true;
        } else {
          console.warn('Twilio credentials not configured in .env. Falling back to console log.');
          console.log(`[SIMULATED SMS] To: ${phone} -> OTP: ${otpCode}`);
        }
      } catch (err) {
        console.error('Failed to send SMS:', err);
      }
    }

    res.status(200).json({ 
      message: 'OTP processed successfully. Please check your email/phone.', 
      simulatedOtp: (process.env.NODE_ENV !== 'production' && !emailSent && !smsSent ? otpCode : undefined) 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/register', async (req, res) => {
  const { name, email, phone, password, otp } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const otpRecord = await OTP.findOne({ email });
    if (!otpRecord) {
      return res.status(400).json({ message: 'OTP expired or not requested.' });
    }
    if (otpRecord.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP code.' });
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const user = await User.create({ name, email, phone, password: hashedPassword, isVerified: true });
    
    await OTP.deleteOne({ email });

    if (user) {
      res.status(201).json({ _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, token: generateToken(user._id) });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    if (!user.password) {
      return res.status(401).json({ message: 'Please log in with Google.' });
    }

    if (await bcrypt.compare(password, user.password)) {
      res.json({ _id: user._id, name: user.name, email: user.email, role: user.role, token: generateToken(user._id) });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/profile', protect, async (req, res) => {
  const user = await User.findById(req.user._id).populate('purchasedNotes');
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

export default router;
