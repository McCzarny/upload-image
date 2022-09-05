/**
 * Upload images to imgbb.
 * @param {string} file a path to the file to upload
 * @param {string} apiKey the API key to access imgbb.com
 */
async function uploadFile(file, apiKey) {
  const axios = require('axios');
  const FormData = require('form-data');
  const data = new FormData();

  const base64Image = file.toString('base64');

  data.append('image', base64Image);

  const config = {
    method: 'post',
    url: 'https://api.imgbb.com/1/upload?key=' + apiKey,
    headers: {
      ...data.getHeaders(),
    },
    data: data,
  };

  return axios(config)
      .then(function(response) {
        return response.data.data.url;
      })
      .catch(function(error) {
        console.log(error);
      });
}

module.exports = uploadFile;
