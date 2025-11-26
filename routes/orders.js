const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');

/*
|--------------------------------------------------------------------------
| CREATE ORDER
|--------------------------------------------------------------------------
*/
router.post('/', async (req, res) => {
  try {
    const { userEmail, items, shippingAddress, totalAmount, notes } = req.body;

    if (!userEmail || !items || items.length === 0 || !shippingAddress || !totalAmount) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid order data'
      });
    }

    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    const count = await Order.countDocuments();
    const generatedOrderNumber = `BB${Date.now()}${String(count + 1).padStart(4, '0')}`;

    const order = new Order({
      user: user._id,
      orderNumber: generatedOrderNumber,
      items,
      shippingAddress,
      totalAmount,
      notes: notes || ""
    });

    await order.save();

    user.cart = [];
    await user.save();

    res.status(201).json({
      status: 'success',
      message: 'Order placed successfully!',
      data: order
    });

  } catch (error) {
    console.error('ORDER CREATION FAILED:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
});

/*
|--------------------------------------------------------------------------
| GET ALL ORDERS FOR ONE USER
|--------------------------------------------------------------------------
*/
router.get('/user/:email', async (req, res) => {
  try {
    const { email } = req.params;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    const orders = await Order.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate('items.product');

    res.status(200).json({
      status: 'success',
      data: orders
    });

  } catch (error) {
    console.error('FETCH USER ORDERS FAILED:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/*
|--------------------------------------------------------------------------
| GET SINGLE ORDER BY ID
|--------------------------------------------------------------------------
*/
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product');

    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: order
    });

  } catch (error) {
    console.error('FETCH ORDER FAILED:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

module.exports = router;
