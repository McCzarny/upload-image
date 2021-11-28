const uploadImage = require('./uploadImage');
const process = require('process');
const cp = require('child_process');
const path = require('path');

test('upload an image', async () => {
    var url = await uploadImage("test-resources/0.png", "imgbb", "eb1c88ca1101e24beadced1cbb62856f");
    expect(url).toMatch(new RegExp('https:\\/\\/i.ibb.co\\/.*\\.png'));
    console.log(url);
});

// shows how the runner will run a javascript action with env / stdout protocol
test('test runs', () => {
  const setInput = (name,value)=>
    process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`]=value;
    setInput("path", "test-resources/0.png")
    setInput("uploadMethod", "imgbb")
    setInput("apiKey", "eb1c88ca1101e24beadced1cbb62856f")
  const ip = path.join(__dirname, 'index.js');
  const result = cp.execSync(`node ${ip}`, {env: process.env}).toString();
  console.log(result);
})
