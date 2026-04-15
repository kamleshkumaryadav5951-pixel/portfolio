import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true }, // e.g., Arrays, Graphs, DP
  type: { type: String, enum: ['PDF', 'Image', 'Markdown', 'ExternalURL'], default: 'PDF' },
  url: { type: String, required: true }, // URL of the file/viewer
  isFree: { type: Boolean, default: true },
  price: { type: Number, default: 0 }, // In smallest currency unit or standard depending on logic, will use standard rupees
  previewUrl: { type: String }, // Optional preview for paid notes
  tags: [{ type: String }]
}, { timestamps: true });

export default mongoose.model('Note', noteSchema);
