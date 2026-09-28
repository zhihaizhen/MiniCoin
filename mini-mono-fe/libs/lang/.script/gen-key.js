const path = require('path');
const replaceEnFileWithKey = require('./gen-key-utils/replaceEnFileWithKey');
const replaceAllLang = require('./gen-key-utils/replaceAllLang');
const { promptAppName } = require('./gen-key-utils/promptInput');

const selectedApp = promptAppName();

if (selectedApp) {
  const sourceFilePath = path.join(__dirname, '..', 'src', 'lib', 'en-US', `${selectedApp}.json`);
  replaceEnFileWithKey(selectedApp, sourceFilePath)
    .then(async() => {
      await replaceAllLang(selectedApp, sourceFilePath);
    })
    .catch(err => console.error('err ', err));
} else {
  console.log('App name is not valid!')
}
