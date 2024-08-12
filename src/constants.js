const constants = {
  files: {
    authFile: ".tmp/auth_info.json",
    binaries: {
      linux: {
        x64: "neutralino-linux_x64",
        armhf: "neutralino-linux_armhf",
        arm64: "neutralino-linux_arm64"
      },
      darwin: {
        x64: "neutralino-mac_x64",
        arm64: "neutralino-mac_arm64",
        universal: "neutralino-mac_universal"
      },
      win32: {
        x64: "neutralino-win_x64.exe"
      }
    },
  },
  misc: {
    hotReloadLibPatchRegex: /(<script.*src=")(.*neutralino.js)(".*><\/script>)/g,
    hotReloadGlobPatchRegex: /(<script.*src=")(.*__neutralino_globals.js)(".*><\/script>)/g
  }
};

module.exports =  constants;