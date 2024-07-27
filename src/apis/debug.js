
class Debug {
  constructor(WebSocketIPC) {
    this.WebsocketIPC = WebSocketIPC;
  }

  log (message, type) {
    return this.WebsocketIPC.sendMessage('debug.log', { message, type });
  }
}

module.exports = Debug;