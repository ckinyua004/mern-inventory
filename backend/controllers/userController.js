// controllers/userController.js

const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const Token = require('../models/tokenModel');
const crypto = require('crypto');

// Helper function – generates JWT token valid for 5 days
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '5d' });

/**
 * @desc    Register a new user
 * @route   POST /api/users/register
 * @access  Public
 */
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, photo, phone } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please fill all required fields');
  }

  if (password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('Email has already been registered');
  }

  const user = await User.create({ name, email, password, photo, phone });

  const token = generateToken(user._id);
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 5 * 24 * 60 * 60 * 1000, // 5 days
  });

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    photo: user.photo,
    phone: user.phone,
    token,
  });
});

/**
 * @desc    Log in a user
 * @route   POST /api/users/login
 * @access  Public
 */
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please add your email..');
  }

  const user = await User.findOne({ email });

  if (!user) {
    res.status(400);
    throw new Error('User not found please sign up');
  }

  const passwordIsCorrect = await bcrypt.compare(password, user.password);

  if (user && passwordIsCorrect) {
    const { _id, name, email, photo, phone, bio } = user;
    const token = generateToken(user._id);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 5 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      _id,
      name,
      email,
      photo,
      phone,
      bio,
      token,
    });
  } else {
    res.status(400);
    throw new Error('Invalid email or password');
  }
});

/**
 * @desc    Log out a user
 * @route   GET /api/users/logout
 * @access  Public
 */
const logoutUser = asyncHandler(async (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: new Date(0),
  });
  return res.status(200).json({ message: 'Successful Logout' });
});

/**
 * @desc    Get logged-in user profile
 * @route   GET /api/users/me
 * @access  Private
 */
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    const { _id, name, email, photo, phone, bio } = user;
    res.status(200).json({
      _id,
      name,
      email,
      photo,
      phone,
      bio,
    });
  } else {
    res.status(400);
    throw new Error('User Not Found');
  }
});

/**
 * @desc    Check login status
 * @route   GET /api/users/loggedin
 * @access  Public
 */
const loginStatus = asyncHandler(async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json(false);
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    return res.json(true);
  } catch (err) {
    return res.json(false);
  }
});

/**
 * @desc    Update user profile
 * @route   PATCH /api/users/update
 * @access  Private
 */
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.photo = req.body.photo || user.photo;
    user.phone = req.body.phone || user.phone;
    user.bio = req.body.bio || user.bio;

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      photo: updatedUser.photo,
      phone: updatedUser.phone,
      bio: updatedUser.bio,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

/**
 * @desc    Change user password
 * @route   PATCH /api/users/changePassword
 * @access  Private
 */
const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { oldPassword, password } = req.body;

  if (!user) {
    res.status(400);
    throw new Error('User not found');
  }

  if (!oldPassword || !password) {
    res.status(400);
    throw new Error('Please add old and new password');
  }

  const passwordIsCorrect = await bcrypt.compare(oldPassword, user.password);

  if (user && passwordIsCorrect) {
    user.password = password;
    await user.save();
    res.status(200).send('Password Changed Successfully');
  } else {
    res.status(400);
    throw new Error('Old Password is Incorrect');
  }
});

/**
 * @desc    Send password reset email
 * @route   POST /api/users/forgotPassword
 * @access  Public
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error("User not found, please sign up");
  }

  let token = await Token.findOne({ userId: user._id });
  if (token) {
    await token.deleteOne();
  }

  let resetToken = crypto.randomBytes(32).toString('hex') + user._id;
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  const expiresAt = Date.now() + 30 * 60 * 1000; // 30 minutes

  await new Token({
    userId: user._id,
    token: hashedToken,
    createdAt: new Date(),
    expiresAt: new Date(expiresAt),
  }).save();

  const resetUrl = `${process.env.FRONTEND_URL}/resetPassword/${resetToken}`;
  const message = `
    <h2>Hello ${user.name}</h2>
    <p>We received a request to reset your password.</p>
    <p>Please click on the link below to reset your password:</p>
    <a href="${resetUrl}" target="_blank" clickTracking=off>Reset Password</a>
    <p>If you did not request this, please ignore this email.</p>
    <p>Thank you!</p>
  `;

  const subject = 'Password Reset Request';
  const send_to = user.email;
  const send_from = process.env.EMAIL_USER;
  const reply_to = process.env.EMAIL_USER;

  try {
    await sendEmail(subject, message, send_to, send_from, reply_to);
    res.status(200).json({
      success: true,
      message: 'Reset email sent successfully',
      resetToken,
    });
  } catch (error) {
    res.status(500);
    throw new Error('Email not sent, please try again later');
  }
});

/**
 * @desc    Reset user password
 * @route   PUT /api/users/resetPassword/:resetToken
 * @access  Public
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { resetToken } = req.params;

  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  const userToken = await Token.findOne({
    token: hashedToken,
    expiresAt: { $gt: Date.now() },
  });

  if (!userToken) {
    res.status(404);
    throw new Error('Invalid or expired reset token');
  }

  const user = await User.findOne({ _id: userToken.userId });
  user.password = password;
  await user.save();

    res.status(200).json({
    success: true,
    message: 'Password reset successfully',
  });
});

/**
 * Export all user controller functions
 */
module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getUser,
  loginStatus,
  updateUser,
  changePassword,
  forgotPassword,
  resetPassword,
};

