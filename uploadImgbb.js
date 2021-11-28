
// Upload images to imgbb
async function uploadFile(file, apiKey){
    const axios = require('axios');
    var FormData = require('form-data');
    var data = new FormData();

    const base64Image = file.toString('base64');

    data.append('image', base64Image);

    var config = {
      method: 'post',
      url: 'https://api.imgbb.com/1/upload?key=' + apiKey,
      headers: { 
        ...data.getHeaders()
      },
      data : data
    };
    
    return axios(config)
    .then(function (response) {
      return response.data.data.url
    })
    .catch(function (error) {
      console.log(error);
    });
}

module.exports = uploadFile;