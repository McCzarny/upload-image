require("dotenv").config();
const uploadImage = require("../uploadImage");
const assert = require("assert");
const axios = require("axios");

jest.mock("axios", () => jest.fn());

describe("Mocked Tests for uploadImage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const MOCK_URL = "https://mocked.imgbb.com/image.png";
  const MOCK_DELETE_URL = "https://mocked.imgbb.com/delete/image.png";
  const MOCK_VALID_RESPONSE = {
    data: {
      data: {
        url: MOCK_URL,
        expiration: 3600,
        delete_url: MOCK_DELETE_URL,
      },
    },
  };

  test("mocked upload an image", async () => {
    axios.mockResolvedValueOnce(MOCK_VALID_RESPONSE);

    const result = await uploadImage(
      "test-resources/0.png",
      "imgbb",
      "correct-api-key",
      {}
    );
    expect(result.url).toBe(MOCK_URL);
    expect(result.expiration).toBe(3600);
    expect(result.delete_url).toBe(MOCK_DELETE_URL);
  });

  test("mocked upload with a wrong API key, should return undefined", async () => {
    axios.mockRejectedValue(new Error("Invalid API key"));

    const result = await uploadImage(
      "test-resources/0.png",
      "imgbb",
      "incorrect-api-key",
      {}
    );
    assert(
      typeof result === "undefined",
      "An incorrect api-key didn't generate an undefined value."
    );
  });
  test("mocked upload with expiration option", async () => {
    axios.mockResolvedValueOnce(MOCK_VALID_RESPONSE);
    const result = await uploadImage(
      "test-resources/0.png",
      "imgbb",
      "correct-api-key",
      { expiration: 3600 }
    );
    expect(result.url).toBe(MOCK_URL);
    expect(result.expiration).toBe(3600);
    expect(result.delete_url).toBe(MOCK_DELETE_URL);
    expect(axios).toHaveBeenCalledWith(
      expect.objectContaining({
        params: { expiration: 3600, key: "correct-api-key" },
      })
    );
  });
});
