const fs = require('fs');

const uploadImage = async (imagePath, method, apiKey) => {
  const file = fs.readFileSync(imagePath);
  if (method === 'imgbb') {
    const imgbb = require('./uploadImgbb');
    return imgbb(file, apiKey);
  } else {
    throw new Error('Unsupported method ' + method + '.');
  }
};

module.exports = uploadImage;
