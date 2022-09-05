/**
 * A github action that uploads an image and stores its url.
 */

const core = require('@actions/core');
const uploadImage = require('./uploadImage');
const assert = require('assert');

/**
 * Runs the action to upload an image.
 * Expected inputs:
 *  path - The path to the image.
 *  uploadMethod - The upload method to use.
 *  apiKey - The API key if the upload method requires it.
 * Output:
 *  url - The url of the image or undefined if the upload failed.
 *
 * most @actions toolkit packages have async methods
 */
async function run() {
  try {
    const path = core.getInput('path');
    const uploadMethod = core.getInput('uploadMethod');
    const apiKey = core.getInput('apiKey');
    core.info(`Uploding an image ${path} to ${uploadMethod}...`);

    const url = await uploadImage(path, uploadMethod, apiKey);
    assert(url, 'There was an error uploading the image.');
    core.info(url);

    core.setOutput('url', url);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
