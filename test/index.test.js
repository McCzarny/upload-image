require('dotenv').config();
const process = require('process');
const cp = require('child_process');
const path = require('path');
const assert = require('assert');
const fs = require('fs');


const setInput = (name, value) =>
  (process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`] = value);

/**
 * Generate a random path for the github output file and create it.
 * @return {string} Randomized name for the github output file
 */
function generateGithubOutputFile() {
  const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
  const random = ('' + Math.random()).substring(2, 8);
  const fullPath = path.join(__dirname, 'GITHUB_OUTPUT_' + timestamp+random);
  fs.writeFileSync(fullPath, '');
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
 * @param {string} githubOutputPath The path to the github output file.
 * @param {string} key The key to get the value from.
 * @return {string|undefined} The value of the key or undefined if the key doesn't exist.
 */
function getValueFromGithubOutput(githubOutputPath, key) {
  const content = fs.readFileSync(githubOutputPath, 'utf8');
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
 * @param {string} githubOutputPath The path to the github output file.
 * @param {string} key The key to get the value from.
 * @return {string[]} The values of the key as an array or empty array if the key doesn't exist.
 */
function getArrayFromGithubOutput(githubOutputPath, key) {
  const content = fs.readFileSync(githubOutputPath, 'utf8');
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

// Shared variables
let githubOutputPath;

// Setup

beforeEach(() => {
  githubOutputPath = generateGithubOutputFile();
});

// Teardown

afterEach(() => {
  fs.unlinkSync(githubOutputPath);
});

/**
 * Tests for index.js.
 *
 * @group unit/indexjs
 */

// shows how the runner will run a javascript action with env / stdout protocol
test('upload an image using index.js', () => {
  setInput('path', 'test-resources/0.png');
  setInput('uploadMethod', 'imgbb');
  setInput('apiKey', process.env['API_KEY']);
  const ip = path.join(__dirname, '..', 'index.js');
  process.env['GITHUB_OUTPUT'] = githubOutputPath;
  try {
    const childProcess = cp.execSync(`node ${ip}`, {env: process.env});
    console.log(childProcess.toString());
  } catch (error) {
    console.log(error);
    console.log('std out:' + new TextDecoder().decode(error.stdout));
    throw error;
  }
  // Expect that GITHUB_OUTPUT contains the url of the uploaded image
  const fileExists = fs.existsSync(githubOutputPath);
  expect(fileExists).toBe(true);

  const url = getValueFromGithubOutput(githubOutputPath, 'url').trim();
  expect(url).toMatch(/https:\/\/i\.ibb\.co\/.*\.png/);
  const expiration = getValueFromGithubOutput(githubOutputPath, 'expiration').trim();
  expect(expiration.length).toBeGreaterThan(0);
  const expirationNumber = parseFloat(expiration);
  expect(isNaN(expirationNumber)).toBeFalsy();
  expect(Number.isSafeInteger(expirationNumber)).toBeTruthy();
  expect(expirationNumber).toBeGreaterThanOrEqual(0);

  const urls = getValueFromGithubOutput(githubOutputPath, 'urls');
  expect(urls.length).toBeGreaterThan(0);
  const urlsArray = JSON.parse(urls);
  expect(Array.isArray(urlsArray)).toBeTruthy();
  expect(urlsArray.length).toBe(1);
  expect(urlsArray[0]).toBe(url);
});

test('upload using index.js with an invalid API key, expect a failure', () => {
  setInput('path', 'test-resources/0.png');
  setInput('uploadMethod', 'imgbb');
  setInput('apiKey', 'invalid API key');
  const ip = path.join(__dirname, '..', 'index.js');

  let exceptionThrown = false;
  try {
    cp.execSync(`node ${ip}`, {env: process.env}).toString();
  } catch (error) {
    exceptionThrown = true;
  }

  assert(exceptionThrown, 'An invalid API key didn\'t throw an exception.');
});

test('upload multiple images using index.js', () => {
  setInput('path', 'test-resources/0.png\ntest-resources/1.png\ntest-resources/2.png');
  setInput('uploadMethod', 'imgbb');
  setInput('apiKey', process.env['API_KEY']);
  const ip = path.join(__dirname, '..', 'index.js');
  process.env['GITHUB_OUTPUT'] = githubOutputPath;

  try {
    const childProcess = cp.execSync(`node ${ip}`, {env: process.env});
    console.log(childProcess.toString());
  } catch (error) {
    console.log(error);
    console.log('std out:' + new TextDecoder().decode(error.stdout));
    throw error;
  }

  // Expect that GITHUB_OUTPUT contains the url of the uploaded image
  const fileExists = fs.existsSync(githubOutputPath);
  expect(fileExists).toBe(true);
  const url = getValueFromGithubOutput(githubOutputPath, 'url');
  expect(url).toMatch(new RegExp('(https:\\/\\/i.ibb.co\\/.*\\.png(%0A)?){3}'));
  const expirations = getArrayFromGithubOutput(githubOutputPath, 'expiration');
  expect(Array.isArray(expirations)).toBeTruthy();
  expect(expirations.length).toBe(3);
  for (const expiration of expirations) {
    expect(expiration.length).toBeGreaterThan(0);
    const expirationNumber = parseFloat(expiration);
    expect(isNaN(expirationNumber)).toBeFalsy();
    expect(Number.isSafeInteger(expirationNumber)).toBeTruthy();
    expect(expirationNumber).toBeGreaterThanOrEqual(0);
  }

  const urls = getValueFromGithubOutput(githubOutputPath, 'urls');
  expect(urls.length).toBeGreaterThan(0);
  const urlsArray = JSON.parse(urls);
  expect(Array.isArray(urlsArray)).toBeTruthy();
  expect(urlsArray.length).toBe(3);
  for (const uploadedUrl of urlsArray) {
    expect(uploadedUrl.length).toBeGreaterThan(0);
    expect(uploadedUrl).toMatch(/https:\/\/i\.ibb\.co\/.*\.png/);
  }
});

test('upload multiple with index.js with a single invalid path, expect a failure', () => {
  setInput('path', 'test-resources/0.png\ntest-resources/1.png\ntest-resources/INVALID');
  setInput('uploadMethod', 'imgbb');
  setInput('apiKey', process.env['API_KEY']);
  const ip = path.join(__dirname, '..', 'index.js');

  let exceptionThrown = false;
  try {
    cp.execSync(`node ${ip}`, {env: process.env}).toString();
  } catch (error) {
    exceptionThrown = true;
  }

  assert(exceptionThrown, 'An invalid path didn\'t throw an exception.');
});
