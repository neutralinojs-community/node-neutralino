# Node Neutralino

[<img src="media/neutralino-logo.png" align="right" width="100">](https://neutralino.js.org)

Node Neutralino is a NPM package that lets you write backend code for your [Neutralinojs](https://neutralino.js.org) Apps, It supports Vanilla JS as well as Frontend Frameworks.

---

You could manually add Node Neutralino to your projects or Get started with one of the premade templates!

Templates:
- [Vanilla JS](https://github.com/neutralinojs-community/node-neutralino-vanilla)
- [Vite + React.js + TS](https://github.com/neutralinojs-community/node-neutralino-react)

### Example Usage:

- #### Using Templates

```bash
# Use neutralinojs-community/node-neutralino-vanilla for Vanilla JS template
$ neu create myapp --template neutralinojs-community/node-neutralino-react
$ cd myapp

# Run Neu App
$ neu run

# Build Neu App
$ neu build --clean
```
- #### Manual Instructions

> - Add `node-neutralino` as npm dependency in root of your NEU App.
> ```bash
> $ npm i node-neutralino
> ```
> 
> - Add config in `neutralino.config.json` for projectRunner
> ```json
> // This is required since node-neutralino communicates via neutralinojs extension protocol.
> "enableExtensions": true,
> "extensions": [
>   {
>       "id": "js.node-neutralino.projectRunner"
>   }
> ]
> 
> // Add projectRunner Config
> "cli": {
>   "projectRunner": {
>     "projectPath": "/", // initCommand, devCommand, buildCommand will run in this folder
>     "buildPath": "./node-src/dist/", // Location where built backend file(s) need to be located after buildCommand
>     "initCommand": "npm install", // (optional) This command is executed when app is created from a template repo with neu create
>     "devCommand": "tsx ./server.ts", // (optional) This command is executed when app is opened in dev mode to run the projectRunner File
>     "buildCommand": "tsc" // (optional) This command is executed when app is being built, developers are responsible to make sure that built backend files are located in projectRunner.buildPath after executing this command.
>   }
> }
> ```
> - Create backend file that imports `node-neutralino` package and initializes the Neu app.
> Example:
> ```js
> // server.ts
> import NeutralinoApp from "node-neutralino"
> 
> async function main() {
>   const app = new NeutralinoApp({
>     url: "/",
>     windowOptions: {
>       enableInspector: false,
>     }
>   });
> 
>   app.init();
> 
>   app.events.on("backend.maximize", () => {
>     app.window.maximize()
>   })
> }
> 
> main();
> ```
> - Now you can run/build the Neu app with neu-cli commands easily.
> ```bash
> # To run the app
> $ neu run
> 
> # To build the app
> $ neu build --clean
> ```
> <br>


### NeutralinoApp Configuration Options

#### url 
- The entry URL of the application. Neutralinojs will initially load this URL [Ref](https://neutralino.js.org/docs/configuration/neutralino.config.json#url-string)

#### windowOptions.title
- Title of the native window. [Ref](https://neutralino.js.org/docs/configuration/neutralino.config.json#modeswindowtitle-string)

#### windowOptions.icon
- Application icon's file name. [Ref](https://neutralino.js.org/docs/configuration/neutralino.config.json#modeswindowicon-string)

#### windowOptions.fullScreen
- Activates the full-screen mode. [Ref](https://neutralino.js.org/docs/configuration/neutralino.config.json#modeswindowfullscreen-boolean)

#### windowOptions.alwaysOnTop
- Activates the top-most mode. [Ref](https://neutralino.js.org/docs/configuration/neutralino.config.json#modeswindowalwaysontop-boolean)

#### windowOptions.enableInspector
- Automatically opens the developer tools window. [Ref](https://neutralino.js.org/docs/configuration/neutralino.config.json#modeswindowenableinspector-boolean)

#### windowOptions.borderless
- Activates the borderless mode. [Ref](https://neutralino.js.org/docs/configuration/neutralino.config.json#modeswindowborderless-boolean)

#### windowOptions.maximize
- Launches the application maximized. [Ref](https://neutralino.js.org/docs/configuration/neutralino.config.json#modeswindowmaximize-boolean)

#### windowOptions.hidden
- Make the window invisible. [Ref](https://neutralino.js.org/docs/configuration/neutralino.config.json#modeswindowhidden-boolean)

#### windowOptions.maximizable
- Makes the window maximizable or not. [Ref](https://neutralino.js.org/docs/configuration/neutralino.config.json#modeswindowresizable-boolean)

#### windowOptions.useSavedState
- Save and load the primary window state (width, height, x, y, values and maximized status) automatically. [Ref](https://neutralino.js.org/docs/configuration/neutralino.config.json#modeswindowusesavedstate-boolean)

#### windowOptions.exitProcessOnClose
- If this setting is true, the app process will exit when the user clicks on the close button. [Ref](https://neutralino.js.org/docs/configuration/neutralino.config.json#modeswindowexitprocessonclose-boolean)

#### windowOptions.extendUserAgentWith
- Extends the default webview-specific user agent string with a custom suffix. [Ref](https://neutralino.js.org/docs/configuration/neutralino.config.json#modeswindowextenduseragentwith-string)

#### windowOptions.processArgs
- (String) Additional command-line arguments for the new window process. Check all supported internal command-line arguments from [here](https://neutralino.js.org/docs/cli/internal-cli-arguments)

> ##### Read more about working with frontend library and config [here](https://neutralino.js.org/docs/getting-started/using-frontend-libraries#enabling-hot-reload-and-configuration)

#### windowOptions.frontendLibrary.patchFile
- [String] Location for HTML file for HRM (hot module replacement)

#### windowOptions.frontendLibrary.devUrl
- [String] (Optional) Development Server URL

#### windowOptions.frontendLibrary.clientLibrary
- [String] (Optional) Filename of the Neutralinojs JavaScript library. [Ref](https://neutralino.js.org/docs/configuration/neutralino.config.json#cliclientlibrary-string)

#### windowOptions.frontendLibrary.resourcesPath
- [String] (Optional) Path of your application resources. [Ref](https://neutralino.js.org/docs/configuration/neutralino.config.json#cliresourcespath-string)

#### windowOptions.frontendLibrary.documentRoot
- [String] (Optional) Sets the document root for the static server. [Ref](https://neutralino.js.org/docs/configuration/neutralino.config.json#documentroot-string)

#### windowOptions.frontendLibrary.projectPath
- [String] (Optional) Path to resources for frontend lib app. windowOptions.frontendLibrary.devCommand will be executed in this location.

#### windowOptions.frontendLibrary.devCommand
- [String] (Optional) Command to start frontend library development server.

#### windowOptions.frontendLibrary.waitTimeout
- [Number] (Optional) Amount of time to wait in miliseconds to start the development server before the Neu App exits out.

--- 

### Steps to create your own Project Runner in any language

- This is a guide to show you how you can create similar package like `node-neutralino` in any language, eg: `py-neutralino`, `rust-neutralino`, etc.
- Steps:
- 1st Step (Spawning Neutralino Binaries With Process Args):
  - Take input from users for all the [supported args](https://github.com/neutralinojs-community/node-neutralino/blob/main/types/api/window.ts).
  - Spawn Binaries with given args by converting from object to string.
- 2nd Step (Connect To Neutralino Server):
  - To communicate with the spawed app you can connect with the internal server through WebSockets.
  - `--export-auth-info` args can be given to export the auth info used to connect with Neutralino Server.
  - `--enable-extensions=true` can be given in args to enable for extension in server.
  - You can follow [this guide](https://neutralino.js.org/docs/how-to/extensions-overview) to connect with the WS server.
  - Listens for messages and emit the messages according to its type. Send Message/event when a function is triggered on the connected WS.
- 3rd Step (Support Frontend Libraries):
  - If frontendLib option are provided during spawning the binaries, then few extra steps need to be followed.
  - Patch HTML file by including script for global variables.
  - Start the given devCommand in projectPath to start the frontend lib dev server.
  - Wait for the port to be busy to detect if the development server is started or not.