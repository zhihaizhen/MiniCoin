const fs = require('fs-extra');
const https = require('https');
const AdmZip = require('adm-zip');
const clc = require('cli-color');
const path = require('path');
const { rimraf, rimrafSync, native, nativeSync } = require('rimraf');
const { spawnSync, execSync } = require('child_process');
const targetLangs = require('../../../config/locales');

// git@git.betterbitfinance.com:betterbitfinance/frontend/betterbit-cdn/translation.git
// git@git.betterbitfinance.com:mini-site/frontend/cdn/mini-translation.git
const GIT_HOST = 'git@git.betterbitfinance.com';
const GIT_GROUP = 'mini-site';
const REMOTE_TRANSLATION_PROJECT = 'mini-translation';
const TARGET_TRANSFILE_FOLDER = '.sync';
const TRANSLATION_ZIP_URL =
  'https://translation.bitrunfinance.com/translation/export/get?type_id=3';
const HOLD_SYMBOL = '$:';
// 读取clone后的文件内容
const cloneFilePath = path.join(__dirname, '..', REMOTE_TRANSLATION_PROJECT);
const copyFilePath = path.join(__dirname, '..', TARGET_TRANSFILE_FOLDER);

// Step1: Clone the remote repository if not exisit, or pull this one
async function cloneOrPull() {
  let spawn;
  let isClone = true;

  console.log(clc.green('Start to clone ...'));
  // 从远程clone代码,在这之前要删除/libs/lang/src/translation文件夹
  if (fs.existsSync(cloneFilePath)) {
    rimraf.sync(cloneFilePath);
  }

  spawn = await spawnSync(
    'git',
    [
      'clone',
      '--depth',
      '1',
      `${GIT_HOST}:${GIT_GROUP}/frontend/cdn/${REMOTE_TRANSLATION_PROJECT}.git`,
      '--progress'
    ],
    {
      stdio: 'inherit',
      maxBuffer: 1000 * 1000 * 1024
    }
  );

  console.log('git spawn sync result: ', spawn);
  if (isClone && spawn && spawn.stderr && spawn.status !== 0) {
    console.log(Error(spawn.stderr));
    process.exit(1);
  }
}

// new Step1: 从远程拉取最新的翻译文件
async function pullRemoteTranslation(
  uri = TRANSLATION_ZIP_URL,
  dest = cloneFilePath
) {
  return new Promise((resolve, reject) => {
    console.log(clc.green('Start to fetch ...'));

    // 从远程clone代码,在这之前要删除/libs/lang/src/translation文件夹
    if (fs.existsSync(cloneFilePath)) {
      rimraf.sync(cloneFilePath);
    }
    fs.mkdirSync(cloneFilePath);
    // 确保dest路径存在
    console.log('download start');
    const file = fs.createWriteStream(dest + '/translation.zip');
    console.log('request start');
    const request = https.get(uri, (res) => {
      if (res.statusCode !== 200) {
        reject(res.statusCode);
        return;
      }

      res.on('error', (err) => {
        // Handle error
        console.log('requestError:' + err);
        reject(err.message);
        return;
      });

      res.on('end', () => {
        console.log('download end');
      });

      // 进度、超时等

      file
        .on('finish', () => {
          console.log('finish write file');
          file.close(resolve);
        })
        .on('error', (err) => {
          fs.unlink(dest);
          reject(err.message);
        });

      res.pipe(file);
    });
  });
}
async function parseZip() {
  // 创建AdmZip对象
  const zip = new AdmZip(`${cloneFilePath}/translation.zip`);

  try {
    await zip.extractAllTo(cloneFilePath, true);
    rimraf.sync(`${cloneFilePath}/translation.zip`);
    // copy en-US to ed-ED folder
    const enUSPath = path.resolve(`${cloneFilePath}/en-US`);
    const edEDPath = path.resolve(`${cloneFilePath}/ed-ED`);
    await fs.copySync(enUSPath, edEDPath);
    console.log('ZIP file decompression completed');
  } catch (error) {
    console.error('ZIP file decompression error', error);
  }
}

// Step2: Merge the local and remote files, replace the special key
async function mergeTranslationJsonFiles() {
  console.log(clc.green('Start to copy content ...'));
  if (fs.existsSync(copyFilePath)) {
    rimraf.sync(copyFilePath);
  }

  // 语言过滤
  const langs = await getAllLanguages();
  const map = {};
  const filePath = path.resolve(`${cloneFilePath}/en-US`);
  const pageFiles = await getAllPagesOfLanguage(filePath);
  //过滤不需要copy的文件
  const noCopyFileName = [
    'trade_share.json',
    'ztsl_sign_up.json',
    'ztsl_earn.json',
    'assets.json',
    'tg-mini-game.json',
    'tg-mj-bot.json',
    'tg-trade.json',
    'spot-trade.json',
    'app.json',
    'app_locale.json',
    'zkp-page.json',
    'future.json'
  ];
  const pages = pageFiles.filter((it) => !noCopyFileName.includes(it));
  for (let i = 0; i < langs.length; i += 1) {
    const lang = langs[i];
    // Create resouce map
    if (!map.lang) {
      map[lang] = [];
    }

    for (let j = 0; j < pages.length; j += 1) {
      const fileName = path.basename(pages[j], '.json'); //读取文件名
      // 需要做目录转换的文件
      let finalContent;
      const newFileNameMap = {
        ztsl_error_code: 'error_code'
      };

      const newPage = `${newFileNameMap[fileName] || fileName}.json`;
      const page = pages[j]; //如ztsl_error_code.json

      // 读取clone后的文件内容
      const remotePath = path.resolve(`${cloneFilePath}/${lang}/${page}`);
      if (!fs.existsSync(remotePath)) {
        // Skip files that don't exist in remote location
        continue;
      }

      const remotePathFile = fs.readFileSync(remotePath, 'utf-8');
      const remotePathContent = JSON.parse(remotePathFile);
      finalContent = remotePathContent;

      // 写入新文件夹
      const newFolderPath = path.resolve(`${copyFilePath}/${lang}`);
      const isFolderExist = await fs.existsSync(newFolderPath);
      if (!isFolderExist) {
        await fs.mkdirSync(newFolderPath, { recursive: true });
      }
      await fs.writeFileSync(
        `${newFolderPath}/${newPage}`,
        JSON.stringify(finalContent),
        { recursive: true }
      );

      // Add page to resource map
      map[lang].push(page);
    }
  }
  console.log(
    clc.green('Sync successfully with relative resource: \r\n') +
      clc.blueBright(JSON.stringify(map))
  );
}

// 语言过滤
async function getAllLanguages() {
  const langs = targetLangs[0];
  const filters = [];
  const isDir = await fs.lstatSync(`${cloneFilePath}/${langs}`).isDirectory();
  for (let i = 0; i < targetLangs.length; i += 1) {
    if (isDir) {
      filters.push(targetLangs[i]);
    }
  }
  return filters;
}

// Get all apps/pages in current mono
async function getAllPagesOfLanguage(filePath) {
  const langs = await fs.readdirSync(filePath).filter((f) => /.json$/.test(f));
  return langs;
}

// Main entry method
async function startSync() {
  // await cloneOrPull();
  await pullRemoteTranslation();
  await parseZip();
  await mergeTranslationJsonFiles();
}

startSync();
