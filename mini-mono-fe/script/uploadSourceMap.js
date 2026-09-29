const SentryCli = require('@sentry/cli');
const fs = require('fs-extra');
const {
  success,
  log,
  error,
  resolve,
  parseArgs,
  writeFile,
  getPathsDir,
  execSync
} = require('./utils');
const path = require('path');

const STRIP_REGEX = {
  css: /(\/\*# sourceMappingURL\S*)/g,
  js: /(\/\/# sourceMappingURL\S*)/g
};

const stripSourceMapDirectives = async (paths) => {
  for (const path of paths) {
    const content = await fs.readFile(path, 'utf8');
    const isCss = path.endsWith('.css');
    const regex = isCss ? STRIP_REGEX.css : STRIP_REGEX.js;
    const cleanedCode = content.replace(regex, '');
    await writeFile(path, cleanedCode);
  }
};

const getSentryConfigPath = (env) => {
  const fileName = env === 'production' ? 'sentry.properties' : 'sentry.internal.properties';
  return resolve(`../config/${fileName}`);
};

const cleanupSourceMaps = async (projectDir) => {
  log('Cleaning up source maps...');
  const mapFiles = await getPathsDir(`${projectDir}/**/*.map`);
  mapFiles.forEach((path) => execSync(`rm -rf ${path}`));

  const codeFiles = await getPathsDir(`${projectDir}/**/*.*(js|css)`);
  await stripSourceMapDirectives(codeFiles);
};

async function main() {
  const { p: project, e: env } = parseArgs(process.argv.slice(2));
  const isProduction = env === 'test'; // TODO
  const projectEnvConfig = require(resolve(`../apps/${project}/env/${env}.js`));
  const basePath = projectEnvConfig.BASE_PATH;
  const configFile = getSentryConfigPath(env);

  try {
    const sentryAuthToken = ''; // TODO

    log(`SENTRY_AUTH_TOKEN: ${sentryAuthToken}`);
    const cli = new SentryCli(configFile, {
      silent: false,
      authToken: sentryAuthToken
    });

    // 从打包生成的 build-id 文件或环境变量中读取版本号
    let release = project;
    // 针对production做特殊处理
    const projectNextDir = path.join(
      __dirname,
      '..',
      `dist/${env === 'production' ? '' : env + '/'}apps/${project}/.next`
    );
    // const projectNextDir = `./dist/apps/${project}/.next`;
    // const buildIdPath = `${projectNextDir}/BUILD_ID`;

    // try {
    //   // 尝试读取 Next.js 生成的 BUILD_ID
    //   release = await fs.readFile(buildIdPath, 'utf8').then((id) => id.trim());
    //   log(`Using BUILD_ID as release: ${release}`);
    // } catch (e) {
    //   // 如果 BUILD_ID 不存在，使用 git commit hash + 时间戳
    //   const gitHash = execSync('git rev-parse --short HEAD').trim();
    //   const timestamp = Date.now();
    //   release = `${project}-${gitHash}-${timestamp}`;
    //   log(`Generated release version: ${release}`);
    // }

    log(`Sentry release: ${release}`);

    await cli.releases.new(release, { ...cli.releases.options });

    if (isProduction) {
      log('Uploading source maps...');
      log(`SourceMap filePath: ${projectNextDir}/static/chunks`);
      await cli.releases.uploadSourceMaps(release, {
        configFile,
        release,
        finalize: true,
        rewrite: false,
        ext: ['js', 'map'],
        ignore: ['node_modules'],
        include: [`${projectNextDir}/static/chunks`],
        // include: [`${projectNextDir}/_next/static/chunks`],
        urlPrefix: `~${basePath}/_next/static/chunks`
      });

      await cleanupSourceMaps(projectNextDir);
      success('Sentry Uploaded and cleaned up successfully');
    }

    process.exitCode = 0;
  } catch (e) {
    error('Sentry upload sourceMap Process failed');
    console.error(e);
    process.exitCode = 1;
  }
}

main();
