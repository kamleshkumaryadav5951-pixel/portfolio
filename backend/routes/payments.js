import express from 'express';
import mongoose from 'mongoose';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Note from '../models/Note.js';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

const getRazorpayInstance = () => {
  if (!razorpayInstance) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay credentials missing in environment');
    }
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
  }
  return razorpayInstance;
};

router.post('/create-order', async (req, res) => {
  try {
    const { noteId } = req.body;
    const note = await Note.findById(noteId);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    if (note.isFree) return res.status(400).json({ message: 'Note is free' });

    const amount = note.price * 100; // Amount in paise
    const options = {
      amount,
      currency: 'INR',
      receipt: `receipt_order_${Date.now()}`
    };

    const order = await getRazorpayInstance().orders.create(options);
    
    // Log transaction
    await Transaction.create({
      userId: req.user._id,
      noteId: note._id,
      razorpayOrderId: order.id,
      amount: note.price
    });

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong with payment creation' });
  }
});

router.post('/verify-payment', async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    
    const secret = process.env.RAZORPAY_KEY_SECRET;
    const bodyUrl = razorpayOrderId + '|' + razorpayPaymentId;
    
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(bodyUrl.toString())
      .digest('hex');
      
    const isAuthentic = expectedSignature === razorpaySignature;
    
    if (isAuthentic) {
      await Transaction.findOneAndUpdate(
        { razorpayOrderId },
        { status: 'success', razorpayPaymentId, razorpaySignature }
      );
      
      const transaction = await Transaction.findOne({ razorpayOrderId });
      if (transaction) {
         await User.findByIdAndUpdate(req.user._id, { $addToSet: { purchasedNotes: transaction.noteId } });
      }

      res.status(200).json({ message: 'Payment verified and note unlocked successfully' });
    } else {
      res.status(400).json({ message: 'Invalid Signature' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Signature verification failed' });
  }
});

export default router;
