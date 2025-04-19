require('dotenv').config();
const cp = require('child_process');
const path = require('path');
const assert = require('assert');
const fs = require('fs');

// Imgbb credentials
const imgbbApiKey = process.env['API_KEY'];

if (!imgbbApiKey) {
  console.warn('API_KEY is not set. Skipping Imgbb tests.');
}

// Cloudinary credentials
const cloudinaryApiKey = process.env['CLOUDINARY_API_KEY'];
const cloudinaryApiSecret = process.env['CLOUDINARY_API_SECRET'];
const cloudinaryCloudName = process.env['CLOUDINARY_CLOUD_NAME'];

if (!cloudinaryApiKey) {
  console.warn('CLOUDINARY_API_KEY is not set. Skipping Cloudinary tests.');
}else if (!cloudinaryApiSecret) {
  console.warn('CLOUDINARY_API_SECRET is not set. Skipping Cloudinary tests.');
} else if (!cloudinaryCloudName) {
  console.warn('CLOUDINARY_CLOUD_NAME is not set. Skipping Cloudinary tests.');
}

const testIf = (condition, ...args) =>
  condition ? test(...args) : test.skip(...args);
let inputsToClear = [];
const setInput = (name, value) =>
{
    let key = `INPUT_${name.replace(/ /g, '_').toUpperCase()}`;
    inputsToClear.push(key);
    process.env[key] = value;
  };

/**
 * Generate a random path for the github output file and create it.
 * @return {string} Randomized name for the github output file
 */
function generateGithubOutputFile() {
  const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
  const random = ('' + Math.random()).substring(2, 8);
  const fullPath = path.join(__dirname, 'GITHUB_OUTPUT_' + timestamp+random);
  fs.writeFileSync(fullPath, '');
  console.log('GITHUB_OUTPUT:', fullPath);
  return fullPath;
}

/**
 * Method to get the value of an output from the github output file.
 * The implementation is only for these tests to work. Don't take it as a
 * reference for your own code.
 * The github output file has content like this:
 *
 * url<<ghadelimiter_UUID
 * https://i.ibb.co/url.png
 * ghadelimiter_UUID
 * @param {string} key The key to get the value from.
 * @return {string|undefined} The value of the key or undefined if the key doesn't exist.
 */
function getValueFromGithubOutput(key) {
  const content = fs.readFileSync(process.env['GITHUB_OUTPUT'], 'utf8');
  const lines = content.split('\n');
  const keyLine = lines.find((line) => line.startsWith(key + '<<'));
  if (!keyLine) {
    return undefined;
  }

  let value = '';
  for (let i = lines.indexOf(keyLine) + 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('ghadelimiter_')) {
      break;
    }
    value += line;
  }

  return value;
}

/**
 * Method to get the value of an output from the github output file.
 * The implementation returns the data as an array of strings.
 * The github output file has content like this:
 *
 * url<<ghadelimiter_UUID
 * https://i.ibb.co/url.png
 * ghadelimiter_UUID
 * @param {string} key The key to get the value from.
 * @return {string[]} The values of the key as an array or empty array if the key doesn't exist.
 */
function getArrayFromGithubOutput(key) {
  const content = fs.readFileSync(process.env['GITHUB_OUTPUT'], 'utf8');
  const lines = content.split('\n');
  const keyLine = lines.find((line) => line.startsWith(key + '<<'));
  if (!keyLine) {
    return [];
  }

  let value = [];
  for (let i = lines.indexOf(keyLine) + 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('ghadelimiter_')) {
      break;
    }
    value.push(line);
  }

  return value;
}


// Setup
beforeEach(() => {
  process.env['GITHUB_OUTPUT'] = generateGithubOutputFile();
});

// Teardown

afterEach(() => {
  fs.unlinkSync(process.env['GITHUB_OUTPUT']);
  // Clear all inputs from the environment
  for (const key of inputsToClear) {
    delete process.env[key];
  }
  inputsToClear = [];
});

const IMGBB_URL_REGEX = /https:\/\/i\.ibb\.co\/.*\.png/;
const IMGBB_DELETE_URL_REGEX = /https:\/\/ibb\.co\/.*/;

const CLOUDINARY_URL_REGEX = /https:\/\/res\.cloudinary\.com\/.*\/image\/upload\/.*\.png/;

/**
 * Tests for index.js.
 *
 * @group unit/indexjs
 */

// shows how the runner will run a javascript action with env / stdout protocol
testIf(imgbbApiKey, 'upload an image using index.js', () => {
  setInput('path', 'test-resources/0.png');
  setInput('upload-method', 'imgbb');
  setInput('api-key', imgbbApiKey);
  const ip = path.join(__dirname, '..', 'index.js');
  try {
    const childProcess = cp.execFileSync('node', [ip], {env: process.env});
    console.log(childProcess.toString());
  } catch (error) {
    console.log(error);
    console.log('std out:' + new TextDecoder().decode(error.stdout));
    throw error;
  }
  // Expect that GITHUB_OUTPUT contains the url of the uploaded image
  const fileExists = fs.existsSync(process.env['GITHUB_OUTPUT']);
  expect(fileExists).toBe(true);

  // url
  const url = getValueFromGithubOutput('url').trim();
  expect(url).toMatch(IMGBB_URL_REGEX);
  
  // expiration
  const expiration = getValueFromGithubOutput('expiration').trim();
  expect(expiration.length).toBeGreaterThan(0);
  const expirationNumber = parseFloat(expiration);
  expect(isNaN(expirationNumber)).toBeFalsy();
  expect(Number.isSafeInteger(expirationNumber)).toBeTruthy();
  expect(expirationNumber).toBeGreaterThanOrEqual(0);

  // urls
  const urls = getValueFromGithubOutput('urls');
  expect(urls.length).toBeGreaterThan(0);
  const urlsArray = JSON.parse(urls);
  expect(Array.isArray(urlsArray)).toBeTruthy();
  expect(urlsArray.length).toBe(1);
  expect(urlsArray[0]).toBe(url);

  // delete_url
  const delete_url = getValueFromGithubOutput('delete-url').trim();
  expect(delete_url).toMatch(IMGBB_DELETE_URL_REGEX);

  // delete_urls
  const delete_urls = getValueFromGithubOutput('delete-urls');
  expect(delete_urls.length).toBeGreaterThan(0);
  const delete_urlsArray = JSON.parse(delete_urls);
  expect(Array.isArray(delete_urlsArray)).toBeTruthy();
  expect(delete_urlsArray.length).toBe(1);
  expect(delete_urlsArray[0]).toBe(delete_url);
});

test('upload using index.js with an invalid API key, expect a failure', () => {
  setInput('path', 'test-resources/0.png');
  setInput('upload-method', 'imgbb');
  setInput('api-key', 'invalid API key');
  const ip = path.join(__dirname, '..', 'index.js');

  let exceptionThrown = false;
  try {
    cp.execFileSync('node', [ip], {env: process.env}).toString();
  } catch {
    exceptionThrown = true;
  }

  assert(exceptionThrown, 'An invalid API key didn\'t throw an exception.');
});

testIf(imgbbApiKey, 'upload multiple images using index.js', () => {
  setInput('path', 'test-resources/0.png\ntest-resources/1.png\ntest-resources/2.png');
  setInput('upload-method', 'imgbb');
  setInput('api-key', imgbbApiKey);
  const ip = path.join(__dirname, '..', 'index.js');

  try {
    const childProcess = cp.execFileSync('node', [ip],  {env: process.env});
    console.log(childProcess.toString());
  } catch (error) {
    console.log(error);
    console.log('std out:' + new TextDecoder().decode(error.stdout));
    throw error;
  }

  // Expect that GITHUB_OUTPUT contains the url of the uploaded image
  const fileExists = fs.existsSync(process.env['GITHUB_OUTPUT']);
  expect(fileExists).toBe(true);
  
  // url
  const url = getValueFromGithubOutput('url');
  expect(url).toMatch(new RegExp('(https:\\/\\/i.ibb.co\\/.*\\.png(%0A)?){3}'));
  
  // expiration
  const expirations = getArrayFromGithubOutput('expiration');
  expect(Array.isArray(expirations)).toBeTruthy();
  expect(expirations.length).toBe(3);
  for (const expiration of expirations) {
    expect(expiration.length).toBeGreaterThan(0);
    const expirationNumber = parseFloat(expiration);
    expect(isNaN(expirationNumber)).toBeFalsy();
    expect(Number.isSafeInteger(expirationNumber)).toBeTruthy();
    expect(expirationNumber).toBeGreaterThanOrEqual(0);
  }

  // urls
  const urls = getValueFromGithubOutput('urls');
  expect(urls.length).toBeGreaterThan(0);
  const urlsArray = JSON.parse(urls);
  expect(Array.isArray(urlsArray)).toBeTruthy();
  expect(urlsArray.length).toBe(3);
  for (const uploadedUrl of urlsArray) {
    expect(uploadedUrl.length).toBeGreaterThan(0);
    expect(uploadedUrl).toMatch(IMGBB_URL_REGEX);
  }

  // delete-url
  const delete_url = getValueFromGithubOutput('delete-url');
  expect(delete_url).toMatch(new RegExp('(https:\\/\\/ibb.co\\/.*(%0A)?){3}'));

  // delete-urls
  const delete_urls = getValueFromGithubOutput('delete-urls');
  expect(delete_urls.length).toBeGreaterThan(0);
  const delete_urlsArray = JSON.parse(delete_urls);
  expect(Array.isArray(delete_urlsArray)).toBeTruthy();
  expect(delete_urlsArray.length).toBe(3);
  for (const deleteUrl of delete_urlsArray) {
    expect(deleteUrl.length).toBeGreaterThan(0);
    expect(deleteUrl).toMatch(IMGBB_DELETE_URL_REGEX);
  }
});

testIf(imgbbApiKey, 'upload multiple with index.js with a single invalid path, expect a failure', () => {
  setInput('path', 'test-resources/0.png\ntest-resources/1.png\ntest-resources/INVALID');
  setInput('upload-method', 'imgbb');
  setInput('api-key', imgbbApiKey);
  const ip = path.join(__dirname, '..', 'index.js');

  let exceptionThrown = false;
  try {
    cp.execFileSync('node', [ip], {env: process.env}).toString();
  } catch {
    exceptionThrown = true;
  }

  assert(exceptionThrown, 'An invalid path didn\'t throw an exception.');
});

testIf(imgbbApiKey, 'upload an image and delete if using delete-imgbb-image action', async () => {
  const ip = path.join(__dirname, '..', 'index.js');
  setInput('path', 'test-resources/0.png');
  setInput('upload-method', 'imgbb');
  setInput('api-key', imgbbApiKey);

  cp.execFileSync('node', [ip], {env: process.env}).toString();

  const url = getValueFromGithubOutput('url').trim();
  // Print url for a manual check
  console.log('url:', url);
  expect(url).toMatch(IMGBB_URL_REGEX);
  const delete_url = getValueFromGithubOutput('delete-url').trim();
  expect(delete_url).toMatch(IMGBB_DELETE_URL_REGEX);

  const deleteIp = path.join(__dirname, '..', 'delete-imgbb-image.js');
  setInput('api-key', imgbbApiKey);
  setInput('delete-url', delete_url);

  try {
    cp.execFileSync('node', [deleteIp], {env: process.env}).toString();
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
});

testIf(
  cloudinaryApiKey && cloudinaryApiSecret && cloudinaryCloudName,
  'upload an image using index.js with Cloudinary', () => {
  setInput('path', 'test-resources/0.png');
  setInput('upload-method', 'cloudinary');
  setInput('api-key', cloudinaryApiKey);
  setInput('api-secret', cloudinaryApiSecret);
  setInput('cloud-name', cloudinaryCloudName);
  const ip = path.join(__dirname, '..', 'index.js');
  try {
    const childProcess = cp.execFileSync('node', [ip], {env: process.env});
    console.log(childProcess.toString());
  } catch (error) {
    console.log(error);
    console.log('std out:' + new TextDecoder().decode(error.stdout));
    throw error;
  }
  // Expect that GITHUB_OUTPUT contains the url of the uploaded image
  const fileExists = fs.existsSync(process.env['GITHUB_OUTPUT']);
  expect(fileExists).toBe(true);

  // url
  const url = getValueFromGithubOutput('url').trim();
  expect(url).toMatch(CLOUDINARY_URL_REGEX);

  // urls
  const urls = getValueFromGithubOutput('urls');
  expect(urls.length).toBeGreaterThan(0);
  const urlsArray = JSON.parse(urls);
  expect(Array.isArray(urlsArray)).toBeTruthy();
  expect(urlsArray.length).toBe(1);
  expect(urlsArray[0]).toBe(url);
});

// Legacy inputs and outputs tests

testIf(imgbbApiKey, 'upload an image and delete if using delete-imgbb-image action (legacy)', async () => {
  const ip = path.join(__dirname, '..', 'index.js');
  setInput('path', 'test-resources/2.png');
  setInput('uploadMethod', 'imgbb');
  setInput('apiKey', imgbbApiKey);

  cp.execFileSync('node', [ip], {env: process.env}).toString();

  const url = getValueFromGithubOutput('url').trim();
  // Print url for a manual check
  console.log('url:', url);
  expect(url).toMatch(IMGBB_URL_REGEX);
  const delete_url = getValueFromGithubOutput('delete_url').trim();
  expect(delete_url).toMatch(IMGBB_DELETE_URL_REGEX);

  const deleteIp = path.join(__dirname, '..', 'delete-imgbb-image.js');
  setInput('apiKey', imgbbApiKey);
  setInput('deleteUrl', delete_url);

  try {
    cp.execFileSync('node', [deleteIp], {env: process.env}).toString();
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
});
