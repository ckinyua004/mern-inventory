const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  logoutUser,
  getUser,
  loginStatus,
  updateUser,
  changePassword,
  forgotPassword,
  resetPassword,
} = require("../controllers/userController");

const protect = require("../middleWare/authMiddleware");

// @route   POST /api/users/register
// @desc Register a new user
router.post("/register", registerUser);

// @route   POST /api/users/login
// @desc    Login user
router.post("/login", loginUser);

// @route   GET /api/users/logout
// @desc    Logout user
router.get("/logout", logoutUser);

// @route   GET /api/users/getuser
// @desc    Get logged-in user details
router.get("/getuser", protect, getUser);

// @route   GET /api/users/loggedin
// @desc    Check if user is logged in
router.get("/loggedin", loginStatus);

// @route   PATCH /api/users/updateUser
// @desc    Update user profile
router.patch("/updateUser", protect, updateUser);

// @route   PATCH /api/users/changePassword
// @desc    Change password
router.patch("/changePassword", protect, changePassword);

// @route   POST /api/users/forgotPassword
// @desc    Send password reset email
router.post("/forgotPassword", forgotPassword);

// @route   POST /api/users/resetPassword/:resetToken
// @desc    Reset user password
router.post("/resetPassword/:resetToken", resetPassword);

module.exports = router;
