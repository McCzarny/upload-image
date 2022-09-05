const uploadImage = require('./uploadImage');
const process = require('process');
const cp = require('child_process');
const path = require('path');
const assert = require('assert');

test('upload an image', async () => {
  const url = await uploadImage(
      'test-resources/0.png',
      'imgbb',
      process.env['API_KEY'],
  );
  expect(url).toMatch(new RegExp('https:\\/\\/i.ibb.co\\/.*\\.png'));
});

test('upload with a wrong API key, should return undefined', async () => {
  const url = await uploadImage(
      'test-resources/0.png',
      'imgbb',
      'incorrect-api-key',
  );

  assert(
      typeof url === 'undefined',
      'An incorrect api-key didn\'t generate an undefined value.',
  );
});

test('upload with an unknown method, should throw an exception', async () => {
  await expect( () =>
    uploadImage(
        'test-resources/0.png',
        'unknown method',
        process.env['API_KEY'],
    )).rejects.toThrow();
});

test('upload with an incorrect path, should throw an exception', async () => {
  await expect(
      () =>
        uploadImage(
            'incorrect-path',
            'imgbb',
            process.env['API_KEY']),
  ).rejects.toThrow();
});

// shows how the runner will run a javascript action with env / stdout protocol
test('upload an image using index.js', () => {
  const setInput = (name, value) =>
    (process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`] = value);
  setInput('path', 'test-resources/0.png');
  setInput('uploadMethod', 'imgbb');
  setInput('apiKey', process.env['API_KEY']);
  const ip = path.join(__dirname, 'index.js');
  const result = cp.execSync(`node ${ip}`, {env: process.env}).toString();
  expect(result).toMatch(new RegExp('https:\\/\\/i.ibb.co\\/.*\\.png'));
});

test('upload using index.js with an invalid API key, expect a failure', () => {
  const setInput = (name, value) =>
    (process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`] = value);
  setInput('path', 'test-resources/0.png');
  setInput('uploadMethod', 'imgbb');
  setInput('apiKey', 'invalid API key');
  const ip = path.join(__dirname, 'index.js');

  let exceptionThrown = false;
  try {
    cp.execSync(`node ${ip}`, {env: process.env}).toString();
  } catch (error) {
    exceptionThrown = true;
  }

  assert(exceptionThrown, 'An invalid API key didn\'t throw an exception.');
});
