// models/userModel.js
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type     : String,
      required : [true, 'Please add a name'],
      trim     : true,
    },
    email: {
      type     : String,
      required : [true, 'Please add an email'],
      unique   : true,
      trim     : true,
      match    : [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    password: {
      type      : String,
      required  : [true, 'Please add a password'],
      minlength : 6,
      select    : false, // never send by default
    },
    photo: {
      type    : String,
      default : 'https://i.ibb.co/4pDNDk1/avatar.png',
    },
    phone: {
      type    : String,
      default : '+254', // Kenya country code
    },
    role: {
      type      : String,
      default   : 'USER',
      maxlength : [40, 'Role must not be more than 40 characters'],
    },
  },
  { timestamps: true }
);

// hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt     = await bcrypt.genSalt(10);
    this.password  = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('User', userSchema);
