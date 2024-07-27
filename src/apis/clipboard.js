const { base64ToBytesArray, arrayBufferToBase64 } = require("../utils.js");

class Clipboard {
  constructor(WebSocketIPC) {
    this.WebsocketIPC = WebSocketIPC;
  }
    
  getFormat () {
    return this.WebsocketIPC.sendMessage("clipboard.getFormat");
  }

  readText () {
    return this.WebsocketIPC.sendMessage("clipboard.readText");
  }

  readImage () {
    return new Promise((resolve, reject) => {
      this.WebsocketIPC.sendMessage("clipboard.readImage")
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
  }

  writeText (data) {
    return this.WebsocketIPC.sendMessage("clipboard.writeText", { data });
  }

  writeImage (image) {
    const props = { ...image };
    if (image?.data) {
      props.data = arrayBufferToBase64(image.data);
    }
    return this.WebsocketIPC.sendMessage("clipboard.writeImage", props);
  }

  clear () {
    return this.WebsocketIPC.sendMessage("clipboard.clear");
  }
}

module.exports = Clipboard;