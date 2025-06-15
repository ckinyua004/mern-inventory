// controllers/userController.js
const asyncHandler = require('express-async-handler');
const jwt          = require('jsonwebtoken');
const User         = require('../models/userModel');

// helper – 5-day token
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '5d' });

/**
 * @desc    Register a new user
 * @route   POST /api/users/register
 * @access  Public
 */
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, photo, phone } = req.body;

  // 1. basic validation
  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please fill all required fields');
  }
  if (password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }

  // 2. make sure email is unique
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('Email has already been registered');
  }

  // 3. create user (password gets hashed in the model’s pre-save hook)
  const user = await User.create({ name, email, password, photo, phone });

  // 4. sign JWT & set cookie
  const token = generateToken(user._id);
  res.cookie('token', token, {
    httpOnly : true,
    secure   : process.env.NODE_ENV === 'production',
    sameSite : 'strict',
    maxAge   : 5 * 24 * 60 * 60 * 1000, // 5 days
  });

  // 5. respond
  res.status(201).json({
    _id   : user._id,
    name  : user.name,
    email : user.email,
    photo : user.photo,
    phone : user.phone,
    token,
  });
});

module.exports = { registerUser };
