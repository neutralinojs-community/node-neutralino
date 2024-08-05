
class Computer {
  constructor(WebSocketIPC) {
    this.WebsocketIPC = WebSocketIPC;
  }
  
  getMemoryInfo() {
    return this.WebsocketIPC.sendMessage("computer.getMemoryInfo");
  }

  getArch() {
    return this.WebsocketIPC.sendMessage("computer.getArch");
  }

  getKernelInfo() {
    return this.WebsocketIPC.sendMessage("computer.getKernelInfo");
  }

  getOSInfo() {
    return this.WebsocketIPC.sendMessage("computer.getOSInfo");
  }

  getCPUInfo() {
    return this.WebsocketIPC.sendMessage("computer.getCPUInfo");
  }

  getDisplays() {
    return this.WebsocketIPC.sendMessage("computer.getDisplays");
  }

  getMousePosition() {
    return this.WebsocketIPC.sendMessage("computer.getMousePosition");
  }
}

module.exports = Computer;