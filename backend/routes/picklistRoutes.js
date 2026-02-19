import express from 'express';
import Picklist from '../models/Picklist.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// GET /api/picklists - Get all picklists
router.get('/', async (req, res) => {
  try {
    const picklists = await Picklist.find().sort('name');
    res.json({ success: true, data: picklists });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/picklists/:name - Get single picklist by name
router.get('/:name', async (req, res) => {
  try {
    const picklist = await Picklist.findOne({ name: req.params.name });
    if (!picklist) {
      return res.status(404).json({ message: 'Picklist not found' });
    }
    res.json({ success: true, data: picklist });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/picklists/:name/items - Add item to a picklist (any authenticated user)
router.post('/:name/items', async (req, res) => {
  try {
    const { value, label } = req.body;
    if (!value || !label) {
      return res.status(400).json({ message: 'Value and label are required' });
    }

    const picklist = await Picklist.findOne({ name: req.params.name });
    if (!picklist) {
      return res.status(404).json({ message: 'Picklist not found' });
    }

    // Check for duplicate value
    const duplicate = picklist.items.find(
      item => item.value.toLowerCase() === value.toLowerCase() && item.isActive
    );
    if (duplicate) {
      return res.status(400).json({ message: 'This item already exists in the picklist' });
    }

    // Get max order for new item
    const maxOrder = picklist.items.length > 0
      ? Math.max(...picklist.items.map(i => i.order)) + 1
      : 1;

    picklist.items.push({ value, label, order: maxOrder, isActive: true });
    await picklist.save();

    res.status(201).json({ success: true, data: picklist });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE /api/picklists/:name/items/:itemId - Remove item (admin only)
router.delete('/:name/items/:itemId', authorize('administrator'), async (req, res) => {
  try {
    const picklist = await Picklist.findOne({ name: req.params.name });
    if (!picklist) {
      return res.status(404).json({ message: 'Picklist not found' });
    }

    const item = picklist.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    item.isActive = false;
    await picklist.save();

    res.json({ success: true, data: picklist });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
