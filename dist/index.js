require('./sourcemap-register.js');/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 223:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const fs = __nccwpck_require__(896);

const uploadImage = async (imagePath, method, apiKey, extraOptions = {}) => {
  const file = fs.readFileSync(imagePath);
  if (method === 'imgbb') {
    const imgbbUploadImage = __nccwpck_require__(345);
    return imgbbUploadImage(file, apiKey, extraOptions);
  } else {
    throw new Error('Unsupported method ' + method + '.');
  }
};

module.exports = uploadImage;


/***/ }),

/***/ 345:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

/**
 * Upload images to imgbb.
 * @param {string} file a path to the file to upload
 * @param {string} apiKey the API key to access imgbb.com
 * @param {object} extraOptions dictionary with additional options that may be not supported
 *                 by every upload method. imgbb supports name and expiration (in seconds 60-15552000)
 * @see https://api.imgbb.com/ for information about API
 */
async function uploadFile(file, apiKey, extraOptions) {
  const assert = __nccwpck_require__(613);
  assert(apiKey, 'apiKey is required');
  const axios = __nccwpck_require__(422);
  const FormData = __nccwpck_require__(603);
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


/***/ }),

/***/ 113:
/***/ ((module) => {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 422:
/***/ ((module) => {

module.exports = eval("require")("axios");


/***/ }),

/***/ 603:
/***/ ((module) => {

module.exports = eval("require")("form-data");


/***/ }),

/***/ 613:
/***/ ((module) => {

"use strict";
module.exports = require("assert");

/***/ }),

/***/ 896:
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
/**
 * A github action that uploads an image and stores its url.
 */

const core = __nccwpck_require__(113);
const uploadImage = __nccwpck_require__(223);
const assert = __nccwpck_require__(613);

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
          core.info(`Image uploaded to ${result.url} with expiration ${result.expiration}`);
          results.set(pathToUpload, result);
        }),
    );

    const url = paths
        .map((pathToUpload) => {
          return results.get(pathToUpload)?.url;
        })
        .join('\n');
    core.debug(`Setting output url to: ${url}`);
    core.setOutput('url', url);

    const expiration = paths
        .map((pathToUpload) => {
          return results.get(pathToUpload)?.expiration;
        })
        .join('\n');
    core.debug(`Setting output expiration to: ${expiration}`);
    core.setOutput('expiration', expiration);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();

module.exports = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=index.js.map