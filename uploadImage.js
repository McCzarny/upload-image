const fs = require('fs');

const uploadImage = async (imagePath, method, apiKey, extraOptions = {}) => {
  const file = fs.readFileSync(imagePath);
  if (method === 'imgbb') {
    const imgbbUploadImage = require('./uploadImgbb');
    return imgbbUploadImage(file, apiKey, extraOptions);
  } else {
    throw new Error('Unsupported method ' + method + '.');
  }
};

module.exports = uploadImage;
