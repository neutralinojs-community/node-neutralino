const { getAuthInfo, base64ToBytesArray, inBuildMode } = require("./utils.js");
const WS = require("websocket").w3cwebsocket;
const { v4: uuidv4 } = require("uuid");
const constants = require("./constants.js");
const EventEmitter = require("events");
const fs = require("fs");
const frontendLib = require('./frontendLib.js')

class WebSocketIPC {    

  constructor() {

    this.authInfo = null;
    this.wsConnected = false;
    this.retryHandler = null;
    this.ws = null;
    this.nativeCalls = {};
    this.offlineMessageQueue = [];
    this.extensionMessageQueue = {};
    this.eventEmitter = new EventEmitter();
  }

  retryLater(frontendLibOptions) {
    this.retryHandler = setTimeout(() => {
      this.startWebsocket(frontendLibOptions);
    }, 1000);
  }

  startWebsocket = (frontendLibOptions) => {
    this.authInfo = getAuthInfo();

    if (!this.authInfo) {
      this.retryLater(frontendLibOptions);
      return;
    }

    this.ws = new WS(`ws://127.0.0.1:${this.authInfo.nlPort}?extensionId=${inBuildMode() ? "js.node-neutralino.projectRunner" : "js.neutralino.devtools"}&connectToken=${this.authInfo.nlConnectToken}`);

    this.ws.onerror = () => {
      this.retryLater(frontendLibOptions);
      return;
    };

    this.ws.onopen = () => {
      this.wsConnected = true;
      console.log("Connected with the application.");
      if(frontendLibOptions && !inBuildMode()) {
        frontendLib.bootstrap(this.authInfo.nlPort, frontendLibOptions);
    }
      this.processQueue(this.offlineMessageQueue);
      this.sendMessage("app.getConfig").then((config) => {
        if (config.enableExtensions) {
          this.sendMessage('extensions.getStats').then((stats) => {
            for (const extensionId of stats.connected) {
              if (extensionId in this.extensionMessageQueue) {
                this.processQueue(this.extensionMessageQueue[extensionId]).then(() => {
                  delete this.extensionMessageQueue[extensionId];
                })
              }
            }
          }).catch((err) => {
            // Ignore
          })
        }
      })
    };

    this.ws.onclose = () => {
      if(this.wsConnected == false) return;
      this.wsConnected = false;

      if(frontendLibOptions && !inBuildMode()) {
        frontendLib.cleanup(frontendLibOptions);
      }
      console.log("Connection closed.");
    };

    this.ws.onmessage = (e) => {
      if (typeof e.data === "string") {
        const message = JSON.parse(e.data);
        if (message.id && message.id in this.nativeCalls) {
          // Native call response
          if (message.data && message.data.error) {
            this.nativeCalls[message.id].reject(message.data.error);
            if (message.data.error.code == "NE_RT_INVTOKN") {
              // Invalid native method token
              this.stopWebsocket();
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
              this.processQueue(this.extensionMessageQueue[message.data]).then(() => {
                delete this.extensionMessageQueue[message.data];
              })
            }
          }
          this.eventEmitter.emit(message.event, message.data);
        }
      }
    }
  };

  stopWebsocket = () => {
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

  processQueue = async (messageQueue) => {
    while (messageQueue.length > 0) {
      const message = messageQueue.shift();
      try {
        const response = await this.sendMessage(message.method, message.data);
        message.resolve(response);
      }
      catch (err) {
        message.reject(err);
      }
    }
  }

  sendWhenExtReady(extensionId, message) {
    if (extensionId in this.extensionMessageQueue) {
      this.extensionMessageQueue[extensionId].push(message);
    }
    else {
      this.extensionMessageQueue[extensionId] = [message];
    }
  }

  sendMessage = (method, data) => {
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
}

module.exports = WebSocketIPC;