const fe = require('fs-extra');
const day = require('dayjs');
const { success, error, resolve, parseArgs, getApps } = require('./utils');
const configPath = resolve('../.nx-cache/buildRelease.json');

// 初始化releaseInfo信息
function initReleaseInfo(projectList) {
  let config = {};
  if (fe.existsSync(configPath)) {
    config = require(configPath);
  }
  const len = projectList.length;
  for (let i = 0; i < len; i++) {
    if (!config[projectList[i]]) {
      config[projectList[i]] = {
        production: '',
        test: '',
        testnet: ''
      };
    }
  }
  return config;
}

// fe.writeFileSync(configPath, renderConfigData(env), { encoding: 'utf8' });

// node script/genBuildRelease.js -e [test|testnet|production(default)] -p xxx
async function main() {
  const apps = getApps();

  const { p: project, e: env } = parseArgs(process.argv.slice(2));
  // check
  if (!project) {
    error(
      'Please enter node script/genBuildRelease.js -e [test|testnet|production(default)] -p xxx'
    );
    process.exitCode = 1;
    return;
  }
  if (!apps.find((k) => k === project)) {
    error('No project named ' + project + ' was found');
    process.exitCode = 1;
    return;
  }
  try {
    const releaseInfo = initReleaseInfo(apps);

    releaseInfo[project][env] = {
      // 用于生成每次release的版本号
      release: project + ':' + day().format('YYYY-MM-DD HH:mm')
    };

    const jsonData = `${JSON.stringify(releaseInfo, undefined, 2)}`;
    fe.writeFileSync(configPath, jsonData, { encoding: 'utf8' });

    success(
      `${project}:${env}:${releaseInfo[project][env].release} write ${configPath} successfully`
    );
  } catch (e) {
    error('genBuildRelease error ');
    console.error(e);
    process.exitCode = 1;
  }
}

main();
