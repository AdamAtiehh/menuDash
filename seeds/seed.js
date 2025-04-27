// seed.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Category = require('../BillzCafe-main/models/Category');
const Item = require('../BillzCafe-main/models/Items');

const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Category.deleteMany();
    await Item.deleteMany();

    // Insert Categories
    const categories = await Category.insertMany([
      { name: 'Coffee', icon: 'fa-solid fa-mug-hot' },
      { name: 'Desserts', icon: 'fa-solid fa-cookie-bite' },
      { name: 'Sandwiches', icon: 'fa-solid fa-bread-slice' }
    ]);

    const coffeeCat = categories.find(c => c.name === 'Coffee');
    const dessertsCat = categories.find(c => c.name === 'Desserts');
    const sandwichCat = categories.find(c => c.name === 'Sandwiches');

    // Insert Items
    await Item.insertMany([
      {
        name: 'Cappuccino',
        description: 'Espresso with steamed milk and foam.',
        price: 85000,
        image: 'coffee.png',
        category: coffeeCat._id
      },
      {
        name: 'Latte',
        description: 'Smooth coffee with a touch of milk.',
        price: 90000,
        image: 'latte.jpg',
        category: coffeeCat._id
      },
      {
        name: 'Chocolate Brownie',
        description: 'Rich chocolate dessert with a gooey center.',
        price: 60000,
        image: 'brownie.jpg',
        category: dessertsCat._id
      },
      {
        name: 'Cheesecake Slice',
        description: 'Classic creamy cheesecake.',
        price: 75000,
        image: 'cheesecake.jpg',
        category: dessertsCat._id
      },
      {
        name: 'Chicken Club Sandwich',
        description: 'Grilled chicken with lettuce, tomato, and mayo.',
        price: 95000,
        image: 'sandwich.jpg',
        category: sandwichCat._id
      }
    ]);

    console.log('🌱 Database seeded successfully!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
