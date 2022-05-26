# node-neutralino
Develop Neutralinojs apps with a Node.js backend

### Goal

```js
const { NeutralinoApp } = require('@neutralinojs/node-neu');

const app = new NeutralinoApp({
              url: '/resources', 
              modes: {
                window: {
                  width: 500,
                  height: 500
                }
              }
             });

app.events.on('testEvent', () => {
  // Node.js code
});
```
