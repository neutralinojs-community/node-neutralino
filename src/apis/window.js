
class Window {
  constructor(WebSocketIPC) {
    
    this.WebsocketIPC = WebSocketIPC;
  }
  
  setTitle (title) {
    return this.WebsocketIPC.sendMessage('window.setTitle', { title });
  }

  getTitle () {
    return this.WebsocketIPC.sendMessage('window.getTitle');
  }

  maximize () {
    return this.WebsocketIPC.sendMessage('window.maximize');
  }

  unmaximize () {
    return this.WebsocketIPC.sendMessage('window.unmaximize');
  }

  isMaximized () {
    return this.WebsocketIPC.sendMessage('window.isMaximized');
  }

  minimize () {
    return this.WebsocketIPC.sendMessage('window.minimize');
  }

  setFullScreen () {
    return this.WebsocketIPC.sendMessage('window.setFullScreen');
  }

  exitFullScreen () {
    return this.WebsocketIPC.sendMessage('window.exitFullScreen');
  }

  isFullScreen () {
    return this.WebsocketIPC.sendMessage('window.isFullScreen');
  }

  show () {
    return this.WebsocketIPC.sendMessage('window.show');
  }

  hide () {
    return this.WebsocketIPC.sendMessage('window.hide');
  }

  isVisible () {
    return this.WebsocketIPC.sendMessage('window.isVisible');
  }

  focus () {
    return this.WebsocketIPC.sendMessage('window.focus');
  }

  setIcon (icon) {
    return this.WebsocketIPC.sendMessage('window.setIcon', { icon });
  }

  move (x, y) {
    return this.WebsocketIPC.sendMessage('window.move', { x, y });
  }

  center () {
    return this.WebsocketIPC.sendMessage('window.center');
  }

  setSize (options) {
    return new Promise(async (resolve, reject) => {
      let sizeOptions = await this.getSize();

      options = { ...sizeOptions, ...options }; // merge prioritizing options arg

      this.WebsocketIPC.sendMessage('window.setSize', options)
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  getSize () {
    return this.WebsocketIPC.sendMessage('window.getSize');
  }

  getPosition () {
    return this.WebsocketIPC.sendMessage('window.getPosition');
  }

  setAlwaysOnTop (onTop) {
    return this.WebsocketIPC.sendMessage('window.setAlwaysOnTop', { onTop });
  }
}

module.exports = Window;