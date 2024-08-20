import NeutralinoApp from "node-neutralino"
import { SerialPort } from "serialport";

const app = new NeutralinoApp({
  url: "/",
  windowOptions: {
    enableInspector: false
  }
})

app.init()

app.events.on("backend:getPorts", async () => {
  const ports = await SerialPort.list()
  app.events.broadcast("frontend:getPorts", ports.map(port => port.path))
})
