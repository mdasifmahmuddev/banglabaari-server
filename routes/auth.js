
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: 'Please provide all required fields' 
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'User with this email already exists' 
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      provider: 'credentials',
      cart: []
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Server error during registration' 
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Please provide email and password' 
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ 
        message: 'Invalid email or password' 
      });
    }

    if (user.provider === 'google' || !user.password) {
      return res.status(401).json({ 
        message: 'Please login with Google' 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        message: 'Invalid email or password' 
      });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Server error during login' 
    });
  }
});


router.post('/oauth/google', async (req, res) => {
  try {
    const { email, name, image, googleId } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      if (user.provider === 'credentials') {
        return res.status(400).json({ 
          message: 'Email already registered with password. Please login with email and password.' 
        });
      }
      
      user.name = name || user.name;
      user.image = image || user.image;
      await user.save();
    } else {
      user = new User({
        name: name || email.split('@')[0],
        email: email.toLowerCase(),
        image: image || '',
        provider: 'google',
        password: null,
        cart: []
      });
      await user.save();
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Google OAuth successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role
      },
      token
    });

  } catch (error) {
    console.error('Google OAuth error:', error);
    res.status(500).json({ message: 'Server error during Google OAuth' });
  }
});


router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});



router.post('/cart', async (req, res) => {
  try {
    const { email, productId, quantity, size, color } = req.body;

    console.log('🛒 Add to cart request:', { email, productId, quantity, size, color });

    if (!email || !productId || !quantity || !size || !color) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Please provide all required fields' 
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({ 
        status: 'error',
        message: 'User not found. Please login first.' 
      });
    }

    console.log('✅ User found, current cart length:', user.cart.length);

    const existingItemIndex = user.cart.findIndex(
      item => item.product.toString() === productId && 
              item.size === size && 
              item.color === color
    );

    if (existingItemIndex > -1) {
      user.cart[existingItemIndex].quantity += quantity;
      console.log('✅ Updated existing cart item');
    } else {
      user.cart.push({ 
        product: productId,
        quantity, 
        size, 
        color
      });
      console.log('✅ Added new item to cart');
    }

    console.log('💾 Saving user...');
    await user.save();
    console.log('✅ User saved, cart length now:', user.cart.length);

    await user.populate('cart.product');
    console.log('✅ Cart populated with product details');

    res.status(200).json({ 
      status: 'success',
      message: 'Item added to cart successfully',
      data: user.cart
    });

  } catch (error) {
    console.error('❌ Add to cart error:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Failed to add item to cart',
      error: error.message 
    });
  }
});


router.get('/cart/:email', async (req, res) => {
  try {
    const { email } = req.params;

    console.log('📦 Getting cart for:', email);

    const user = await User.findOne({ email: email.toLowerCase() })
      .populate('cart.product');
    
    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({ 
        status: 'error',
        message: 'User not found' 
      });
    }

    console.log('✅ Cart found, length:', user.cart.length);
    console.log('Cart items:', JSON.stringify(user.cart, null, 2));

    res.json({ 
      status: 'success',
      data: user.cart
    });

  } catch (error) {
    console.error('❌ Get cart error:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Failed to get cart' 
    });
  }
});


router.delete('/cart/:email/:itemId', async (req, res) => {
  try {
    const { email, itemId } = req.params;

    console.log('🗑️ Removing item:', { email, itemId });

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

    console.log('✅ Item removed, cart length:', user.cart.length);

    res.json({ 
      status: 'success',
      message: 'Item removed from cart',
      data: user.cart
    });

  } catch (error) {
    console.error('❌ Remove from cart error:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Failed to remove item' 
    });
  }
});

router.put('/cart/:email/:itemId', async (req, res) => {
  try {
    const { email, itemId } = req.params;
    const { quantity } = req.body;

    console.log('🔄 Updating cart item:', { email, itemId, quantity });

    if (quantity < 1) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Quantity must be at least 1' 
      });
    }

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

    cartItem.quantity = quantity;
    await user.save();
    await user.populate('cart.product');

    console.log('✅ Cart item updated');

    res.json({ 
      status: 'success',
      message: 'Cart updated successfully',
      data: user.cart
    });

  } catch (error) {
    console.error('❌ Update cart error:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Failed to update cart' 
    });
  }
});

module.exports = router;