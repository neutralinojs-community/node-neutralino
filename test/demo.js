const NeutralinoApp = require("../src/index.js")

const app = new NeutralinoApp({
  url: '/',
  modes: {
    window: {
      width: 500,
      height: 500
    }
  }
});

app.init();