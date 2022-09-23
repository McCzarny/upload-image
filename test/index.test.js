const process = require('process');
const cp = require('child_process');
const path = require('path');
const assert = require('assert');

/**
 * Tests for index.js.
 *
 * @group unit/indexjs
 */

// shows how the runner will run a javascript action with env / stdout protocol
test('upload an image using index.js', () => {
  const setInput = (name, value) =>
    (process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`] = value);
  setInput('path', 'test-resources/0.png');
  setInput('uploadMethod', 'imgbb');
  setInput('apiKey', process.env['API_KEY']);
  const ip = path.join(__dirname, '..', 'index.js');
  const result = cp.execSync(`node ${ip}`, {env: process.env}).toString();
  expect(result).toMatch(new RegExp('::set-output name=url::https:\\/\\/i.ibb.co\\/.*\\.png'));
});

test('upload using index.js with an invalid API key, expect a failure', () => {
  const setInput = (name, value) =>
    (process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`] = value);
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
  const setInput = (name, value) =>
    (process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`] = value);
  setInput('path', 'test-resources/0.png\ntest-resources/1.png\ntest-resources/2.png');
  setInput('uploadMethod', 'imgbb');
  setInput('apiKey', process.env['API_KEY']);
  const ip = path.join(__dirname, '..', 'index.js');
  const result = cp.execSync(`node ${ip}`, {env: process.env}).toString();
  expect(result).toMatch(new RegExp('::set-output name=url::(https:\\/\\/i.ibb.co\\/.*\\.png(%0A)?){3}'));
});
test('upload multiple with index.js with a single invalid path, expect a failure', () => {
  const setInput = (name, value) =>
    (process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`] = value);
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
