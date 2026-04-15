import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Note from './models/Note.js';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    const notes = await Note.find({});
    console.log('Notes in DB:', JSON.stringify(notes, null, 2));
    process.exit();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
