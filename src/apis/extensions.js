
class Extensions {
  constructor(WebSocketIPC) {
    this.WebsocketIPC = WebSocketIPC;
  }
  
  dispatch (extensionId, event, data) {
    return new Promise(async (resolve, reject) => {
      const stats = await this.getStats();
      if (!stats.loaded.includes(extensionId)) {
        reject({
          code: 'NE_EX_EXTNOTL',
          message: `${extensionId} is not loaded`
        });
      }
      else if (stats.connected.includes(extensionId)) {
        try {
          const result = await this.WebsocketIPC.sendMessage('extensions.dispatch', { extensionId, event, data });
          resolve(result);
        }
        catch (err) {
          reject(err);
        }
      }
      else {
        // loaded but not connected yet.
        this.WebsocketIPC.sendWhenExtReady(extensionId, {
          method: 'extensions.dispatch',
          data: { extensionId, event, data }, resolve, reject
        });
      }
    });
  }

  broadcast (event, data) {
    return this.WebsocketIPC.sendMessage('extensions.broadcast', { event, data });
  }

  getStats () {
    return this.WebsocketIPC.sendMessage('extensions.getStats');
  }
}

module.exports = Extensions;