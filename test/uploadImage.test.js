const uploadImage = require('../uploadImage');
const process = require('process');
const assert = require('assert');

/**
 * Tests for uploadImage.
 *
 * @group unit/uploadimage
 */

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
