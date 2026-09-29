const SentryCli = require('@sentry/cli');
const path = require('path');
const fs = require('fs-extra');

const {
  success,
  log,
  error,
  resolve,
  parseArgs,
  writeFile,
  getPathsDir,
  execSync,
} = require('./utils');
// const configPath = resolve('../.nx-cache/buildRelease.json');
// const buildInfo = require(configPath);

const removeSourceMapStr = async function (paths) {
  const arr = [];
  for (const path of paths) {
    const resp = await fs.readFile(path);
    let code;
    if (path.endsWith('.css')) {
      code = resp.toString().replace(/(\/\*# sourceMappingURL\S*)/g, '');
    } else {
      // js
      code = resp.toString().replace(/(\/\/# sourceMappingURL\S*)/g, '');
    }

    writeFile(path, code);
  }
};

async function main() {
  const { p: project, e: env } = parseArgs(process.argv.slice(2));
  //  const basePath = path.join(__dirname,)
  // const basePath = path.resolve('/app/forward/desktop', 'joe.txt'); // '/etc/joe.txt'

  let configFile = resolve('/.sentryclirc');

  // else {
  //   // 本地内网环境
  //   configFile = resolve('../config/sentry.internal.properties');
  // }

  try {
    const cli = new SentryCli(configFile, { silent: false });

    const release = 'future-trade';
    log('Sentry release：' + release);
    await cli.releases.new(release, { ...cli.releases.options, configFile });
    let envPath = env + '/';
    // if (env === 'production') {
    //   log('Upload source map...');
    //   envPath = '';
    //   await cli.releases.uploadSourceMaps(release, {
    //     configFile,
    //     release,
    //     finalize: true,
    //     rewrite: false,
    //     ext: ['js', 'map'],
    //     ignore: ['node_modules'],
    //     include: [`app/forward/desktop/static/js`],
    //     // urlPrefix: `~${basePath}/_next/static/chunks`, // ???
    //   });

    //   // const projectNextDir = `./dist/${envPath}apps/${project}/.next`;

    //   // delete source map
    //   // const mapPaths = await getPathsDir(`${projectNextDir}/**/*.map`);
    //   // mapPaths.forEach((path) => execSync(`rm -rf ${path}`));

    //   //  delete source map str
    //   // const mapStrPaths = await getPathsDir(`${projectNextDir}/**/*.*(js|css)`);
    //   // await removeSourceMapStr(mapStrPaths);
    //   // success('Uploaded successfully');
    // }

    process.exitCode = 0;
  } catch (e) {
    error('Sourcemap upload failed');
    console.log(e);
    process.exitCode = 1;
  }

  // 源码上传的意思就是将源码压缩一下然后上传
  // src不行，会改变原打码。app/forward/desktop不行。已经看不出来源代码了
}

main();
