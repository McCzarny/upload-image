const core = require('@actions/core');
const uploadImage = require('./uploadImage');

// most @actions toolkit packages have async methods
async function run() {
  try {
    const path = core.getInput('path');
    const uploadMethod = core.getInput('uploadMethod');
    const apiKey = core.getInput('apiKey');
    core.info(`Uploding an image ${path} to ${uploadMethod}...`);

    var url = await uploadImage(path, uploadMethod, apiKey);
    core.info(url);

    core.setOutput('url', url);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();