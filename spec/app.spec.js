const assert = require('assert');
const { cleanup, run } = require("./runner");
const fs = require('fs');
const os = require('os');

describe('Test NeutralinoApp Class', function () {
  before(() => {
    run('neu create test-app');
    process.chdir('test-app');
  });

  it('Test init() command', function () {
    const demoJsContent = `
    const NeutralinoApp = require("../../src/index.js");
    
    const app = new NeutralinoApp({
      url: '/',
      modes: {
        window: {
          width: 500,
          height: 500
        }
      }
    });
    
    app.init();
    
    setTimeout(() => {
      process.exit(0)
    }, 3000);
    `;

    fs.writeFileSync('demo.js', demoJsContent);

    const command = `node demo.js`;
    const result = run(command);

    const binaryNames = {
      linux: ['neutralino-linux_arm64', 'neutralino-linux_armhf', 'neutralino-linux_x64'],
      darwin: ['neutralino-mac_arm64', 'neutralino-mac_universal', 'neutralino-mac_x64'],
      win32: ['neutralino-win_x64.exe']
    };

    const expectedOutputPattern = "Starting process: {binaryName}  --load-dir-res --path=. --export-auth-info --neu-dev-extension  --url=/";

    const isExpectedOutputPresent = (output, pattern, binaries) => {
      return binaries.some(binary => output.includes(pattern.replace('{binaryName}', binary)));
    };

    const currentPlatform = os.platform();
    assert.ok(isExpectedOutputPresent(result.data, expectedOutputPattern, binaryNames[currentPlatform]), `Output does not contain expected binary name for platform ${currentPlatform}`);
  });

  after(() => {
    process.chdir('..');
    cleanup();
  });
});
