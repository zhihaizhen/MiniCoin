const path = require('path');
const fs = require('fs-extra');
const { execSync } = require('child_process');
const { Glob } = require('glob');

// https://stackoverflow.com/questions/9781218/how-to-change-node-jss-console-font-color
const FgRed = '\x1b[31m';
const FgGreen = '\x1b[32m';
const FgBlue = '\x1b[34m';

function log(str) {
  console.info(FgBlue + '%s', str);
}
exports.log = log;

function success(str) {
  console.log(FgGreen + '%s', '✅✅✅：' + str);
}
exports.success = success;

function error(str) {
  console.error(FgRed + '%s', '❌❌❌：' + str);
}
exports.error = error;

const resolve = function (p) {
  return path.resolve(__dirname, p);
};
exports.resolve = resolve;

/**
 *  node script/genBuildRelease.js -e test -p mine-cloud
 *  return {e: test, p: mine-cloud}
 *  node script/genBuildRelease.js -e test -p mine-cloud --pipeline-env=test-better-dex-1
 *  return {e: test, p: mine-cloud, pipelineEnv: test-better-dex-1 }
 * @returns
 */
exports.parseArgs = function (argv = process.argv.slice(2)) {
  const args = argv.slice();
  // parse options
  const config = {};
  while (args.length) {
    const arg = args.shift();
    let key, value;
    // --pipeling-env=test-better-dex-1
    if (/^--[^=]+=/.test(arg)) {
      const index = arg.indexOf('=');
      key = arg.slice(0, index).replace(/^--/, '');
      value = arg.slice(index + 1);
    } else if (arg.startsWith('--')) {
      key = arg.replace(/^--/, '');
      value = args.shift();
    } else {
      key = arg.replace(/^-/, '');
      value = args.shift();
    }
    const index = key.indexOf('-');
    if (index > -1) {
      key = key.replace(/-\w/, (word) => word.replace('-', '').toUpperCase());
    }
    config[key] = value;
  }
  // console.log('config', config);
  return config;
};

exports.execSync = async function (command) {
  try {
    log(command);
    const spawn = await execSync(command, { stdio: 'inherit' });
    if (spawn && spawn.stderr && spawn.status !== 0) {
      console.log(spawn.stderr);
      process.exitCode = 1;
    }
  } catch (e) {
    error(`Error when executing ${command} `);
    console.log(e);
    process.exitCode = 1;
  }
};

exports.writeFile = (file, str) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(file, str, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(true);
      }
    });
  });
};

exports.getPathsDir = (dir) => {
  return new Promise((resolve, reject) => {
    new Glob(dir, { mark: true, sync: false }, (err, files) => {
      if (err) {
        console.error('Glob error: ', err);
        return reject(err);
      }
      resolve(files);
    });
  });
};
