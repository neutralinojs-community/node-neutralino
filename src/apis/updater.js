
class Updater {
  constructor(WebSocketIPC) {
    this.WebsocketIPC = WebSocketIPC;
  }
  
  checkForUpdates (url) {
    function isValidManifest(manifest) {
      if (manifest.applicationId && manifest.applicationId == window.NL_APPID
        && manifest.version && manifest.resourcesURL) {
        return true;
      }
      return false;
    }

    return new Promise(async (resolve, reject) => {
      if (!url) {
        return reject({
          code: 'NE_RT_NATRTER',
          message: 'Missing require parameter: url'
        });
      }
      try {
        const response = await fetch(url);
        manifest = JSON.parse(await response.text());

        if (isValidManifest(manifest)) {
          resolve(manifest);
        }
        else {
          reject({
            code: 'NE_UP_CUPDMER',
            message: 'Invalid update manifest or mismatching applicationId'
          });
        }
      }
      catch (err) {
        reject({
          code: 'NE_UP_CUPDERR',
          message: 'Unable to fetch update manifest'
        });
      }

    });
  }

  install () {
    return new Promise(async (resolve, reject) => {
      if (!manifest) {
        return reject({
          code: 'NE_UP_UPDNOUF',
          message: 'No update manifest loaded'
        });
      }
      try {
        const response = await fetch(manifest.resourcesURL);
        const resourcesBuffer = await response.arrayBuffer();
        await this.filesystem.writeBinaryFile(window.NL_PATH + "/resources.neu", resourcesBuffer);

        resolve({
          success: true,
          message: 'Update installed. Restart the process to see updates'
        });
      }
      catch (err) {
        reject({
          code: 'NE_UP_UPDINER',
          message: 'Update installation error'
        });
      }
    });
  }
}

module.exports = Updater;