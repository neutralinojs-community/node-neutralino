
class Os {
  constructor(WebSocketIPC) {
    this.WebsocketIPC = WebSocketIPC;
  }
  
  execCommand (command, options) {
    return this.WebsocketIPC.sendMessage('os.execCommand', { command, ...options });
  }

  spawnProcess (command, cwd) {
    return this.WebsocketIPC.sendMessage('os.spawnProcess', { command, cwd });
  }

  updateSpawnedProcess (id, event, data) {
    return this.WebsocketIPC.sendMessage('os.updateSpawnedProcess', { id, event, data });
  }

  getSpawnedProcesses () {
    return this.WebsocketIPC.sendMessage('os.getSpawnedProcesses');
  }

  getEnv (key) {
    return this.WebsocketIPC.sendMessage('os.getEnv', { key });
  }

  getEnvs () {
    return this.WebsocketIPC.sendMessage('os.getEnvs');
  }

  showOpenDialog (title, options) {
    return this.WebsocketIPC.sendMessage('os.showOpenDialog', { title, ...options });
  }

  showFolderDialog (title, options) {
    return this.WebsocketIPC.sendMessage('os.showFolderDialog', { title, ...options });
  }

  showSaveDialog (title, options) {
    return this.WebsocketIPC.sendMessage('os.showSaveDialog', { title, ...options });
  }

  showNotification (title, content, icon) {
    return this.WebsocketIPC.sendMessage('os.showNotification', { title, content, icon });
  }

  showMessageBox (title, content, choice, icon) {
    return this.WebsocketIPC.sendMessage('os.showMessageBox', { title, content, choice, icon });
  }

  setTray (options) {
    return this.WebsocketIPC.sendMessage('os.setTray', options);
  }

  open (url) {
    return this.WebsocketIPC.sendMessage('os.open', { url });
  }

  getPath (name) {
    return this.WebsocketIPC.sendMessage('os.getPath', { name });
  }
}

module.exports = Os;