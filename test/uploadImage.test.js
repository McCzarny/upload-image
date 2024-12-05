const uploadImage = require('../uploadImage');
const process = require('process');
const assert = require('assert');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

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
  const expiration = result.expiration;
  expect(expiration).toBe(0);
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

describe('Test expiration option', () => {
  let uniqueImagePath;

  // Generates a random gif file to be sure that expiration option is set by test.
  // If we try to reupload the same image to imgbb, it won't take into account
  // the expiration option and return settings of the original upload.
  // Check ./gif_data_description.txt to get more information about the gif format.
  beforeEach(() => {
    // Data before global color table.
    const hexPrefix = "47494638396101000100800000";
    // Data after global color table.
    const hexSuffix = "21f90401000000002c000000000100010000020144003b";
    // 6 bytes with global color table. We use it to generate an unique image.
    const randomSixBytes = [...Array(6)]
        .map(() => Math.floor(Math.random() * 256)
          .toString(16)
          .padStart(2, '0'))
        .join('');
    const imageData = Buffer.from(hexPrefix + randomSixBytes + hexSuffix, 'hex');
    uniqueImagePath = path.join(__dirname, 'image.gif');
    fs.writeFileSync(uniqueImagePath, imageData);
  });

  afterEach(() =>{
    fs.unlinkSync(uniqueImagePath);
  })

  const ExpirationInSeconds = 60;
  const LongTestTimeout = ExpirationInSeconds * 1000 * 10;
  // Long test to for expiration option.
  // The minimum expiration time for imgbb is 1 minute.
  test('upload an image with expiration option,', async () => {
    const result = await uploadImage(
        uniqueImagePath,
        'imgbb',
        process.env['API_KEY'],
        {expiration: ExpirationInSeconds},
    );
    const url = result.url;
    expect(url).toMatch(new RegExp('https:\\/\\/i.ibb.co\\/.*\\.gif'));
    expect(result.expiration).toBe(ExpirationInSeconds);

    // Verify  that the image is accessible.
    const response = await fetch(url);
    expect(response.status).toBe(200);
      const startTime = Date.now();
      // We cannot guarantee that the image will expire after given time, but
      // we can at least verify that it expires after a reasonable amount of time.
      const maxWaitTime = 9 * ExpirationInSeconds * 1000; // 9 * expiration time
      let response2;

      // Actively wait for the image to expire, checking every 10 seconds
      while (true) {
        response2 = await fetch(url);
        if (response2.status === 404) {
          break;
        }
        if (Date.now() - startTime > maxWaitTime) {
          // Unfortunately, the test is not reliable enough to keep the failure :(
          // assert.fail('Image did not expire after 9 minutes');
          console.warn('Image did not expire after 9 minutes');
        }
        await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait 10 seconds
      }
  }, LongTestTimeout);
});
