# upload-image action
A github action to upload an image.

## Usage

**Provide all required inputs:**

`path` Path to the image you want to upload.

`uploadMethod` Where to upload the image. (see [supported upload methods](#supported-upload-methods)
 )
 
`apiKey` The API key for the upload method (if required).

The action returns a URL of the uploaded image as `url`.

Example:
```
    - name: Upload image
      id: upload-image-0
      uses: McCzarny/upload-image@v1.0.0
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

Link to the workflow file:
https://github.com/McCzarny/crypto-mongrels/blob/master/.github/workflows/generate_mongrel.yml

## Supported upload methods

### IMGBB
Please visit https://api.imgbb.com/ to get Your API key and pass it to the action.
