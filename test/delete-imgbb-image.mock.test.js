require("dotenv").config();
const axios = require("axios");

jest.mock("axios");

const setInput = (name, value) =>
  (process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`] = value);

describe('deleteImgbbImage', () => {
  let run;
  
  const mockApiKey = 'test-api-key';
  const mockId = '12345';
  const mockHash = 'abcde';
  const mockDeleteUrl = `https://ibb.co/${mockId}/${mockHash}`;

  beforeEach(() => {
    jest.clearAllMocks();
    // Get a fresh copy of the module
    run = require("../delete-imgbb-image");
    
    setInput('apiKey', mockApiKey);
    setInput('deleteUrl', mockDeleteUrl);
  });

  it('should successfully delete an image', async () => {
    const mockResponse = { status: 200 };
    axios.mockImplementationOnce(() => Promise.resolve(mockResponse));
    
    await run();

    expect(axios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'https://ibb.co/json',
        method: 'POST',
        data: { 
          auth_token: mockApiKey,
          action: 'delete',
          delete: 'image',
          pathname: `/${mockId}/${mockHash}`,
          from: 'resource',
          'deleting[id]': mockId,
          'deleting[type]': 'image',
          'deleting[privacy]': 'public',
          'deleting[hash]': mockHash
        }
      })
    );
  });

  it('should handle deletion failure', async () => {
    axios.mockRejectedValueOnce(new Error('Failed to delete image'));
    await expect(run()).rejects.toThrow();
  });

  it('should throw when delete URL is invalid', async () => {
    setInput('deleteUrl', '');
    await expect(run()).rejects.toThrow();
    expect(axios).not.toHaveBeenCalled();
  });

  it('should delete images from a multiline delete URL', async () => {
    const numberOfImages = 3;
    const mockDeleteUrls = `${mockDeleteUrl}\n`.repeat(numberOfImages);
    for (let i = 0; i < numberOfImages; i++) {
      axios.mockImplementationOnce(() => Promise.resolve({ status: 200 }));
    }
    setInput('deleteUrl', mockDeleteUrls);

    await run();
    
    expect(axios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'https://ibb.co/json',
        method: 'POST',
        data: { 
          auth_token: mockApiKey,
          action: 'delete',
          delete: 'image',
          pathname: `/${mockId}/${mockHash}`,
          from: 'resource',
          'deleting[id]': mockId,
          'deleting[type]': 'image',
          'deleting[privacy]': 'public',
          'deleting[hash]': mockHash
        }
      })
    );
    expect(axios).toHaveBeenCalledTimes(numberOfImages);
    });

    it('should delete images from a JSON array of delete URLs', async () => {
      const numberOfImages = 3;
      const mockDeleteUrls = JSON.stringify(
        Array.from({ length: numberOfImages }, () => mockDeleteUrl)
      );
      for (let i = 0; i < numberOfImages; i++) {
        axios.mockImplementationOnce(() => Promise.resolve({ status: 200 }));
      }
      setInput('deleteUrl', '');
      setInput('deleteUrls', mockDeleteUrls);
  
      await run();
      
      expect(axios).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://ibb.co/json',
          method: 'POST',
          data: { 
            auth_token: mockApiKey,
            action: 'delete',
            delete: 'image',
            pathname: `/${mockId}/${mockHash}`,
            from: 'resource',
            'deleting[id]': mockId,
            'deleting[type]': 'image',
            'deleting[privacy]': 'public',
            'deleting[hash]': mockHash
          }
        })
      );
      expect(axios).toHaveBeenCalledTimes(numberOfImages);
    });
    it('should delete images from a multiline delete URL and a JSON array of delete URLs', async () => {
      const numberOfImages = 2;
      const mockDeleteUrls = `${mockDeleteUrl}\n`.repeat(numberOfImages);
      const mockDeleteUrlsJson = JSON.stringify(
        Array.from({ length: numberOfImages }, () => mockDeleteUrl)
      );
      for (let i = 0; i < numberOfImages * 2; i++) {
        axios.mockImplementationOnce(() => Promise.resolve({ status: 200 }));
      }
      setInput('deleteUrl', mockDeleteUrls);
      setInput('deleteUrls', mockDeleteUrlsJson);
  
      await run();
      
      expect(axios).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://ibb.co/json',
          method: 'POST',
          data: { 
            auth_token: mockApiKey,
            action: 'delete',
            delete: 'image',
            pathname: `/${mockId}/${mockHash}`,
            from: 'resource',
            'deleting[id]': mockId,
            'deleting[type]': 'image',
            'deleting[privacy]': 'public',
            'deleting[hash]': mockHash
          }
        })
      );
      expect(axios).toHaveBeenCalledTimes(numberOfImages * 2);
    });

    it('should throw when delete URLs not set', async () => {
      setInput('deleteUrl', '');
      setInput('deleteUrls', '');
      await expect(run()).rejects.toThrow();
      expect(axios).not.toHaveBeenCalled();
    });

    it('should log and throw error for missing API key', async () => {
      setInput('deleteUrl', mockDeleteUrl);
      setInput('apiKey', '');
      await expect(run()).rejects.toThrow('apiKey is required');
      expect(axios).not.toHaveBeenCalled();
    });

    it('should throw if delete url is invalid', async () => {
      setInput('deleteUrl', 'https://ibb.co/invalid');
      await expect(run()).rejects.toThrow('Failed to delete https://ibb.co/invalid: Invalid delete URL');
      expect(axios).not.toHaveBeenCalled();
    });
});
