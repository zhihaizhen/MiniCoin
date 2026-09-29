const fs = require('fs-extra');
const clc = require('cli-color');
const path = require('path');
const minimist = require('minimist');

// Get arugument: app, folder
const argvObj = minimist(process.argv);
const { app, folder } = argvObj;

// Setup source and target path
const SOURCE_PATH = path.join(__dirname, '../', `.sync`);
const TARGET_PATH = path.join(__dirname, '../../../', `apps/${app}/${folder}`);

console.log(clc.green('Start to sync language to app folder: ', TARGET_PATH));

console.log('SOURCE_PATH', SOURCE_PATH);
console.log('TARGET_PATH', TARGET_PATH);

// Check source folder exist
if (!fs.existsSync(SOURCE_PATH)) {
  console.log(clc.red('source folder not exisit: ', SOURCE_PATH));
  console.log(clc.red('execute command first: nx run lang:sync '));
  process.exit(1);
}

// Check target folder exist
if (!fs.existsSync(TARGET_PATH)) {
  console.log(clc.red('target project folder does not exist: ', TARGET_PATH));
  process.exit(1);
}

// Copy all translated files in each language folder
const languageFolders = fs.readdirSync(SOURCE_PATH);
languageFolders.forEach(async (ln) => {
  console.log(clc.green('copy file: ', ln));
  const theErrorCodeTargetPath = `${TARGET_PATH}/lang/${ln}/error-code.json`;
  const theAppTargetPath = `${TARGET_PATH}/lang/${ln}/${app}.json`;
  await fs.copySync(
    `${SOURCE_PATH}/${ln}/error-code.json`,
    theErrorCodeTargetPath
  );
  await fs.copySync(`${SOURCE_PATH}/${ln}/${app}.json`, theAppTargetPath);
});

console.log(clc.green('Execute successfully !!'));
