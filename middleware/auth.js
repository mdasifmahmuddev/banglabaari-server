

const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const User = require('../models/User');


router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Name, email and password are required' 
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'User already exists with this email' 
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      provider: 'credentials',
      cart: []
    });

    await newUser.save();

    res.status(201).json({
      status: 'success',
      data: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: 'user'
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: error.message || 'Registration failed' 
    });
  }
});


router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Email and password are required' 
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ 
        status: 'error', 
        message: 'Invalid email or password' 
      });
    }

    if (!user.password) {
      return res.status(401).json({ 
        status: 'error', 
        message: 'This account uses Google Sign-In. Please use Google to login.' 
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        status: 'error', 
        message: 'Invalid email or password' 
      });
    }

    res.json({
      status: 'success',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: 'user'
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: error.message || 'Login failed' 
    });
  }
});


router.post('/user', async (req, res) => {
  try {
    const { email, name, image, provider } = req.body;

    if (!email) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Email is required' 
      });
    }

    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      user = await User.create({
        email: email.toLowerCase(),
        name,
        image,
        provider: provider || 'google',
        cart: []
      });
    }

    res.json({ 
      status: 'success', 
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: 'user'
      }
    });
  } catch (error) {
    console.error('User creation error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});


router.get('/cart/:email', async (req, res) => {
  try {
    console.log('📦 Getting cart for:', req.params.email);
    
    const user = await User.findOne({ email: req.params.email.toLowerCase() })
      .populate('cart.product');
    
    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({ 
        status: 'error', 
        message: 'User not found' 
      });
    }

    console.log('✅ Cart found:', user.cart.length, 'items');
    console.log('Cart data:', JSON.stringify(user.cart, null, 2));
    
    res.json({ 
      status: 'success', 
      data: user.cart || []
    });
  } catch (error) {
    console.error('❌ Error getting cart:', error);
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});


router.post('/cart', async (req, res) => {
  try {
    const { email, productId, quantity, size, color } = req.body;
    
    console.log('🛒 Add to cart request:', { email, productId, quantity, size, color });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({ 
        status: 'error', 
        message: 'User not found' 
      });
    }


    const existingItemIndex = user.cart.findIndex(
      item => item.product.toString() === productId && 
              item.size === size && 
              item.color === color
    );

    if (existingItemIndex > -1) {
     
      user.cart[existingItemIndex].quantity += quantity;
      console.log('✅ Updated existing item quantity');
    } else {
      
      user.cart.push({ 
        product: productId, 
        quantity, 
        size, 
        color 
      });
      console.log('✅ Added new item to cart');
    }

    await user.save();
    await user.populate('cart.product');

    console.log('✅ Cart saved, returning:', user.cart.length, 'items');

    res.json({ 
      status: 'success', 
      data: user.cart,
      message: 'Item added to cart successfully'
    });
  } catch (error) {
    console.error('❌ Error adding to cart:', error);
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});


router.put('/cart/:email/:itemId', async (req, res) => {
  try {
    const { email, itemId } = req.params;
    const { quantity } = req.body;

    console.log('🔄 Update cart item:', { email, itemId, quantity });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'User not found' 
      });
    }

    const cartItem = user.cart.id(itemId);
    
    if (!cartItem) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Cart item not found' 
      });
    }

    if (quantity < 1) {
   
      user.cart = user.cart.filter(item => item._id.toString() !== itemId);
      console.log('✅ Removed item (quantity < 1)');
    } else {
      cartItem.quantity = quantity;
      console.log('✅ Updated item quantity');
    }

    await user.save();
    await user.populate('cart.product');

    res.json({ 
      status: 'success', 
      data: user.cart 
    });
  } catch (error) {
    console.error('❌ Error updating cart:', error);
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});


router.delete('/cart/:email/:itemId', async (req, res) => {
  try {
    const { email, itemId } = req.params;

    console.log('🗑️ Remove from cart:', { email, itemId });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'User not found' 
      });
    }

    user.cart = user.cart.filter(item => item._id.toString() !== itemId);
    await user.save();
    await user.populate('cart.product');

    console.log('✅ Item removed, cart now has:', user.cart.length, 'items');

    res.json({ 
      status: 'success', 
      data: user.cart 
    });
  } catch (error) {
    console.error('❌ Error removing from cart:', error);
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});

module.exports = router;