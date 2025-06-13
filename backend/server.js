const dotenv = require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const userRoute = require("./routes/userRoute")

const app = express()

const PORT = process.env.PORT || 5000

app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(bodyParser.json())

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port:${PORT}`)
        })
        console.log('MongoDB connected successfully') 
    })
    .catch((err) => {
        console.log(err)
    })

app.get("/", (req,res) => {
    res.send("Home page")
})

app.use("/api/users", userRoute)