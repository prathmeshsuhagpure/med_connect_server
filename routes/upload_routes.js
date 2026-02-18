const express = require('express');
const router = express.Router();

const upload = require('../middlewares/upload');
const { uploadImage } = require('../controllers/upload_controller');
const { protect } = require('../middlewares/auth_middleware');

// Profile & Cover → single
router.post(
  '/upload/profile-picture',
  protect,
  upload.single('image'),
  uploadImage
);

router.post(
  '/upload/cover-photo',
  protect,
  upload.single('image'),
  uploadImage
);

// Hospital images → multiple
router.post(
  '/upload/hospital-images',
  protect,
  upload.array('images', 10), // max 10 images
  uploadImage
);

module.exports = router;
