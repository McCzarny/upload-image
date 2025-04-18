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
  // Helper to get input supporting both kebab-case and camelCase
  function getInputAny(name, opts) {
    // Try kebab-case, then camelCase
    const camel = name.replace(/-([a-z])/g, (m, c) => c.toUpperCase());
    return (
      core.getInput(name, opts) ||
      core.getInput(camel, opts)
    );
  }

  try {
    const paths = core.getMultilineInput('path');
    const uploadMethod = getInputAny('upload-method').toLocaleLowerCase();
    const apiKey = getInputAny('api-key');
    assert(paths.length > 0, 'Missing mandatory parameter "path"');
    assert(apiKey.length > 0, 'Missing mandatory parameter "api-key"');

    let extraOptions = {};
    if (uploadMethod === 'cloudinary') {
      const cloudName = core.getInput('cloud-name');
      const apiSecret = core.getInput('api-secret');
      assert(cloudName.length > 0, 'Missing mandatory parameter "cloud-name"');
      assert(apiSecret.length > 0, 'Missing mandatory parameter "api-secret"');
      extraOptions['cloud-name'] = cloudName;
      extraOptions['api-secret'] = apiSecret;
    }

    if (uploadMethod === 'imgbb') {
      // Optional expiration parameter
      const expiration = core.getInput('expiration');
      extraOptions['expiration'] = expiration;
    }

    const results = new Map();
    await Promise.all(
        paths.map(async (pathToUpload) => {
          core.info(`Uploading an image ${pathToUpload} to ${uploadMethod}...`);

          const result = await uploadImage(pathToUpload, uploadMethod, apiKey, extraOptions);
          assert(result, 'There was an error uploading the image.');
          core.info(`Image uploaded to ${result.url} with expiration ${result.expiration}`);
          results.set(pathToUpload, result);
        }),
    );

    // Setting outputs related to urls
    const urls = paths.map((pathToUpload) => {
      return results.get(pathToUpload)?.url;
    });
    core.setOutput('urls', urls);

    const url = urls.join('\n');
    core.debug(`Setting output url to: ${url}`);
    core.setOutput('url', url);

    // Setting outputs related to expiration

    const expiration = paths
        .map((pathToUpload) => {
          return results.get(pathToUpload)?.expiration;
        })
        .join('\n');
    core.debug(`Setting output expiration to: ${expiration}`);
    core.setOutput('expiration', expiration);

    // Setting outputs related to delete urls

    const deleteUrls = paths.map((pathToUpload) => {
      return results.get(pathToUpload)?.delete_url;
    });
    core.setOutput('delete_urls', deleteUrls);
    core.setOutput('delete-urls', deleteUrls);

    const deleteUrl = deleteUrls.join('\n');
    core.debug(`Setting output delete_url to: ${deleteUrl}`);
    core.setOutput('delete_url', deleteUrl);
    core.setOutput('delete-url', deleteUrl);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
