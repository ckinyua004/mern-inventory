const asyncHandler = require("express-async-handler")
const User = require("../models/userModel")

const contactUs = asyncHandler(async(req, res) => {
    const { subject, message } = req.body
    const user = await User.findById(req.user._id)

    if(!user){
        res.status(400)
        throw new Error('User not Found')
    }

    if(!subject || !message){
        res.status(400)
        throw new Error("Please add Subject and Message")
    }

    const send_to = user.email;
    const send_from = process.env.EMAIL_USER;
    const reply_to = user.email;
    try {
        await sendEmail(subject, message, send_to, send_from, reply_to);
        res.status(200).json({
            success: true,
            message: 'Reset email sent successfully',
            resetToken, // Send the plain token to the user for email
        });
    } catch (error) {
        res.status(500);
        throw new Error('Email not sent, please try again later');
    }    
})

module.exports = {
    contactUs
}