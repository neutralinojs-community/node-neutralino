const { arrayBufferToBase64, base64ToBytesArray } = require("../utils.js");

class FileSystem {
  constructor(WebSocketIPC) {
    this.WebsocketIPC = WebSocketIPC;
  }
  
  createDirectory (path) {
    return this.WebsocketIPC.sendMessage('filesystem.createDirectory', { path });
  }

  remove (path) {
    return this.WebsocketIPC.sendMessage('filesystem.remove', { path });
  }

  writeFile (path, data) {
    return this.WebsocketIPC.sendMessage('filesystem.writeFile', { path, data });
  }

  appendFile (path, data) {
    return this.WebsocketIPC.sendMessage('filesystem.appendFile', { path, data });
  }

  writeBinaryFile (path, data) {
    return this.WebsocketIPC.sendMessage('filesystem.writeBinaryFile', {
      path,
      data: arrayBufferToBase64(data)
    });
  }

  appendBinaryFile (path, data) {
    return this.WebsocketIPC.sendMessage('filesystem.appendBinaryFile', {
      path,
      data: arrayBufferToBase64(data)
    });
  }

  readFile (path, options) {
    return this.WebsocketIPC.sendMessage('filesystem.readFile', { path, ...options });
  }

  readBinaryFile (path, options) {
    return new Promise((resolve, reject) => {
      this.WebsocketIPC.sendMessage('filesystem.readBinaryFile', { path, ...options })
        .then((base64Data) => {
          resolve(base64ToBytesArray(base64Data));
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  openFile (path) {
    return this.WebsocketIPC.sendMessage('filesystem.openFile', { path });
  }

  createWatcher (path) {
    return this.WebsocketIPC.sendMessage('filesystem.createWatcher', { path });
  }

  removeWatcher (id) {
    return this.WebsocketIPC.sendMessage('filesystem.removeWatcher', { id });
  }

  getWatchers () {
    return this.WebsocketIPC.sendMessage('filesystem.getWatchers');
  }

  updateOpenedFile (id, event, data) {
    return this.WebsocketIPC.sendMessage('filesystem.updateOpenedFile', { id, event, data });
  }

  getOpenedFileInfo (id) {
    return this.WebsocketIPC.sendMessage('filesystem.getOpenedFileInfo', { id });
  }

  readDirectory (path, options) {
    return this.WebsocketIPC.sendMessage('filesystem.readDirectory', { path, ...options });
  }

  copy (source, destination) {
    return this.WebsocketIPC.sendMessage('filesystem.copy', { source, destination });
  }

  move (source, destination) {
    return this.WebsocketIPC.sendMessage('filesystem.move', { source, destination });
  }

  getStats (path) {
    return this.WebsocketIPC.sendMessage('filesystem.getStats', { path });
  }
}

module.exports = FileSystem;