/**
 * Upload images to imgbb.
 * @param {string} file a path to the file to upload
 * @param {string} apiKey the API key to access imgbb.com
 * @param {object} extraOptions dictionary with additional options that may be not supported
 *                 by every upload method. imgbb supports name and expiration (in seconds 60-15552000)
 * @see https://api.imgbb.com/ for information about API
 */
async function uploadFile(file, apiKey, extraOptions) {
  const assert = require('assert');
  assert(apiKey, 'apiKey is required');
  const axios = require('axios');
  const FormData = require('form-data');
  const data = new FormData();

  const base64Image = file.toString('base64');
  const params = {key: apiKey};

  if ('name' in extraOptions) {
    console.log('name: ' + extraOptions.name);
    params.name = extraOptions.name;
  }

  if ('expiration' in extraOptions) {
    params.expiration = extraOptions.expiration;
  }

  data.append('image', base64Image);

  const config = {
    method: 'post',
    url: 'https://api.imgbb.com/1/upload',
    params: params,
    headers: {
      ...data.getHeaders(),
    },
    data: data,
  };

  return axios(config)
      .then(function(response) {
        if ('expiration' in extraOptions && response.data.data.expiration != extraOptions.expiration) {
          console.warn(
              'expiration is not the same. expected: ' + extraOptions.expiration +
              ' actual: ' + response.data.data.expiration +
              '\n Could be caused by reupload of an existing image.');
        }
        console.log(JSON.stringify(response.data));
        return {url: response.data.data.url, expiration: response.data.data.expiration};
      })
      .catch(function(error) {
        console.log(error);
      });
}

module.exports = uploadFile;
