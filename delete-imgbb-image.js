const core = require('@actions/core');
const assert = require('assert');
const axios = require('axios');

function deleteImage(apiKey, deleteUrl) {
    const id = deleteUrl.split('/')[3];
    const hash = deleteUrl.split('/')[4];
    const url = 'https://ibb.co/json';
    const headers = {
        'accept': 'application/json, text/javascript, */*; q=0.01',
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'origin': 'https://ibb.co',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'sec-gpc': '1',
        'x-requested-with': 'XMLHttpRequest'
    };
    const data = {
        auth_token: apiKey,
        pathname: `/${id}/${hash}`,
        action: 'delete',
        delete: 'image',
        from: 'resource',
        'deleting[id]': id,
        'deleting[type]': 'image',
        'deleting[privacy]': 'public',
        'deleting[hash]': hash
    };
    const config = {
        method: 'POST',
        url,
        headers,
        data
    };

    axios(config)
        .then(response => {
            console.log(response.status === 200 ? `Image deleted successfully` : `Failed to delete image`);
        })
        .catch(error => {
            console.error('Error deleting image:', error);
        });
}
function run() {

    const apiKey = core.getInput('apiKey');
    const deleteUrl = core.getInput('deleteUrl');
    const deleteUrls = core.getInput('deleteUrls');

    assert(apiKey, 'apiKey is required');
    assert(deleteUrl || deleteUrls, 'deleteUrl or deleteUrls is required');

    if (deleteUrl) {
        const deleteUrlArray = deleteUrl.split('\n');
        deleteUrlArray.forEach(url => deleteImage(apiKey, url));
    }
    if (deleteUrls) {
        const urlsArray = JSON.parse(deleteUrls);
        urlsArray.forEach(url => deleteImage(apiKey, url));
    }
}

run();