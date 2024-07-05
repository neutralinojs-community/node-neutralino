const NeutralinoApp = require("../../src/index");
const SerialPort = require('serialport');

const app = new NeutralinoApp({
  url: "/hello",
  windowOptions: {
    enableInspector: false
  }
})

app.init()

// app.events.on("backend:getPorts",async () => {
//   const ports = await SerialPort.list()
//   app.events.dispatch("frontend:getPorts", ports.map(port => port.path))
// })