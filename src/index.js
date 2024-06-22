const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const { getBinaryName, normalize, getAuthInfo } = require("./utils.js");
const constants = require("./constants.js");
const WS = require("websocket").w3cwebsocket;
const EventEmitter = require("events");

class NeutralinoApp extends EventEmitter {

  url = "";
  windowOptions = {};
  authInfo = null;
  reconnecting = false;
  retryHandler = null;
  ws = null;
  nativeCalls = {};
  offlineMessageQueue = [];
  neuProcess = null;

  constructor({ url, windowOptions }) {
    super();
    this.url = url;
    this.windowOptions = windowOptions;
  }

  init() {

    this._startWebsocket()

    const EXEC_PERMISSION = 0o755;

    let outputArgs = " --path=" + normalize(this.url);

    for (let key in this.windowOptions) {
      if (key == "processArgs") continue;

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

    let binaryPath = path.join(this.url, `bin${path.sep}${binaryName}`);

    let args = " --load-dir-res --export-auth-info --neu-dev-extension";

    if (outputArgs) args += " " + outputArgs;

    if (process.platform == "linux" || process.platform == "darwin")
      fs.chmodSync(binaryPath, EXEC_PERMISSION);

    console.log(`Starting process: ${binaryName} ${args}`);

    this.neuProcess = spawn(binaryPath, args.split(` `), { stdio: "inherit" });

    this.neuProcess.on("exit", (code) => {
      let statusCodeMsg = code ? `error code ${code}` : `success code 0`;
      let runnerMsg = `${binaryName} was stopped with ${statusCodeMsg}`;
      console.warn(runnerMsg);

      this._stopWebsocket()

      if (this.windowOptions && this.windowOptions.exitProcessOnClose) {
        process.exit(code);
      }
    });
  }

  _retryLater() {
    this.reconnecting = true;
    this.retryHandler = setTimeout(() => {
      this.reconnecting = false;
      this._startWebsocket();
    }, 1000);
  }

  _startWebsocket = () => {
    this.authInfo = getAuthInfo(this.url);

    if (!this.authInfo) {
      this._retryLater();
      return;
    }

    this.ws = new WS(`ws://127.0.0.1:${this.authInfo.nlPort}?extensionId=js.neutralino.devtools&connectToken=${this.authInfo.nlConnectToken}`);

    this.ws.onerror = () => {
      this._retryLater();
      return;
    };

    this.ws.onopen = () => {
      console.log("Connected with the application.");
    };

    this.ws.onclose = () => {
      console.log("Connection closed.");
    };

    this.ws.onmessage = (e) => {
      if (typeof e.data === "string") {
        const message = JSON.parse(e.data);
        console.log("Received message: ", message);

        if (message.id && message.id in this.nativeCalls) {
          // Native call response
          if (message.data.error) {
            this.nativeCalls[message.id].reject(message.data.error);
            if (message.data.error.code == 'NE_RT_INVTOKN') {
              // Invalid native method token
              this._stopWebsocket();
              console.error("NE_RT_INVTOKN: Neutralinojs application cannot execute native methods since NL_TOKEN is invalid.")
            }
          }
          else if (message.data.success) {
            this.nativeCalls[message.id].resolve(message.data.hasOwnProperty('returnValue') ? message.data.returnValue : message.data);
          }
          delete this.nativeCalls[message.id];
        }
        else if (message.event) {
          // Event from process
          if (message.event == 'openedFile' && message.data.action == 'dataBinary') {
            message.data.data = base64ToBytesArray(message.data.data);
          }
          this.emit(message.event, message.data);
        }
      }
    }
  };

  _stopWebsocket = () => {
    if (this.retryHandler) {
      clearTimeout(this.retryHandler);
    }
    if (this.ws) {
      this.ws.close();
      if (fs.existsSync(constants.files.authFile)) {
        fs.unlinkSync(constants.files.authFile);
      }
    }
  };

  close() {
    this._stopWebsocket();
    if (this.neuProcess) {
      this.neuProcess.kill();
    }
  }
}

module.exports = NeutralinoApp 
