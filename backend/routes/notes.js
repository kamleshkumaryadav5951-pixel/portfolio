import express from 'express';
import Note from '../models/Note.js';
import { protect, adminProtect } from '../middlewares/auth.js';
import { upload } from '../config/cloudinaryConfig.js';

const router = express.Router();

// Get all notes (Public, but URLs of paid notes are hidden unless purchased)
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    
    const notes = await Note.find(filter);
    
    // Sanitize notes: only show URL if note is free
    const sanitizedNotes = notes.map(note => {
      const n = note.toObject();
      if (n.isFree) {
        return n;
      }
      delete n.url;
      return n;
    });
    
    res.json(sanitizedNotes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific note
router.get('/:id', protect, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    
    // Check access
    const isPurchased = req.user.purchasedNotes.includes(note._id);
    if (note.isFree || isPurchased || req.user.role === 'admin') {
      res.json(note);
    } else {
      // Send preview only
      const previewNote = { ...note._doc };
      delete previewNote.url;
      res.json({ ...previewNote, isLocked: true });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin routes
// Support both file upload and direct URL (if no file provided)
router.post('/', protect, adminProtect, upload.single('file'), async (req, res) => {
  try {
    const noteData = { ...req.body };
    
    // If a file was uploaded, use the Cloudinary URL
    if (req.file) {
      noteData.url = req.file.path;
      // Automatically detect type if not provided
      if (!noteData.type) {
        noteData.type = req.file.mimetype.includes('pdf') ? 'PDF' : 'Image';
      }
    }

    // Process tags if they arrived as a comma-separated string from FormData
    if (typeof noteData.tags === 'string') {
      noteData.tags = noteData.tags.split(',').map(tag => tag.trim()).filter(Boolean);
    }

    const note = await Note.create(noteData);
    res.status(201).json(note);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', protect, adminProtect, upload.single('file'), async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    if (req.file) {
      updateData.url = req.file.path;
    }

    if (typeof updateData.tags === 'string') {
      updateData.tags = updateData.tags.split(',').map(tag => tag.trim()).filter(Boolean);
    }

    const note = await Note.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(note);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', protect, adminProtect, async (req, res) => {
  try {
    await Note.findByIdAndDelete(req.params.id);
    res.json({ message: 'Note removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
