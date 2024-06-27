const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const { getBinaryName, normalize, getAuthInfo, base64ToBytesArray, arrayBufferToBase64 } = require("./utils.js");
const constants = require("./constants.js");
const WS = require("websocket").w3cwebsocket;
const EventEmitter = require("events");
const { v4: uuidv4 } = require("uuid");

class NeutralinoApp extends EventEmitter {

  url = "";
  windowOptions = {};
  authInfo = null;
  reconnecting = false;
  retryHandler = null;
  ws = null;
  nativeCalls = {};
  offlineMessageQueue = [];
  extensionMessageQueue = {};
  neuProcess = null;

  constructor({ url, windowOptions }) {
    super();
    this.url = url;
    this.windowOptions = windowOptions;
  }

  init() {

    if (this.ws && this.ws.readyState === this.ws.OPEN) {
      console.info("Already connected to the application.");
      return;
    }

    this._startWebsocket()

    const EXEC_PERMISSION = 0o755;

    let outputArgs = " --url=" + normalize(this.url);

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
    this.authInfo = getAuthInfo();

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
      this._processQueue(this.offlineMessageQueue);
      this.extensions.getStats().then((stats) => {
        for (const extensionId of stats.connected) {
          if (extensionId in this.extensionMessageQueue) {
            this._processQueue(this.extensionMessageQueue[extensionId]).then(() => {
              delete this.extensionMessageQueue[extensionId];
            })
          }
        }
      })
    };

    this.ws.onclose = () => {
      console.log("Connection closed.");
    };

    this.ws.onmessage = (e) => {
      if (typeof e.data === "string") {
        const message = JSON.parse(e.data);
        if (message.id && message.id in this.nativeCalls) {
          // Native call response
          if (message.data.error) {
            this.nativeCalls[message.id].reject(message.data.error);
            if (message.data.error.code == "NE_RT_INVTOKN") {
              // Invalid native method token
              this._stopWebsocket();
              console.error("NE_RT_INVTOKN: Neutralinojs application cannot execute native methods since NL_TOKEN is invalid.")
            }
          }
          else if (message.data.success) {
            this.nativeCalls[message.id].resolve(message.data.hasOwnProperty("returnValue") ? message.data.returnValue : message.data);
          }
          delete this.nativeCalls[message.id];
        }
        else if (message.event) {
          // Event from process
          if (message.event == "openedFile" && message.data.action == "dataBinary") {
            message.data.data = base64ToBytesArray(message.data.data);
          }
          else if (message.event == "extClientConnect") {
            if (message.data in this.extensionMessageQueue) {
              this._processQueue(this.extensionMessageQueue[message.data]).then(() => {
                delete this.extensionMessageQueue[message.data];
              })
            }
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

  _processQueue = async (messageQueue) => {
    while (messageQueue.length > 0) {
      const message = messageQueue.shift();
      try {
        const response = await this._sendMessage(message.method, message.data);
        message.resolve(response);
      }
      catch (err) {
        message.reject(err);
      }
    }
  }

  _sendWhenExtReady(extensionId, message) {
    if (extensionId in this.extensionMessageQueue) {
      this.extensionMessageQueue[extensionId].push(message);
    }
    else {
      this.extensionMessageQueue[extensionId] = [message];
    }
  }

  _sendMessage = (method, data) => {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== this.ws.OPEN) {
        this.offlineMessageQueue.push({ method, data, resolve, reject });
        return;
      }

      const id = uuidv4();

      this.nativeCalls[id] = { resolve, reject };

      if (!this.authInfo) {
        console.error("Auth info is not available.");
        return;
      }

      this.ws.send(
        JSON.stringify({
          id,
          method,
          data,
          accessToken: this.authInfo.nlToken,
        })
      );
    });
  };

  close() {
    this._stopWebsocket();
    if (this.neuProcess) {
      this.neuProcess.kill();
    }
  }

  // ---------------------- Native Methods ----------------------

  exit(code) {
    return this._sendMessage("app.exit", { code });
  }
  killProcess() {
    return this._sendMessage("app.killProcess");
  }
  getConfig() {
    return this._sendMessage("app.getConfig");
  }

  broadcast(event, data) {
    return this._sendMessage("app.broadcast", { event, data });
  }

  readProcessInput(readAll) {
    return this._sendMessage("app.readProcessInput", { readAll });
  }

  writeProcessOutput(data) {
    return this._sendMessage("app.writeProcessOutput", { data });
  }

  writeProcessError(data) {
    return this._sendMessage("app.writeProcessError", { data });
  }


  clipboard = {
    getFormat: () => {
      return this._sendMessage("clipboard.getFormat");
    },

    readText: () => {
      return this._sendMessage("clipboard.readText");
    },

    readImage: () => {
      return new Promise((resolve, reject) => {
        this._sendMessage("clipboard.readImage")
          .then((image) => {
            if (image) {
              image.data = base64ToBytesArray(image.data);
            }
            resolve(image);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },

    writeText: (data) => {
      return this._sendMessage("clipboard.writeText", { data });
    },

    writeImage: (image) => {
      const props = { ...image };
      if (image?.data) {
        props.data = arrayBufferToBase64(image.data);
      }
      return this._sendMessage("clipboard.writeImage", props);
    },

    clear: () => {
      return this._sendMessage("clipboard.clear");
    }
  };


  computer = {
    getMemoryInfo: () => {
      return this._sendMessage("computer.getMemoryInfo");
    },

    getArch: () => {
      return this._sendMessage("computer.getArch");
    },

    getKernelInfo: () => {
      return this._sendMessage("computer.getKernelInfo");
    },

    getOSInfo: () => {
      return this._sendMessage("computer.getOSInfo");
    },

    getCPUInfo: () => {
      return this._sendMessage("computer.getCPUInfo");
    },

    getDisplays: () => {
      return this._sendMessage("computer.getDisplays");
    },

    getMousePosition: () => {
      return this._sendMessage("computer.getMousePosition");
    },
  };


  custom = {
    getMethods: () => {
      return this._sendMessage('custom.getMethods');
    }
  };


  debug = {
    log: (message, type) => {
      return this._sendMessage('debug.log', { message, type });
    }
  };


  events = {
    broadcast: (event, data) => {
      return this._sendMessage('events.broadcast', { event, data });
    }
  };


  extensions = {
    dispatch: (extensionId, event, data) => {
      return new Promise(async (resolve, reject) => {
        const stats = await this.extensions.getStats();
        if (!stats.loaded.includes(extensionId)) {
          reject({
            code: 'NE_EX_EXTNOTL',
            message: `${extensionId} is not loaded`
          });
        }
        else if (stats.connected.includes(extensionId)) {
          try {
            const result = await this._sendMessage('extensions.dispatch', { extensionId, event, data });
            resolve(result);
          }
          catch (err) {
            reject(err);
          }
        }
        else {
          // loaded but not connected yet.
          this._sendWhenExtReady(extensionId, {
            method: 'extensions.dispatch',
            data: { extensionId, event, data }, resolve, reject
          });
        }
      });
    },

    broadcast: (event, data) => {
      return this._sendMessage('extensions.broadcast', { event, data });
    },

    getStats: () => {
      return this._sendMessage('extensions.getStats');
    }
  };


  filesystem = {
    createDirectory: (path) => {
      return this._sendMessage('filesystem.createDirectory', { path });
    },

    remove: (path) => {
      return this._sendMessage('filesystem.remove', { path });
    },

    writeFile: (path, data) => {
      return this._sendMessage('filesystem.writeFile', { path, data });
    },

    appendFile: (path, data) => {
      return this._sendMessage('filesystem.appendFile', { path, data });
    },

    writeBinaryFile: (path, data) => {
      return this._sendMessage('filesystem.writeBinaryFile', {
        path,
        data: arrayBufferToBase64(data)
      });
    },

    appendBinaryFile: (path, data) => {
      return this._sendMessage('filesystem.appendBinaryFile', {
        path,
        data: arrayBufferToBase64(data)
      });
    },

    readFile: (path, options) => {
      return this._sendMessage('filesystem.readFile', { path, ...options });
    },

    readBinaryFile: (path, options) => {
      return new Promise((resolve, reject) => {
        this._sendMessage('filesystem.readBinaryFile', { path, ...options })
          .then((base64Data) => {
            resolve(base64ToBytesArray(base64Data));
          })
          .catch((error) => {
            reject(error);
          });
      });
    },

    openFile: (path) => {
      return this._sendMessage('filesystem.openFile', { path });
    },

    createWatcher: (path) => {
      return this._sendMessage('filesystem.createWatcher', { path });
    },

    removeWatcher: (id) => {
      return this._sendMessage('filesystem.removeWatcher', { id });
    },

    getWatchers: () => {
      return this._sendMessage('filesystem.getWatchers');
    },

    updateOpenedFile: (id, event, data) => {
      return this._sendMessage('filesystem.updateOpenedFile', { id, event, data });
    },

    getOpenedFileInfo: (id) => {
      return this._sendMessage('filesystem.getOpenedFileInfo', { id });
    },

    readDirectory: (path, options) => {
      return this._sendMessage('filesystem.readDirectory', { path, ...options });
    },

    copy: (source, destination) => {
      return this._sendMessage('filesystem.copy', { source, destination });
    },

    move: (source, destination) => {
      return this._sendMessage('filesystem.move', { source, destination });
    },

    getStats: (path) => {
      return this._sendMessage('filesystem.getStats', { path });
    }
  };


  os = {
    execCommand: (command, options) => {
      return this._sendMessage('os.execCommand', { command, ...options });
    },

    spawnProcess: (command, cwd) => {
      return this._sendMessage('os.spawnProcess', { command, cwd });
    },

    updateSpawnedProcess: (id, event, data) => {
      return this._sendMessage('os.updateSpawnedProcess', { id, event, data });
    },

    getSpawnedProcesses: () => {
      return this._sendMessage('os.getSpawnedProcesses');
    },

    getEnv: (key) => {
      return this._sendMessage('os.getEnv', { key });
    },

    getEnvs: () => {
      return this._sendMessage('os.getEnvs');
    },

    showOpenDialog: (title, options) => {
      return this._sendMessage('os.showOpenDialog', { title, ...options });
    },

    showFolderDialog: (title, options) => {
      return this._sendMessage('os.showFolderDialog', { title, ...options });
    },

    showSaveDialog: (title, options) => {
      return this._sendMessage('os.showSaveDialog', { title, ...options });
    },

    showNotification: (title, content, icon) => {
      return this._sendMessage('os.showNotification', { title, content, icon });
    },

    showMessageBox: (title, content, choice, icon) => {
      return this._sendMessage('os.showMessageBox', { title, content, choice, icon });
    },

    setTray: (options) => {
      return this._sendMessage('os.setTray', options);
    },

    open: (url) => {
      return this._sendMessage('os.open', { url });
    },

    getPath: (name) => {
      return this._sendMessage('os.getPath', { name });
    }
  }


  storage = {
    setData: (key, data) => {
      return this._sendMessage('storage.setData', { key, data });
    },

    getData: (key) => {
      return this._sendMessage('storage.getData', { key });
    },

    getKeys: () => {
      return this._sendMessage('storage.getKeys');
    }
  };


  window = {
    setTitle: (title) => {
      return this._sendMessage('window.setTitle', { title });
    },

    getTitle: () => {
      return this._sendMessage('window.getTitle');
    },

    maximize: () => {
      return this._sendMessage('window.maximize');
    },

    unmaximize: () => {
      return this._sendMessage('window.unmaximize');
    },

    isMaximized: () => {
      return this._sendMessage('window.isMaximized');
    },

    minimize: () => {
      return this._sendMessage('window.minimize');
    },

    setFullScreen: () => {
      return this._sendMessage('window.setFullScreen');
    },

    exitFullScreen: () => {
      return this._sendMessage('window.exitFullScreen');
    },

    isFullScreen: () => {
      return this._sendMessage('window.isFullScreen');
    },

    show: () => {
      return this._sendMessage('window.show');
    },

    hide: () => {
      return this._sendMessage('window.hide');
    },

    isVisible: () => {
      return this._sendMessage('window.isVisible');
    },

    focus: () => {
      return this._sendMessage('window.focus');
    },

    setIcon: (icon) => {
      return this._sendMessage('window.setIcon', { icon });
    },

    move: (x, y) => {
      return this._sendMessage('window.move', { x, y });
    },

    center: () => {
      return this._sendMessage('window.center');
    },

    setSize: (options) => {
      return new Promise(async (resolve, reject) => {
        let sizeOptions = await this.window.getSize();

        options = { ...sizeOptions, ...options }; // merge prioritizing options arg

        this._sendMessage('window.setSize', options)
          .then((response) => {
            resolve(response);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },

    getSize: () => {
      return this._sendMessage('window.getSize');
    },

    getPosition: () => {
      return this._sendMessage('window.getPosition');
    },

    setAlwaysOnTop: (onTop) => {
      return this._sendMessage('window.setAlwaysOnTop', { onTop });
    }
  };
}

module.exports = NeutralinoApp 
