var fs = require('fs'),
  path = require('path');

let uploadImage = async (imagePath, method, apiKey) => {
    var file = fs.readFileSync(imagePath);
      if (method === 'imgbb') {
        var imgbb = require('./uploadImgbb');
        return imgbb(file, apiKey);
      }
      else {
        throw new Error('Unsupported method ' + method + '.')
      }
  };
  
  module.exports = uploadImage;
  