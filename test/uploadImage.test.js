const uploadImage = require('../uploadImage');
const process = require('process');
const assert = require('assert');
const fetch = require('node-fetch');

/**
 * Tests for uploadImage.
 *
 * @group unit/uploadimage
 */

test('upload an image', async () => {
  const result = await uploadImage(
      'test-resources/0.png',
      'imgbb',
      process.env['API_KEY'],
  );
  const url = result.url;
  expect(url).toMatch(new RegExp('https:\\/\\/i.ibb.co\\/.*\\.png'));
});

test('upload with a wrong API key, should return undefined', async () => {
  const result = await uploadImage(
      'test-resources/0.png',
      'imgbb',
      'incorrect-api-key',
  );
  assert(
      typeof result === 'undefined',
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

const LongTestTimeout = 60 * 1000 * 2;
// Long test to for expiration option.
// The minimum expiration time for imgbb is 1 minute.
test('upload an image with expiration option,', async () => {
  const expirationInSeconds = 60;
  const result = await uploadImage(
      'test-resources/0.png',
      'imgbb',
      process.env['API_KEY'],
      {expiration: expirationInSeconds},
  );
  const url = result.url;
  expect(url).toMatch(new RegExp('https:\\/\\/i.ibb.co\\/.*\\.png'));

  // Verify  that the image is accessible.
  const response = await fetch(url);
  expect(response.status).toBe(200);

  // Wait a little bit longer that the expiration time and verify that the image is not accessible.
  await new Promise((resolve) => setTimeout(resolve, expirationInSeconds * 1000 * 1.5));

  const response2 = await fetch(url);
  // Log response.
  console.log(response2);
  expect(response2.status).toBe(404);
}, LongTestTimeout);
