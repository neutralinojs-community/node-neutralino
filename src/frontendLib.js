const { trimPath } = require('./utils.js');
const spawnCommand = require('spawn-command');
const fs = require('fs');
const process = require('process');
const recursive = require('recursive-readdir');
const tpu = require('tcp-port-used');
const constants = require('./constants.js');

const HOT_REL_LIB_PATCH_REGEX = constants.misc.hotReloadLibPatchRegex;
const HOT_REL_GLOB_PATCH_REGEX = constants.misc.hotReloadGlobPatchRegex;
let originalClientLib = null;
let originalGlobals = null;

async function makeClientLibUrl(port, frontendLibOptions) {
    let resourcesPath = frontendLibOptions.resourcesPath.replace(/^\//, '');
    let files = await recursive(resourcesPath);
    let clientLib = files.find((file) => /neutralino\.js$/.test(file));
    if (clientLib) {
        clientLib = clientLib.replace(/\\/g, '/'); // Fix path on Windows
    }
    let url = `http://localhost:${port}`;

    if(clientLib) {
        clientLib = '/' + clientLib;
        if(frontendLibOptions.documentRoot) {
            clientLib = clientLib.replace(frontendLibOptions.documentRoot, '/');
        }
        url += clientLib;
    }
    return url;
}

function makeGlobalsUrl(port) {
    return `http://localhost:${port}/__neutralino_globals.js`;
}

function patchHTMLFile(scriptFile, regex, frontendLibOptions) {
    let patchFile = frontendLibOptions.patchFile.replace(/^\//, '');
    let html = fs.readFileSync(patchFile, 'utf8');
    let matches = regex.exec(html);
    if(matches) {
        html = html.replace(regex, `$1${scriptFile}$3`);
        fs.writeFileSync(patchFile, html);
        return matches[2];
    }
    return null;
}

function getPortByProtocol(protocol) {
    switch (protocol) {
        case 'http:':
          return 80;
        case 'https:':
            return 443;
        case 'ftp:':
          return 21;
        default:
            return -1;
      }
}

module.exports.bootstrap = async (port, frontendLibOptions) => {
    if(frontendLibOptions.clientLibrary) {
        let clientLibUrl = await makeClientLibUrl(port);
        originalClientLib = patchHTMLFile(clientLibUrl, HOT_REL_LIB_PATCH_REGEX, frontendLibOptions);
    }
    let globalsUrl = makeGlobalsUrl(port);
    originalGlobals = patchHTMLFile(globalsUrl, HOT_REL_GLOB_PATCH_REGEX, frontendLibOptions);
    console.warn('Global variables patch was applied successfully. ' +
        'Please avoid sending keyboard interrupts.');
    console.log(`You are working with your frontend library's development environment. ` +
        'Your frontend-library-based app will run with Neutralino and be able to use the Neutralinojs API.');
}

module.exports.cleanup = ( frontendLibOptions ) => {
    if(originalClientLib) {
        patchHTMLFile(originalClientLib, HOT_REL_LIB_PATCH_REGEX, frontendLibOptions);
    }
    if(originalGlobals) {
        patchHTMLFile(originalGlobals, HOT_REL_GLOB_PATCH_REGEX, frontendLibOptions);
    }
    console.log('Global variables patch was reverted.');
}


module.exports.runCommand = (commandKey, frontendLibOptions) => {

    if (frontendLibOptions && frontendLibOptions.projectPath && frontendLibOptions[commandKey]) {
        return new Promise((resolve, _reject) => {
            let projectPath = trimPath(frontendLibOptions.projectPath);
            let cmd = frontendLibOptions[commandKey];

            console.log(`Running ${commandKey}: ${cmd}...`);
            const proc = spawnCommand(cmd, { stdio: 'inherit', cwd: projectPath });
            proc.on('exit', (code) => {
                console.log(`FrontendLib: ${commandKey} completed with exit code: ${code}`);
                resolve();
            });
        });
    }
}

module.exports.waitForFrontendLibApp = async ( frontendLibOptions ) => {
    let devUrlString = frontendLibOptions ? frontendLibOptions.devUrl : undefined;
    let timeout = frontendLibOptions && frontendLibOptions.waitTimeout | 20000;
    let url = new URL(devUrlString);
    let portString = url.port;
    let port = portString ? Number.parseInt(portString) : getPortByProtocol(url.protocol);
    if (port < 0) {
        utils.error(`Could not get frontendLibrary port of ${devUrlString} with protocol ${url.protocol}`);
        process.exit(1);
    }

    let inter = setInterval(() => {
        console.log(`App will be launched when ${devUrlString} on port ${port} is ready...`);
    }, 2500);

    try {
        await tpu.waitUntilUsedOnHost(port, url.hostname, 200, timeout);
    }
    catch(e) {
        utils.error(`Timeout exceeded while waiting till local TCP port: ${port}`);
        process.exit(1);
    }
    clearInterval(inter);
}
