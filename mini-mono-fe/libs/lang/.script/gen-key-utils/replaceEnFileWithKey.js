const fs = require('fs-extra');
const compileI18nKey = require('./compileI18nKey');
const createKeysInTms = require('./createWeblateKey');

/**
 * Replace the file content with generated i18n key
 * @param appName
 * @param sourceFilePath
 */
module.exports = async function replaceEnFileWithKey(appName, sourceFilePath) {
  console.info('Start to replace the i18n JSON file with generated keys');
  try {
    const readData = await fs.readFile(sourceFilePath, 'utf8');
    const parsedData = JSON.parse(readData);

    const res = {};
    const translationObj = {};

    Object.entries(parsedData).map(([key, value]) => {
      res[key] = compileI18nKey(key, value, key, translationObj);
    });

    await fs.writeFile(sourceFilePath, JSON.stringify(res));

    await createKeysInTms(translationObj, appName);

  } catch (e) {
    console.error('Fail to replace the i18n JSON file with generated keys ', e);
  }
};
