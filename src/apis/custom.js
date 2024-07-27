
class Custom {
  constructor(WebSocketIPC) {
    this.WebsocketIPC = WebSocketIPC;
  }
  
  getMethods() {
    return this.WebsocketIPC.sendMessage('custom.getMethods');
  }
}

module.exports = Custom;