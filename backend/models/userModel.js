const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Add a name. "]
    },
    email: {
        type: String,
        required: [true, "Add an email! "],
        unique: true,
        trim: true,
        match: [
            , "Add a valid email"
        ]
    },
    password: {
        type: String,
        required: [true, "Add a password."],
        minLength: [6, "Password must be upto 6 characters."],
    },
    photo: {
        type: String,
        required: [true, "Add a photo"],
        default: "https://i.ibb.co/4pDNDk1/avatar.png"
    },
    phone: {
        type: String,
        default: "+234"
    },
    role: {
        type:String,
        default: "bio",
        maxLength: [40, "Role mmust not be more than 40 characters"]
    }
}, {
    timestamps: true
})

userSchema.pre("save", async function(next) {
    if (!this.isModified("password")) {
        next()
    }
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
})

const User = mongoose.model("User", userSchema)
module.exports = User