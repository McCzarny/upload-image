const core = require('@actions/core');
const assert = require('assert');
const axios = require('axios');

function deleteImage(apiKey, deleteUrl) {
    if (!deleteUrl || deleteUrl.trim() === '') {
        return Promise.reject(new Error('Invalid delete URL'));
    }
    const urlParts = deleteUrl.split('/');
    if (urlParts.length < 5) {
        return Promise.reject(new Error('Invalid delete URL'));
    }
    const id = urlParts[3];
    const hash = urlParts[4];
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

    return axios(config)
        .then(response => {
            if (!response) {
                throw new Error(`No response received from server for: ${deleteUrl}`);
            }
            if (response.status !== 200) {
                throw new Error(`Failed to delete image: ${deleteUrl}`);
            }
            console.log(`Image deleted successfully: ${deleteUrl}`);
            return response;
        });
}

async function run() {

    const apiKey = core.getInput('apiKey');
    const deleteUrl = core.getInput('deleteUrl');
    const deleteUrls = core.getInput('deleteUrls');

    assert(apiKey, 'apiKey is required');
    assert(
        (deleteUrl && deleteUrl.trim() !== '') || (deleteUrls && deleteUrls.trim() !== ''), 
        'deleteUrl or deleteUrls is required'
    );

    const errors = [];
    const deletePromises = [];
    let deleteUrlArray = deleteUrl ? deleteUrl.split('\n') : [];
    console.debug(`Multiline delete URL: ${deleteUrlArray.join(', ')}`);

    {
        const urlsArray = deleteUrls ? JSON.parse(deleteUrls) : [];
        console.debug(`Parsed delete URLs: ${urlsArray.join(', ')}`);
        deleteUrlArray = deleteUrlArray.concat(urlsArray);
    }

    console.debug(`Deleting images: ${deleteUrlArray.join(', ')}`);
    deleteUrlArray.forEach(url => {
        deletePromises.push(
            deleteImage(apiKey, url).catch(error => {
                errors.push(`Failed to delete ${url}: ${error.message}`);
            })
        );
    });

    await Promise.all(deletePromises);

    if (errors.length > 0) {
        throw new Error(`Failed to delete some images:\n${errors.join('\n')}`);
    }
}

// Export the run function instead of running it immediately
module.exports = run;

// Only run if this is the main module
if (require.main === module) {
    run().catch(error => {
        core.setFailed(error.message);
        throw error;
    });
}