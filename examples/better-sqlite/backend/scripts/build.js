// this file is not intended to be run directly, but rather to be run npm scripts

const path = require('path');
const webpack = require('webpack');

function main() {
  console.log("Bundling server.mjs...");

  webpack({
    entry: "./server.mjs",
    output: {
      filename: 'server.js',
      path: path.resolve(__dirname, '../dist'),
      libraryTarget: 'commonjs2',
      clean: true
    },
    resolve: {
      extensions: ['.js', '.mjs']
    },
    target: 'node',
    mode: 'production',
    externals: {
      "better-sqlite3": "better-sqlite3"
    }
  }).run((err, _stats) => {
    if (err) {
      console.error("Error bundling server.mjs:", err);
      return;
    }
    console.log("Bundled server.mjs file successfully.");
  })
  
}

main();