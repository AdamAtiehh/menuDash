const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
require('dotenv').config();
const Admin = require('./BillzCafe-main/models/Admin');
const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');
const Category = require('./BillzCafe-main/models/Category');
const Item = require('./BillzCafe-main/models/Items');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'BillzCafe-main')));
app.use('/images', express.static(path.join(__dirname, 'BillzCafe-main/images')));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, 'BillzCafe-main/images');
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// Routes
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'BillzCafe-main', 'index.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'BillzCafe-main', 'login.html')));
app.get('/main', (req, res) => res.sendFile(path.join(__dirname, 'BillzCafe-main', 'main.html')));
app.get('/manage-items', (req, res) => res.sendFile(path.join(__dirname, 'BillzCafe-main', 'manageItems.html')));
app.get('/manage-categories', (req, res) => res.sendFile(path.join(__dirname, 'BillzCafe-main', 'manageCategory.html')));
app.get('/settings', (req, res) => res.sendFile(path.join(__dirname, 'BillzCafe-main', 'settings.html')));

// Category APIs
app.get('/api/categories', async (req, res) => {
  const categories = await Category.find();
  res.json(categories);
});

app.post('/api/categories', async (req, res) => {
  const { name, icon } = req.body;
  try {
    const exists = await Category.findOne({ name });
    if (exists) return res.status(400).json({ error: 'Category already exists' });

    const category = new Category({ name, icon });
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/categories/:id', async (req, res) => {
  try {
    await Item.deleteMany({ category: req.params.id });
    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

app.put('/api/categories/:id', async (req, res) => {
  const { name, icon } = req.body;
  try {
    // Optional: Check if another category with the same name already exists (excluding current)
    const existing = await Category.findOne({ name, _id: { $ne: req.params.id } });
    if (existing) {
      return res.status(400).json({ error: 'Another category with this name already exists' });
    }

    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      { name, icon },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: 'Category not found' });

    res.json(updated);
  } catch (err) {
    console.error('Error updating category:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


// Item APIs
app.get('/api/items', async (req, res) => {
  const items = await Item.find().populate('category');
  res.json(items);
});

app.get('/api/items/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('category');
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/items', upload.single('image'), async (req, res) => {
  try {
    const { name, price, description, category } = req.body;
    if (!name || !price || !description || !category)
      return res.status(400).json({ error: 'Missing required fields' });

    const existing = await Item.findOne({ name });
    if (existing) return res.status(400).json({ error: 'Item name already exists' });

    const newItem = new Item({
      name,
      price,
      description,
      category,
      image: req.file?.filename || 'no-image-icon.png'
    });

    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/items/:id', upload.single('image'), async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    const { name, price, description, category } = req.body;
    if (!name || !price || !description || !category)
      return res.status(400).json({ error: 'Missing required fields' });

    item.name = name;
    item.price = price;
    item.description = description;
    item.category = category;
    if (req.file) item.image = req.file.filename;

    await item.save();
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

app.delete('/api/items/:id', async (req, res) => {
  try {
    await Item.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(401).json({ error: 'Invalid username or password' });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid username or password' });

    const token = jwt.sign({ id: admin._id }, JWT_SECRET, { expiresIn: '2h' });
    res.json({ token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


// ------------------------------
// ✅ Get all admins (for dropdowns or management)
app.get('/api/admins', async (req, res) => {
  try {
    const admins = await Admin.find({}, 'username'); // exclude passwords
    res.json(admins);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch admins' });
  }
});

// ✅ Add new admin

app.post('/api/admins', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Missing fields' });

  try {
    const exists = await Admin.findOne({ username });
    if (exists) return res.status(400).json({ error: 'Username already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({ username, password: hashed });
    await newAdmin.save();
    res.status(201).json({ message: 'Admin added' });
  } catch (err) {
    console.error('Add admin error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Change password

app.put('/api/admins/password', async (req, res) => {
  const { username, currentPassword, newPassword } = req.body;
  if (!username || !currentPassword || !newPassword) return res.status(400).json({ error: 'Missing fields' });

  try {
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(404).json({ error: 'Admin not found' });

    const match = await bcrypt.compare(currentPassword, admin.password);
    if (!match) return res.status(401).json({ error: 'Incorrect current password' });

    const hashed = await bcrypt.hash(newPassword, 10);
    admin.password = hashed;
    await admin.save();
    res.json({ message: 'Password updated' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Delete admin (not allowed if only one admin remains)
app.delete('/api/admins/:username', async (req, res) => {
  const { username } = req.params;

  try {
    const totalAdmins = await Admin.countDocuments();
    if (totalAdmins <= 1) return res.status(403).json({ error: 'Cannot delete the last admin' });

    await Admin.findOneAndDelete({ username });
    res.json({ message: 'Admin deleted' });
  } catch (err) {
    console.error('Delete admin error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

app.get('/test-db', async (req, res) => {
  const cats = await Category.find();
  res.json(cats);
});
