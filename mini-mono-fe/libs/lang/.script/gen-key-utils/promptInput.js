const readlineSync = require('readline-sync');
const fs = require('fs-extra');
const path = require('path');

/**
 * Prompt user for app name
 * @returns string app name
 */
function promptAppName(){
  const appsPath = path.join(__dirname, '..', '..', '..', '..', 'apps');
  const appList = fs.readdirSync(appsPath).filter(appName => !appName.includes('-e2e') && !appName.includes('gitkeep'));
  const appIndex = readlineSync.keyInSelect(appList, 'Please select the app that you want to generate Weblate key: ');
  const selectedApp = appList[appIndex];
  if (selectedApp === undefined) {
    console.info('This command has been cancelled. ');
    return;
  }
  console.info(`Ok, you have selected ${selectedApp}.`);
  return selectedApp;
}

/**
 * Prompt user for Weblate API key
 * @returns string Weblate API key
 */
function promptApiKey(){
  return readlineSync.question('Please input your Weblate API key: ');
}

module.exports = { promptAppName, promptApiKey }
