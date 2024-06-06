const NeutralinoApp = require("../src/index.js");
const assert = require('assert');

describe('Test NeutralinoApp Class', function () {

  it('Should initialize the class with provided options', async function () {

    const defaultOptions = {
      url: '/',
      windowOptions: {
        modes: {
          window: {
            width: 500,
            height: 500
          }
        }
      }
    };

    const app = new NeutralinoApp(defaultOptions);
    
    assert.equal(app.url, defaultOptions.url);
    assert.equal(app.windowOptions, defaultOptions.windowOptions);
  });

});
