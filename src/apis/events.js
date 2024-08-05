
class Events {
  constructor(WebSocketIPC) {
    this.WebsocketIPC = WebSocketIPC;
  }

  broadcast (event, data) {
    return this.WebsocketIPC.sendMessage('events.broadcast', { event, data });
  }

  on (event, listener) {
    this.WebsocketIPC.eventEmitter.on(event, listener);
    return Promise.resolve({
      success: true,
      message: 'Event listener added'
    });
  }

  off (event, listener) {
    this.WebsocketIPC.eventEmitter.off(event, listener);
    return Promise.resolve({
      success: true,
      message: 'Event listener removed'
    });
  }

  dispatch (event, data) {
    this.WebsocketIPC.eventEmitter.emit(event, data);
    return Promise.resolve({
      success: true,
      message: 'Message dispatched'
    });
  }
}

module.exports = Events;