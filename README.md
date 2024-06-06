# node-neutralino

Develop Neutralinojs apps with a Node.js backend

### Goal

```js
const { NeutralinoApp } = require("@neutralinojs-community/node-neu");

const app = new NeutralinoApp({
  url: "/resources",
  modes: {
    window: {
      width: 500,
      height: 500,
    },
  },
});

app.events.on("testEvent", () => {
  // Node.js code
});
```
---

### GSoC 2024 Goal

#### node-neutralino
- [X] Code Abstraction to Multiple Files
- [X] Spawn Binaries
- [ ] Initiate a WS connection with Application
- [ ] Include Missing Events Api and Online ProcessQueue
- [ ] Create Type Decleration File
- [ ] Create Binding Compatible code
- [ ] Publish Package

#### node-neutralino-template
- [ ] Refactor template
- [ ] Demonstrates more complex and advanced use cases of the backend package
- [ ] Document the Template

#### Backend Support for CLI
- [ ] support for backend configurations in a neutralino.config.json file to enable automatic execution of backend commands

#### Documentation
- [ ]  Document all changes, including code refactoring, new APIs, and template enhancement
- [ ] Provide a guide on writing backend code in different languages to assist developers in creating wrapper packages