const { getBinaryName, normalize } = require("./utils.js");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const frontendLib = require("./frontendLib.js")

class NeutralinoProcess {
  constructor({ url, windowOptions, WebSocketIPC }) {
    this.WebSocketIPC = WebSocketIPC;
    this.url = url;
    this.windowOptions = windowOptions;
    this.neuProcess = null;
  }

  async init() {

    if (this.WebSocketIPC.ws && this.WebSocketIPC.ws.readyState === this.WebSocketIPC.ws.OPEN) {
      console.info("Already connected to the application.");
      return;
    }

    const frontendLibOptions = this.windowOptions.frontendLibrary;

    this.WebSocketIPC.startWebsocket(frontendLibOptions);

    if(frontendLibOptions) {
      frontendLib.runCommand('devCommand', frontendLibOptions);
      await frontendLib.waitForFrontendLibApp(frontendLibOptions);
  }

    const EXEC_PERMISSION = 0o755;

    let outputArgs = " --url=" + frontendLibOptions && frontendLibOptions.devUrl ? frontendLibOptions.devUrl : normalize(this.url);

    for (let key in this.windowOptions) {
      if (key == "processArgs" || key == "frontendLibrary") continue;

      let cliKey = key.replace(/[A-Z]|^[a-z]/g, (token) => "-" + token.toLowerCase());

      outputArgs += ` --window${cliKey}=${normalize(this.windowOptions[key])}`;
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

    this.neuProcess = spawn(binaryPath, args.split(` `), { stdio: "inherit" });

    this.neuProcess.on("exit", (code) => {
      let statusCodeMsg = code ? `error code ${code}` : `success code 0`;
      let runnerMsg = `${binaryName} was stopped with ${statusCodeMsg}`;
      console.warn(runnerMsg);

      this.WebSocketIPC.stopWebsocket()

      if (this.windowOptions && this.windowOptions.exitProcessOnClose) {
        process.exit(code);
      }
    });
  }

  close() {
    this.WebSocketIPC.stopWebsocket();
    if (this.neuProcess) {
      this.neuProcess.kill();
    }
  }
}

module.exports = NeutralinoProcess;