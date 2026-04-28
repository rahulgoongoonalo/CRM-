import express from 'express';
import Picklist from '../models/Picklist.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// GET /api/picklists - Get all picklists
router.get('/', async (req, res) => {
  try {
    const picklists = await Picklist.find().sort('label');
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
    const { value, label, type, dependsOn, showWhen } = req.body;
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

    picklist.items.push({ value, label, type, dependsOn, showWhen, order: maxOrder, isActive: true });
    await picklist.save();

    res.status(201).json({ success: true, data: picklist });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PATCH /api/picklists/:name/items/:itemId/move - Move item up/down (any authenticated user)
router.patch('/:name/items/:itemId/move', async (req, res) => {
  try {
    const { direction } = req.body; // 'up' or 'down'
    if (!['up', 'down'].includes(direction)) {
      return res.status(400).json({ message: 'direction must be "up" or "down"' });
    }

    const picklist = await Picklist.findOne({ name: req.params.name });
    if (!picklist) return res.status(404).json({ message: 'Picklist not found' });

    const sorted = [...picklist.items]
      .filter(i => i.isActive)
      .sort((a, b) => a.order - b.order);

    const idx = sorted.findIndex(i => i._id.toString() === req.params.itemId);
    if (idx === -1) return res.status(404).json({ message: 'Item not found' });

    const swapWith = direction === 'up' ? idx - 1 : idx + 1;
    if (swapWith < 0 || swapWith >= sorted.length) {
      return res.status(400).json({ message: `Cannot move ${direction} — already at the edge` });
    }

    // Swap order values
    const a = picklist.items.id(sorted[idx]._id);
    const b = picklist.items.id(sorted[swapWith]._id);
    const tmp = a.order;
    a.order = b.order;
    b.order = tmp;

    await picklist.save();
    res.json({ success: true, data: picklist });
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

    // Try finding by subdocument _id first, then fall back to string match
    let item = picklist.items.id(req.params.itemId);
    if (!item) {
      item = picklist.items.find(i => i._id.toString() === req.params.itemId);
    }
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Actually remove the item from the array
    picklist.items.pull(item._id);
    await picklist.save();

    res.json({ success: true, data: picklist });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
