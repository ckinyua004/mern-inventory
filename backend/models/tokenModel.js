const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    token: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        required: true,
        // default: Date.now,
        // expires: '1h'  Token will expire after 1 hour
    }, 
    expiresAt: {
        type: Date,
        required: true
    }
}, {
    timestamps: true
})

const Token = mongoose.model('Token', tokenSchema)
module.exports = Token;