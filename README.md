# upload-image action
A github action to upload an image.

## Usage

**Provide all required inputs:**

`path` Path to the image(s) you want to upload. A multiline input is supported.

`uploadMethod` Where to upload the image. (see [supported upload methods](#supported-upload-methods)
 )
 
`apiKey` The API key for the upload method (if required).

**Optional inputs:**

`expiration` The expiration time of the image in seconds if the upload method supports it.

**Returned values:**

`url` The action returns a URL of the uploaded image as `url` or multiple lines with URLs if more than one path was provided.

`urls` The resulting list of URLs of the uploaded images as an array.

`expiration` The expiration time of the image in seconds if the upload method supports it. 0 if there is no expiration.

`delete_url` The URL to delete the image if the upload method supports it. If more than one image was uploaded, the output will be a multiline string.

`delete_urls` The resulting list of URLs to delete the images as an array.

## Examples:
Upload an image and comment it in the PR:
```
    - name: Upload image
      id: upload-image-0
      uses: McCzarny/upload-image@v1.3.0
      if: github.event_name == 'pull_request'
      with:
        path: images/0.png
        uploadMethod: imgbb
        apiKey: '${{ secrets.IMGBB_API_KEY }}'
    - name: 'Comment PR'
      uses: actions/github-script@0.3.0
      if: github.event_name == 'pull_request'
      with:
        github-token: ${{ secrets.TOKEN_GITHUB }}
        script: |
          const { issue: { number: issue_number }, repo: { owner, repo }  } = context;
          github.issues.createComment({ issue_number, owner, repo, body: 'Uploaded image:\n![0](${{steps.upload-image-0.outputs.url}})'});
```

Multiline example:
```
    - name: Upload image
      id: upload-image-0
      uses: McCzarny/upload-image@v1.3.0
      if: github.event_name == 'pull_request'
      with:
        path: |
          images/0.png
          images/1.png
          images/2.png
        uploadMethod: imgbb
        apiKey: '${{ secrets.IMGBB_API_KEY }}'
    - name: 'Comment PR'
      uses: actions/github-script@0.3.0
      if: github.event_name == 'pull_request'
      with:
        github-token: ${{ secrets.TOKEN_GITHUB }}
        script: |
          const { issue: { number: issue_number }, repo: { owner, repo }  } = context;
          github.issues.createComment({ issue_number, owner, repo, body: 'Uploaded images:\n${{steps.upload-image-0.outputs.url}}'});
```

Upload an image with expiration:
```
    - name: Upload image for 10 minutes
      id: upload-image-0
      uses: McCzarny/upload-image@v1.3.0
      if: github.event_name == 'pull_request'
      with:
        path: images/0.png
        uploadMethod: imgbb
        expiration: 600
        apiKey: '${{ secrets.IMGBB_API_KEY }}'
```

Using urls array (pass output to `fromJson()` method):
```
    - name: Upload images
    id: upload_image
    uses: McCzarny/upload-image@v1.3.0
      if: github.event_name == 'pull_request'
      with:
        path: |
          images/0.png
          images/1.png
          images/2.png
          images/3.png
          images/4.png
        uploadMethod: imgbb
        apiKey: '${{ secrets.IMGBB_API_KEY }}'
    - name: 'Comment PR'
      uses: actions/github-script@v7.0.1
      if: github.event_name == 'pull_request'
      with:
        script: |
          github.rest.issues.createComment({
            issue_number: context.issue.number,
            owner: context.repo.owner,
            repo: context.repo.repo,
            body: 'Images:\n![0](${{fromJson(steps.upload_image.outputs.urls)[0]}})![1](${{fromJson(steps.upload_image.outputs.urls)[1]}})![2](${{fromJson(steps.upload_image.outputs.urls)[2]}})![3](${{fromJson(steps.upload_image.outputs.urls)[3]}})![4](${{fromJson(steps.upload_image.outputs.urls)[4]}})'
            });
```

Link to the example workflow file:
https://github.com/McCzarny/crypto-mongrels/blob/master/.github/workflows/generate_mongrel.yml

## Supported upload methods

### IMGBB
Please visit https://api.imgbb.com/ to get Your API key and pass it to the action.

This method supports `expiration` option in seconds 60-15552000. By default, there is no expiration.

This method supports `delete_url` / `delete_urls` output. After uploading an image, the action will return a URL where you can find the delete button. There is no official IMGBB API to delete an image, but it can be done by doing a POST request similar to the one sent by the delete button. You can check `Test delete URL` test in the [tests](https://github.com/McCzarny/upload-image/blob/master/test/uploadImage.test.js) to see how to do it.
