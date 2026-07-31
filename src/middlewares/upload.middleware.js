const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'products',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    format: 'webp', // Convert all images to webp
    transformation: [{ width: 1000, height: 1000, crop: 'limit', quality: 'auto', fetch_format: 'auto' }],
  },
});

const upload = multer({ 
  storage: storage,
  limits: {
    files: 5, // Maximum 5 files
  }
});

module.exports = upload;
