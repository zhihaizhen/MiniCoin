const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');
const AdmZip = require('adm-zip');
const minimist = require('minimist');
const { rimraf } = require('rimraf');

const args = minimist(process.argv.slice(2));

const appName = args.appName;
const TARGET_FILE_PATH = path.join(
  __dirname,
  '..',
  '..',
  '..',
  'apps',
  appName,
  'mini-translation-temp'
);
// 同步语言
const syncLang = async () => {
  // 获取命令行参数
  const campaignId = args.campaignId;
  const k8s_domain_suffix = args.k8s_domain_suffix;

  const url = `http://rewards-management-platform-boot${k8s_domain_suffix}:7019/info-boot/rewards/internal/v1/language/export?type=Campaign&bizId=${campaignId}`;
  console.log('lang---url', url);
  if (!url) {
    console.error('Error: lang url parameter is required', url);
    return;
  }
  return new Promise((resolve, reject) => {
    console.log('Start to fetch ...');

    if (fs.existsSync(TARGET_FILE_PATH)) {
      rimraf.sync(TARGET_FILE_PATH);
    }
    fs.mkdirSync(TARGET_FILE_PATH);
    console.log('download start');
    const file = fs.createWriteStream(TARGET_FILE_PATH + '/translation.zip');
    console.log('request start');
    const h = url.startsWith('https') ? https : http;
    const request = h.get(url, (res) => {
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
};

async function parseZip() {
  const zip = new AdmZip(`${TARGET_FILE_PATH}/translation.zip`);
  try {
    // 解压文件到临时目录
    const tempDir = path.join(TARGET_FILE_PATH, 'temp');
    fs.mkdirSync(tempDir, { recursive: true });
    await zip.extractAllTo(tempDir, true);

    // 删除zip文件
    rimraf.sync(`${TARGET_FILE_PATH}/translation.zip`);

    // 移动文件
    const translationFolder = path.join(tempDir, 'translation');
    if (fs.existsSync(translationFolder)) {
      const files = fs.readdirSync(translationFolder);
      for (const file of files) {
        const srcPath = path.join(translationFolder, file);
        const destPath = path.join(TARGET_FILE_PATH, file);
        fs.renameSync(srcPath, destPath);
      }
    }

    // // 清理临时目录
    rimraf.sync(tempDir);

    console.log('Files extracted successfully');
  } catch (error) {
    console.error('ZIP file decompression error', error);
  }
}
async function startSync() {
  await syncLang();
  await parseZip();
}

startSync();
