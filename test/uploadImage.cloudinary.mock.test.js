const uploadImage = require("../uploadImage");
const cloudinary = require("cloudinary").v2;

jest.mock("cloudinary", () => ({
  v2: {
    uploader: {
      upload: jest.fn(),
    },
    config: jest.fn(),
  },
}));

describe("Mocked Tests for uploadImage with Cloudinary", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const MOCK_URL = "https://mocked.cloudinary.com/image.png";
  const MOCK_VALID_RESPONSE = {
    secure_url: MOCK_URL,
  };

  test("mocked upload an image", async () => {
    cloudinary.uploader.upload.mockResolvedValueOnce(MOCK_VALID_RESPONSE);

    const result = await uploadImage(
      "test-resources/0.png",
      "cloudinary",
      "correct-api-key",
      { "cloud-name": "mocked-cloud", "api-secret": "mocked-secret" }
    );
    expect(result.url).toBe(MOCK_URL);
    expect(result.expiration).toBe(0);
    expect(result.delete_url).toBeNull();
  });

  test("mocked upload with a missing file, should throw an error", async () => {
    await expect(
      uploadImage(null, "cloudinary", "correct-api-key", {
        "cloud-name": "mocked-cloud",
        "api-secret": "mocked-secret",
      })
    ).rejects.toThrow("File is required for upload.");
  });

  test("mocked upload with missing cloud-name, should throw an error", async () => {
    await expect(
      uploadImage("test-resources/0.png",       "cloudinary",
        "correct-api-key", {
        "api-secret": "mocked-secret",
      })
    ).rejects.toThrow("Cloudinary upload requires cloud-name input.");
  });

  test("mocked upload with missing api-secret, should throw an error", async () => {
    await expect(
      uploadImage("test-resources/0.png",      "cloudinary",
        "correct-api-key", {
        "cloud-name": "mocked-cloud",
      })
    ).rejects.toThrow("Cloudinary upload requires api-secret input.");
  });

  test("mocked upload with additional options", async () => {
    cloudinary.uploader.upload.mockResolvedValueOnce(MOCK_VALID_RESPONSE);

    const result = await uploadImage(
      "test-resources/0.png",
      "cloudinary",
      "correct-api-key",
      {
        "cloud-name": "mocked-cloud",
        "api-secret": "mocked-secret",
        folder: "test-folder",
      }
    );

    expect(result.url).toBe(MOCK_URL);
    expect(result.expiration).toBe(0);
    expect(result.delete_url).toBeNull();
  });
});
