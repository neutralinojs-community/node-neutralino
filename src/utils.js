const constants = require("./constants");
const fs = require("fs");

function normalize(arg) {
  if (typeof arg != "string") return arg;
  arg = arg.trim();
  if (arg.includes(" ")) {
    arg = `"${arg}"`;
  }
  return arg;
}

function getBinaryName(arch) {
  let platform = process.platform;

  if (!(platform in constants.files.binaries)) return "";
  if (!(arch in constants.files.binaries[process.platform])) return "";
  return constants.files.binaries[process.platform][arch];
}

function getAuthInfo() {
  let authInfo = null;
  try {
    authInfo = fs.readFileSync(inBuildMode() ? constants.files.buildAuthFile : constants.files.authFile, "utf8");
    authInfo = JSON.parse(authInfo);
  } catch (err) {
    // ignore
  }
  return authInfo;
}

function arrayBufferToBase64(data) {
  let bytes = new Uint8Array(data);
  let asciiStr = "";

  for (let byte of bytes) {
    asciiStr += String.fromCharCode(byte);
  }

  return window.btoa(asciiStr);
}

function base64ToBytesArray(data) {
  const binaryData = window.atob(data);
  const len = binaryData.length;
  const bytes = new Uint8Array(len);

  for (let i = 0; i < len; i++) {
    bytes[i] = binaryData.charCodeAt(i);
  }

  return bytes.buffer;
}

function trimPath(path) {
  return path ? path.replace(/^\//, '') : path;
}

function inBuildMode(){
  return fs.existsSync("bin/resources.neu")
}

module.exports = {getBinaryName, normalize, getAuthInfo, arrayBufferToBase64, base64ToBytesArray, trimPath, inBuildMode}