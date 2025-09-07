const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = new User({
      name,
      email,
      password
    });

    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Google OAuth (only if configured)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
  }));

  router.get('/google/callback', 
    passport.authenticate('google', { session: false }),
    (req, res) => {
      const token = jwt.sign(
        { id: req.user._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
    }
  );
} else {
  // Placeholder routes when Google OAuth is not configured
  router.get('/google', (req, res) => {
    res.status(501).json({ message: 'Google OAuth not configured' });
  });

  router.get('/google/callback', (req, res) => {
    res.status(501).json({ message: 'Google OAuth not configured' });
  });
}

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        avatar: req.user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
