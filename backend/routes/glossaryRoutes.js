import express from 'express';
import multer from 'multer';
import mongoose from 'mongoose';
import GlossaryTask from '../models/GlossaryTask.js';

// Multer memory storage (file stays in RAM, then goes to MongoDB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

// Helper to get GridFS bucket
const getGridFSBucket = () => {
  return new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: 'glossaryFiles',
  });
};

const router = express.Router();

// Get all glossary tasks
router.get('/', async (req, res) => {
  try {
    const tasks = await GlossaryTask.find().sort({ createdAt: -1 });
    res.json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single glossary task
router.get('/:id', async (req, res) => {
  try {
    const task = await GlossaryTask.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Download file for a task (stream from GridFS)
router.get('/:id/download', async (req, res) => {
  try {
    const task = await GlossaryTask.findById(req.params.id);
    if (!task || !task.fileId) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    const bucket = getGridFSBucket();
    const downloadStream = bucket.openDownloadStream(task.fileId);

    res.set('Content-Disposition', `attachment; filename="${task.fileOriginalName || 'document'}"`);
    downloadStream.pipe(res);

    downloadStream.on('error', () => {
      res.status(404).json({ success: false, message: 'File not found in database' });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create glossary task with file upload to GridFS
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const taskData = {
      title: req.body.title,
      description: req.body.description,
      accountable: req.body.accountable,
      createdBy: req.body.createdBy,
      createdDate: req.body.createdDate || undefined,
    };

    // Upload file to GridFS if provided
    if (req.file) {
      const bucket = getGridFSBucket();
      const uploadStream = bucket.openUploadStream(req.file.originalname, {
        contentType: req.file.mimetype,
      });

      uploadStream.end(req.file.buffer);

      await new Promise((resolve, reject) => {
        uploadStream.on('finish', resolve);
        uploadStream.on('error', reject);
      });

      taskData.fileId = uploadStream.id;
      taskData.fileOriginalName = req.file.originalname;
    }

    const task = await GlossaryTask.create(taskData);
    res.status(201).json({ success: true, data: task });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update glossary task
router.put('/:id', upload.single('file'), async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (req.file) {
      // Delete old file from GridFS if exists
      const oldTask = await GlossaryTask.findById(req.params.id);
      if (oldTask?.fileId) {
        const bucket = getGridFSBucket();
        try { await bucket.delete(oldTask.fileId); } catch (e) { /* old file cleanup */ }
      }

      // Upload new file to GridFS
      const bucket = getGridFSBucket();
      const uploadStream = bucket.openUploadStream(req.file.originalname, {
        contentType: req.file.mimetype,
      });

      uploadStream.end(req.file.buffer);

      await new Promise((resolve, reject) => {
        uploadStream.on('finish', resolve);
        uploadStream.on('error', reject);
      });

      updateData.fileId = uploadStream.id;
      updateData.fileOriginalName = req.file.originalname;
    }

    const task = await GlossaryTask.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.json({ success: true, data: task });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete glossary task
router.delete('/:id', async (req, res) => {
  try {
    const task = await GlossaryTask.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Delete file from GridFS if exists
    if (task.fileId) {
      const bucket = getGridFSBucket();
      try { await bucket.delete(task.fileId); } catch (e) { /* file cleanup */ }
    }

    await GlossaryTask.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
