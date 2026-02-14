const cloudinary = require('../config/cloudinary');
const { UserFactory } = require('../models/user/user_factory');

const uploadProfilePicture = async (req, res) => {
  try {
    const user = req.user; // already fetched by auth middleware

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: 'No image provided',
      });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
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

        try {
          // 🔥 delete old image if exists
          if (user.profilePicturePublicId) {
            await cloudinary.uploader.destroy(
              user.profilePicturePublicId
            );
          }

          // save new image
          user.profilePicture = uploadResult.secure_url;
          user.profilePicturePublicId = uploadResult.public_id;

          await user.save();

          return res.status(200).json({
            success: true,
            imageUrl: uploadResult.secure_url,
            user: UserFactory.getUserData(user),
          });
        } catch (dbError) {
          console.error('DB save error:', dbError);
          return res.status(500).json({
            success: false,
            message: 'Failed to save image',
          });
        }
      }
    );

    // send buffer to Cloudinary
    uploadStream.end(req.file.buffer);

  } catch (error) {
    console.error('Profile upload error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while uploading image',
    });
  }
};

module.exports = { uploadProfilePicture };
