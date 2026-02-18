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
    else if (uploadPath.includes('cover-photo')) type = 'cover';
    else if (uploadPath.includes('hospital-images')) type = 'hospital';

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

    // ===============================
    // MULTIPLE FILES (Hospital Images)
    // ===============================
    if (type === 'hospital') {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No images provided',
        });
      }

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

      if (!user.hospitalImages) {
        user.hospitalImages = [];
      }

      // ✅ Store ONLY URL (STRING)
      results.forEach((img) => {
        user.hospitalImages.push(img.secure_url);
      });

      await user.save();

      return res.status(200).json({
        success: true,
        images: results.map((r) => r.secure_url),
      });
    }

    // ===============================
    // SINGLE FILE (Profile / Cover)
    // ===============================
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
      user.profilePicture = uploadResult.secure_url;
    }

    if (type === 'cover') {
      user.coverPhoto = uploadResult.secure_url;
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
