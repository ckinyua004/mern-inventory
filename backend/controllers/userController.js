// controllers/userController.js
const asyncHandler = require('express-async-handler');
const jwt          = require('jsonwebtoken');
const User         = require('../models/userModel');
const bcrypt       = require('bcryptjs')

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

const loginUser = asyncHandler(async(req, res) => {
  const{email, password} = req.body;

  if(!email || !password){
    res.status(400);
    throw new Error("Please add your email..")
  }

  const user = await User.findOne({email})

  if(!user){
    res.status(400)
    throw new Error("User not found please sign up")
  }

  const passwordIsCorrect = await bcrypt.compare(password, user.password)

  if (user && passwordIsCorrect){
    const {_id, email, body, photo, phone, bio} = user;

    res.status(201).json({
      _id   : user._id,
      name  : user.name,
      email : user.email,
      photo : user.photo,
      phone : user.phone,
      token,
   });
  } else {
    res.status(400)
    throw new Error("Invalid email or password")
  }
})

const logoutUser = asyncHandler(async(req,res) => {
  res.cookie('token', "", {
    httpOnly : true,
    secure   : process.env.NODE_ENV === 'production',
    sameSite : 'strict',
    expires: new Date(0)
  });
  return res.status(200).json({message: "Successful Logout"})
})

const getUser = asyncHandler(async(req, res) => {
  const user = await User.findById(req.user._id)

    if (user){
    const {_id, email, name, photo, phone, bio} = user;

    res.status(201).json({
      _id,
      name,
      email,
      photo,
      phone,
      token,
   });
  } else {
    res.status(400)
    throw new Error("User Not Found")
  }
})

//GET LOGIN STATUS
const loginStatus = asyncHandler(async(req, res) => {
  const token = req.cookies.token;
  if(!token){
    return res.json(false)
  }

  const verified = jwt.verify(token, process.env.JWT_SECRET)

  if(verified){
    return res.json(true)
  }

  return res.json(false)
})

//UPDATE USER DETAILS
const updateUser = asyncHandler(async(req, res) => {
  const user = await User.findById(req.user._id)

  if(user){
    const {_id, email, name, photo, phone, bio} = user;
    user.email = email,
    user.name = req.body.name || name
    user.photo = req.body.photo || photo
    user.phone = req.body.phone || phone 
    user.bio = req.body.bio || bio

    const updatedUser = await user.save()
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      photo: updatedUser.photo,
      phone: updatedUser.phone,
      token:  updatedUser.bio
    })
  } else {
    res.status(404)
    throw new Error("User not found")
  }
})

const changePassword = asyncHandler(async(req, res) => {
  const user = await User.findById(req.user._id) 

  const { oldPassword, password} = req.body;

  if (!user) {
    res.status(400)
    throw new Error("User not found")
  }

  if (!oldPassword || !password){
    res.status(400)
    throw new Error("Please add old and New password")
  }

  const passwordIsCorrect = await bcrypt.compare(oldPassword, user.password)

  // Save new password

  if (user && passwordIsCorrect) {
    user.password = password
    await user.save()
    res.status(200).send("Password Changed Successfully")
  } else {
    res.status(400)
    throw new Error("Old Password is Incorrect")
  }

})

module.exports = { registerUser, loginUser, logoutUser, getUser , loginStatus, updateUser, changePassword };
