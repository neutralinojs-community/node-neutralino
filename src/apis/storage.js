
class Storage {
  constructor(WebSocketIPC) {
    this.WebsocketIPC = WebSocketIPC;
  }
  
  setData (key, data) {
    return this.WebsocketIPC.sendMessage('storage.setData', { key, data });
  }

  getData (key) {
    return this.WebsocketIPC.sendMessage('storage.getData', { key });
  }

  getKeys () {
    return this.WebsocketIPC.sendMessage('storage.getKeys');
  }
}

module.exports = Storage;