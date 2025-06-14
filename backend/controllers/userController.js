const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs')
const User = require("../models/userModel");

const registerUser = asyncHandler( async (req, res) => {
    res.send("Register User.")
    const {name, email, password} = req.body;

    if(!name || !email || !password){
        res.status(400)
        throw new Error("Please fill all required fields")
    }

    if(password.length > 6){
        res.status(400)
        throw new Error("Password must be upto 6 characters")
    }

    const userExists = await User.findOne({email})

    if (userExists){
        res.status(400)
        throw new Error("Email has already been registered")
    }

    const salt = await bcrypt.genSalt(10)
    console.log(salt)
    const hashedPassword = await bcrypt.hash(this.password, salt)
    this.password = hashedPassword

    const user = await User.create({
        name,
        email,
        password,
        photo,
        phone,
        bio
    })

    if (user) {
        const {_id, name, email} = user
        res.status(201).json({
            _id: user.id,
            name: user.name,
            email,
            password,
            photo,
            phone,
            bio
        })
    }
})

module.exports = {
    registerUser
}