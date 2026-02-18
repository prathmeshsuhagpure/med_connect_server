const cloudinary = require('../config/cloudinary');

const uploadImage = async (req, res) => {
  try {
    const user = req.user;
    const uploadPath = req.path;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    // Determine upload type
    let type;
    if (uploadPath.includes('profile-picture')) type = 'profile';
    if (uploadPath.includes('cover-photo')) type = 'cover';
    if (uploadPath.includes('hospital-images')) type = 'hospital';

    const folderMap = {
      profile: 'med_connect/profile_pictures',
      cover: 'med_connect/cover_photos',
      hospital: 'med_connect/hospital_images',
    };

    const selectedFolder = folderMap[type];

    if (!selectedFolder) {
      return res.status(400).json({
        success: false,
        message: 'Invalid upload type',
      });
    }

    // MULTIPLE FILES (Hospital Images)
    if (type === 'hospital') {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No images provided',
        });
      }

      const uploadedImages = [];

      for (const file of req.files) {
        const result = await cloudinary.uploader.upload_stream(
          {
            folder: selectedFolder,
            resource_type: 'image',
            transformation: [
              { width: 1200, crop: 'limit' },
              { quality: 'auto' },
              { fetch_format: 'auto' },
            ],
          },
          () => {}
        );

        // ⚠ upload_stream doesn't work with await directly
        // So we use promise wrapper below instead
      }

      // Instead use Promise version below 👇
      const uploadPromises = req.files.map((file) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: selectedFolder,
              resource_type: 'image',
              transformation: [
                { width: 1200, crop: 'limit' },
                { quality: 'auto' },
                { fetch_format: 'auto' },
              ],
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );

          stream.end(file.buffer);
        });
      });

      const results = await Promise.all(uploadPromises);

      if (!user.hospitalImages) user.hospitalImages = [];

      results.forEach((img) => {
        user.hospitalImages.push({
          url: img.secure_url,
          publicId: img.public_id,
        });
      });

      await user.save();

      return res.status(200).json({
        success: true,
        images: results.map((r) => r.secure_url),
      });
    }

    // SINGLE FILE (Profile / Cover)
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image provided',
      });
    }

    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: selectedFolder,
          resource_type: 'image',
          transformation: [
            { width: 800, crop: 'limit' },
            { quality: 'auto' },
            { fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      stream.end(req.file.buffer);
    });

    if (type === 'profile') {
      if (user.profilePicturePublicId) {
        await cloudinary.uploader.destroy(user.profilePicturePublicId);
      }
      user.profilePicture = uploadResult.secure_url;
      user.profilePicturePublicId = uploadResult.public_id;
    }

    if (type === 'cover') {
      if (user.coverPhotoPublicId) {
        await cloudinary.uploader.destroy(user.coverPhotoPublicId);
      }
      user.coverPhoto = uploadResult.secure_url;
      user.coverPhotoPublicId = uploadResult.public_id;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      imageUrl: uploadResult.secure_url,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while uploading image',
    });
  }
};

module.exports = { uploadImage };
