const WebSocketIPC = require("./websocketIPC.js");
const NeutralinoProcess = require("./NeutralinoProcess.js");
const Clipboard = require("./apis/clipboard.js")
const Computer = require("./apis/computer.js")
const Custom = require("./apis/custom.js")
const Debug = require("./apis/debug.js")
const Events = require("./apis/events.js")
const Extensions = require("./apis/extensions.js")
const Filesystem = require("./apis/filesystem.js")
const Os = require("./apis/os.js")
const Storage = require("./apis/storage.js")
const Updater = require("./apis/updater.js")
const Window = require("./apis/window.js")

class NeutralinoApp {

  constructor({ url, windowOptions }) {
    this.url = url;
    this.windowOptions = windowOptions;
    this.WebsocketIPC = new WebSocketIPC();
    this.neutralinoProcess = new NeutralinoProcess({ url, windowOptions, WebSocketIPC: this.WebsocketIPC });

    // ---------------------- API's ---------------------- 
    this.computer = new Computer(this.WebsocketIPC);
    this.clipboard = new Clipboard(this.WebsocketIPC);
    this.custom = new Custom(this.WebsocketIPC);
    this.debug = new Debug(this.WebsocketIPC);
    this.events = new Events(this.WebsocketIPC);
    this.extensions = new Extensions(this.WebsocketIPC);
    this.filesystem = new Filesystem(this.WebsocketIPC);
    this.os = new Os(this.WebsocketIPC);
    this.storage = new Storage(this.WebsocketIPC);
    this.updater = new Updater(this.WebsocketIPC);
    this.window = new Window(this.WebsocketIPC);
  }

  
  init() {
    this.neutralinoProcess.init();
  }

  close() {
    this.neutralinoProcess.close();
  }

  // ---------------------- Native Methods ----------------------

  exit(code) {
    return this.WebsocketIPC.sendMessage("app.exit", { code });
  }
  killProcess() {
    return this.WebsocketIPC.sendMessage("app.killProcess");
  }
  getConfig() {
    return this.WebsocketIPC.sendMessage("app.getConfig");
  }

  broadcast(event, data) {
    return this.WebsocketIPC.sendMessage("app.broadcast", { event, data });
  }

  readProcessInput(readAll) {
    return this.WebsocketIPC.sendMessage("app.readProcessInput", { readAll });
  }

  writeProcessOutput(data) {
    return this.WebsocketIPC.sendMessage("app.writeProcessOutput", { data });
  }

  writeProcessError(data) {
    return this.WebsocketIPC.sendMessage("app.writeProcessError", { data });
  }
}

module.exports = NeutralinoApp;