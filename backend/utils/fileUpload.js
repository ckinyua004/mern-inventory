const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Define file storage strategy
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname); // preserve extension
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter to allow only image types
function fileFilter(req, file, cb) {
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only .png, .jpg and .jpeg formats are allowed!'), false);
  }
}

// Initialize multer middleware
const upload = multer({ storage, fileFilter });

// Format file size into human-readable string
const fileSizeFormatter = (bytes, decimal = 2) => {
  if (bytes === 0) return '0 Bytes';
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return parseFloat((bytes / Math.pow(1024, i)).toFixed(decimal)) + ' ' + sizes[i];
};

module.exports = { upload, fileSizeFormatter };
