require('dotenv').config();
const uploadImage = require('../uploadImage');
const assert = require('assert');
const axios = require('axios');

jest.mock('axios', () => jest.fn());


describe('Mocked Tests for uploadImage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('mocked upload an image', async () => {
    const mockResponse = {
      data: {
        data: {
          url: 'https://mocked.imgbb.com/image.png',
          expiration: 3600
        }
      }
    };
    axios.mockResolvedValueOnce(mockResponse);

    const result = await uploadImage(
      'test-resources/0.png',
      'imgbb',
      'correct-api-key',
    );
    expect(result.url).toBe('https://mocked.imgbb.com/image.png');
    expect(result.expiration).toBe(3600);
  });

  test('mocked upload with a wrong API key, should return undefined', async () => {
    axios.mockRejectedValue(new Error('Invalid API key'));

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
  test('mocked upload with expiration option', async () => {
    const mockResponse = {
      data: {
        data: {
          url: 'https://mocked.imgbb.com/image.png',
          expiration: 3600
        }
      }
    };
    // Ensure that the expiration option is passed to the API
    axios.mockResolvedValueOnce(mockResponse);
    const result = await uploadImage(
      'test-resources/0.png',
      'imgbb',
      'correct-api-key',
      { expiration: 3600 },
    );
    expect(result.url).toBe('https://mocked.imgbb.com/image.png');
    expect(result.expiration).toBe(3600);
    expect(axios).toHaveBeenCalledWith(expect.objectContaining({
      params: { "expiration": 3600, "key": "correct-api-key" }
    }));
  });
});
