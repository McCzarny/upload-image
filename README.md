# (WIP) upload-image
A github action to upload an image.

## Usage
Provide all required inputs:
*path* Path to the image you want to upload.
*uploadMethod* Where to upload the image. (see [supported upload methods](#supported-upload-methods)
 )
*apiKey* The API key for the upload method (if required).

The action returns a URL of the uploaded image as *url*.

## Supported upload methods

### IMGBB
Please visit https://api.imgbb.com/ to get Your API key and pass it to the action.