const asyncHandler = require("express-async-handler")
const jwt = require("jsonwebtoken")
const User = require("../models/userModel")

const protect = asyncHandler(async(req, res) => {
    try{
        const token = req.cookies.token
        if (!token) {
            res.status(401)
            throw new Error("Not authorized. Please LOGIN")
        }
        //Verify token
        const verified = jwt.verify(token, process.env.JWT_SECRET)
        //Get user from token
        const user = await User.findById(verified.id).select("-password")

        if (!user) {
            throw new Error("User not Found")
        }
        req.user = user
        next()
    } catch(error) {
        res.status(401)
        throw new Error("Not authorized. Please LOGIN")
    }
})

module.exports = protect