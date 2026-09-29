const fs = require('fs-extra');
const path = require('path');

/**
 * Clone the en-US file to all lang
 * @param appName
 * @param sourceFilePath
 */
module.exports = async function replaceAllLang(appName, sourceFilePath) {
  try {
    console.info('Start to clone en-US JSON file to all languages');
    const langLibPath = path.join(__dirname, '..', '..', 'src', 'lib');
    const readDirData = await fs.readdir(langLibPath);
    for (let i = 0; i < readDirData.length; i += 1) {
      const langName = readDirData[i];
      const targetLangPath = path.join(langLibPath, langName, `${appName}.json`);
      if (langName !== 'en-US' && langName !== 'lang.ts') {
        fs.copy(sourceFilePath, targetLangPath)
          .then(() => console.log('Replaced the file ==> ', targetLangPath))
          .catch(err => {
            console.log(`Fail to replace ${langName}`, err);
          });
      }
    }
  } catch (e) {
    console.error('Fail to clone en-US JSON file to all languages ', e);
  }
}
