const cloudinary = require('cloudinary').v2;

/**
 * Uploads an image to Cloudinary.
 * @param {string} filePath - The file path to upload.
 * @param {string} apiKey - The API key (not used for Cloudinary but kept for consistency).
 * @param {Object} extraOptions - Additional options for the upload. Expecting 'cloud-name' and 'api-secret'.
 * @returns {Promise<Object>} - The result of the upload.
 */
async function uploadToCloudinary(filePath, apiKey, extraOptions = {}) {
  if (!filePath) {
    throw new Error('File is required for upload.');
  }
  if (!apiKey) {
    throw new Error('API key is required for upload.');
  }
  if (!extraOptions['cloud-name']) {
    throw new Error('Cloudinary upload requires cloud-name input.');
  }
  if (!extraOptions['api-secret']) {
    throw new Error('Cloudinary upload requires api-secret input.');
  }

  // Configure Cloudinary with your credentials
  cloudinary.config({
      cloud_name: extraOptions['cloud-name'],
      api_key: apiKey,
      api_secret: extraOptions['api-secret'],
    });

  try {
    const result = await cloudinary.uploader.upload(filePath, extraOptions);

    return {
      url: result.secure_url,
      expiration: 0, // Cloudinary does not support expiration by default
      delete_url: null, // Cloudinary has no delete URL for uploaded files. It requires passing ids to data.
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
}

module.exports = uploadToCloudinary;