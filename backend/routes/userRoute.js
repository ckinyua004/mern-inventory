const express = require("express");
const router = express.Router();

const { registerUser, loginUser, logoutUser, getUser, loginStatus, updateUser, changePassword } = require("../controllers/userController");
const protect  = require("../middleWare/authMiddleware")

// Register user
router.post("/register", registerUser);

// Login user
router.post("/login", loginUser);

// Logout user
router.get("/logout", logoutUser);

// Get user
router.get("/getuser", protect, getUser)

// WELCOME LOGIN PAGE
router.get("/loggedin", loginStatus)

// Update User
router.patch("/updateUser", protect, updateUser)

// Change password
router.patch("/changePassword", protect, changePassword)

module.exports = router;