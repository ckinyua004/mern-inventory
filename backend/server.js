const dotenv = require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const userRoute = require("./routes/userRoute")
const { errorHandler } = require("./middleWare/errorMiddleware")

const app = express()

const PORT = process.env.PORT || 5000

app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(errorHandler)

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port : ${PORT}`)
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