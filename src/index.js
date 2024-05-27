const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const {getBinaryName, normalize} = require("./utils.js");

class NeutralinoApp {
  url = "";
  windowOptions = {};
  ws = null;
  retryHandler = null;
  authInfo = null;
  nativeCalls = {};
  offlineMessageQueue = [];

  constructor({ url, windowOptions }) {
    super();
    this.url = url;
    this.windowOptions = windowOptions;
  }

  _retryLater() {
    this.reconnecting = true;
    this.retryHandler = setTimeout(() => {
      this.reconnecting = false;
      this._startWebsocket();
    }, 1000);
  }

  init() {
    const EXEC_PERMISSION = 0o755;

    let outputArgs = " --url=" + normalize(this.url);

    for (let key in this.windowOptions) {
      if (key == "processArgs") continue;

      let cliKey = key.replace(
        /[A-Z]|^[a-z]/g,
        (token) => "-" + token.toLowerCase()
      );
      outputArgs += ` --window${cliKey}=${this.windowOptions[key]}`;
    }

    if (this.windowOptions && this.windowOptions.processArgs) {
      outputArgs += " " + this.windowOptions.processArgs;
    }

    let arch = process.arch;

    let binaryName = getBinaryName(arch);

    if (!binaryName) {
      return console.error(`Unsupported platform or CPU architecture: ${process.platform}_${arch}`);
    }

    let binaryPath = `bin${path.sep}${binaryName}`;

    let args = " --load-dir-res --path=. --export-auth-info --neu-dev-extension";

    if (outputArgs) args += " " + outputArgs;

    if (process.platform == "linux" || process.platform == "darwin")
      fs.chmodSync(binaryPath, EXEC_PERMISSION);

    console.log(`Starting process: ${binaryName} ${args}`);

    const neuProcess = spawn(binaryPath, args.split(` `), { stdio: "inherit" });

    neuProcess.on("exit", function (code) {
      let statusCodeMsg = code ? `error code ${code}` : `success code 0`;
      let runnerMsg = `${binaryName} was stopped with ${statusCodeMsg}`;
      console.warn(runnerMsg);

      if (this.windowOptions && this.windowOptions.exitProcessOnClose) {
        process.exit(code);
      }
    });
  }
}

module.exports = NeutralinoApp 
