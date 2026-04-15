import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Note from './models/Note.js';

dotenv.config();

const dummyNotes = [
  { title: 'Mastering Dynamic Programming', description: 'Advanced DP concepts', category: 'DP', isFree: false, price: 99, url: 'https://example.com/dp', tags: ['advanced', 'memoization'] },
  { title: 'Graph Algorithms Cheatsheet', description: 'All about graphs', category: 'Graphs', isFree: true, price: 0, url: 'https://example.com/graphs', tags: ['bfs', 'dfs'] },
  { title: 'Advanced System Design', description: 'Scalable architecture concepts', category: 'Architecture', isFree: false, price: 149, url: 'https://example.com/sys', tags: ['scalability'] }
];

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB for Seeding...');
    await Note.deleteMany({});
    await Note.insertMany(dummyNotes);
    console.log('Dummy Notes inserted successfully!');
    process.exit();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
