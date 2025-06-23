const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path')

const userRoute = require("./routes/userRoute");
const productRoute = require("./routes/productRoute");
const { errorHandler } = require("./middleWare/errorMiddleware");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

app.use("/uploads", express.static(path.join(__dirname, 'uploads')))

// Routes
app.get("/", (req, res) => {
    res.send("Home page");
});
app.use("/api/users", userRoute);
app.use("/api/products", productRoute);

// Error Handler (last!)
app.use(errorHandler);

// DB + Server
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port: ${PORT}`);
        });
        console.log('MongoDB connected successfully');
    })
    .catch((err) => {
        console.log(err);
    });