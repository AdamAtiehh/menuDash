const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const Category = require('../models/Category');

// Get all items
router.get('/items', async (req, res) => {
  try {
    const items = await Item.find().populate('category');
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new item
router.post('/items', async (req, res) => {
  try {
    const newItem = await Item.create(req.body);
    res.status(201).json(newItem);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Create new category
router.post('/categories', async (req, res) => {
  try {
    const newCat = await Category.create(req.body);
    res.status(201).json(newCat);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
