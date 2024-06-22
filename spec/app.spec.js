const NeutralinoApp = require("../src/index.js");
const assert = require('assert');
const { run, cleanup, defaultOptions } = require('./utils.js');
const { Writable } = require('stream');

describe('Test NeutralinoApp Class', function () {
  before(() => {
    run('npx neu create test-app');
    process.chdir('test-app');
  });

  it('Should initialize the class with provided options', async function () {
    const app = new NeutralinoApp(defaultOptions);

    assert.equal(app.url, defaultOptions.url);
    assert.equal(app.windowOptions, defaultOptions.windowOptions);
  });

  it('Should test init() method', async function () {

    const app = new NeutralinoApp(defaultOptions);

    // override process.stdout.write to capture the output
    let output = '';
    const writableStream = new Writable({
      write(chunk, _encoding, callback) {
        output += chunk.toString();
        callback();
      }
    });

    const originalWrite = process.stdout.write;
    process.stdout.write = writableStream.write.bind(writableStream);
    app.init();

    await new Promise(resolve => setTimeout(resolve, 3000));
    app.close()

    process.stdout.write = originalWrite;

    assert.ok(output.includes('--load-dir-res --path=. --export-auth-info --neu-dev-extension  --url=/ --window-width=500 --window-height=500'));
  });

  it('Should test WS / Event Emitter', async function () {

    const app = new NeutralinoApp(defaultOptions);
    app.init();
    
    const eventPromise = new Promise((resolve, reject) => {
      // Set a timeout to reject the promise if the event is not emitted
      const timeout = setTimeout(() => {
        reject(new Error('Event was not emitted within the expected time'));
      }, 3000);

      app.on("extClientConnect", (data) => {
        clearTimeout(timeout);
        resolve(data);
      });
    });

    const eventData = await eventPromise;
    assert.equal(eventData, 1, "Unable to connect to the Neutralino server");
  })

  after(async () => {
    process.chdir('..');
    await cleanup();
  });
});
