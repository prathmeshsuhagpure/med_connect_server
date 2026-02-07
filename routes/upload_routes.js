const express = require('express');
const router = express.Router();

const upload = require('../middlewares/upload');
const { uploadProfilePicture } = require('../controllers/upload_controller');
const {protect} = require('../middlewares/auth_middleware');

router.post(
  '/upload/profile-picture',
  protect,
  upload.single('image'),
  uploadProfilePicture
);

module.exports = router;
