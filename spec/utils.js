const fs = require('fs');
const { execSync } = require('child_process');

function run(command) {
    let output = null;
    let err = null;
    let statusCode = 0;

    try {
        output = execSync(command);
    }
    catch(error) {
        statusCode = error.status;
        err = error;
    }
    finally {
        return { 
            error: decodeUTF8(err), 
            data : decodeUTF8(output), 
            status : statusCode
        };
    }
}

function decodeUTF8(decode) {
    return decode ? decode.toString('utf8') : null;
}

function cleanup() {
    try {
        fs.rmSync('./test-app',{ recursive: true});
    }
    catch(err) {
        // ignore
    }
}

const defaultOptions = {
    url: './',
    windowOptions: {
      width: 500,
      height: 500,
      hidden: true
    }
};

module.exports = {
    cleanup,
    run,
    defaultOptions
}