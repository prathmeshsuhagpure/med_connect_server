const cloudinary = require('../config/cloudinary');
const User = require('../models/user_model');

const uploadProfilePicture = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image provided',
      });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload_stream(
      {
        folder: 'med_connect/profile_pictures',
        resource_type: 'image',
        transformation: [
          { width: 400, height: 400, crop: 'fill' },
          { quality: 'auto' },
          { fetch_format: 'auto' },
        ],
      },
      async (error, uploadResult) => {
        if (error) {
          console.error('Cloudinary error:', error);
          return res.status(500).json({
            success: false,
            message: 'Image upload failed',
          });
        }

        const user = await User.findById(userId);

        // 🔥 Delete old profile picture
        if (user.profilePicturePublicId) {
          await cloudinary.uploader.destroy(
            user.profilePicturePublicId
          );
        }

        // Save new image
        user.profilePicture = uploadResult.secure_url;
        user.profilePicturePublicId = uploadResult.public_id;

        await user.save();

        return res.status(200).json({
          success: true,
          imageUrl: uploadResult.secure_url,
        });
      }
    );

    // Send buffer to Cloudinary
    result.end(req.file.buffer);

  } catch (error) {
    console.error('Profile upload error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while uploading image',
    });
  }
};

module.exports = { uploadProfilePicture };
