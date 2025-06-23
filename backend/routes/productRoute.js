const express = require('express');
const { createProduct } = require('../controllers/productController');
const protect = require('../middleWare/authMiddleware');
const { upload } = require('../utils/fileUpload');
const router = express.Router()

router.post("/", protect, upload.array("image"), createProduct)

module.exports = router