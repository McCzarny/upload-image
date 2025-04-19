const fs = require('fs');

const uploadImage = async (imagePath, method, apiKey, extraOptions) => {
  if (method === 'imgbb') {
    const imgbbUploadImage = require('./uploadImgbb');
    const file = fs.readFileSync(imagePath);
    return imgbbUploadImage(file, apiKey, extraOptions);
  } else if (method === 'cloudinary') {
    const cloudinaryUploadImage = require('./uploadCloudinary');
    return cloudinaryUploadImage(imagePath, apiKey, extraOptions);
  } else {
    throw new Error('Unsupported method ' + method + '.');
  }
};

module.exports = uploadImage;
