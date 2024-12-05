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
 *  expiration - The expiration of the image or undefined if the upload method does not support it or failed.
 *
 * most @actions toolkit packages have async methods
 */
async function run() {
  try {
    const paths = core.getMultilineInput('path');
    const uploadMethod = core.getInput('uploadMethod');
    const apiKey = core.getInput('apiKey');
    assert(paths.length > 0, 'Missing mandatory parameter "paths"');

    const results = new Map();
    await Promise.all(
        paths.map(async (pathToUpload) => {
          core.info(`Uploding an image ${pathToUpload} to ${uploadMethod}...`);

          const result = await uploadImage(pathToUpload, uploadMethod, apiKey);
          assert(result, 'There was an error uploading the image.');
          core.info('inner result:' + result);
          results.set(pathToUpload, result);
        }),
    );

    core.info('results: ' + [...results.entries()]);
    const url = paths
        .map((pathToUpload) => {
          return results.get(pathToUpload)?.url;
        })
        .join('\n');
    core.info('final url:' + url);

    core.setOutput('url', url);

    const expiration = paths
        .map((pathToUpload) => {
          return results.get(pathToUpload)?.expiration;
        })
        .join('\n');
    core.setOutput('expiration', expiration);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
