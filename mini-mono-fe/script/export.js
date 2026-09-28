/**
 * 这是原来cexport的代码，做了一些改进和优化，以后不用每个项目都copy了
 */
const fs = require('fs-extra');
const path = require('path');
const { success, log, error, parseArgs } = require('./utils');

async function main() {
  const { p: project, e: env = 'production' } = parseArgs();

  // 针对production做特殊处理
  const SOURCE_PATH = path.join(
    __dirname,
    '..',
    `dist/${env === 'production' ? '' : env + '/'}apps/${project}/`
  );

  const TARGET_PATH = path.join(
    __dirname,
    '..',
    `dist/${env}/apps/${project}/`,
    `/exported`
  );

  const CHUNKS_PATH = path.join(SOURCE_PATH, '.next', 'static');
  const PAGES_PATH = path.join(SOURCE_PATH, '.next', 'server/pages');
  const PUBLIC_PATH = path.join(SOURCE_PATH, 'public');
  log(
    'Start to export the static files, including: Images, HTML, JS, CSS ... etc\n'
  );
  log('SOURCE_PATH:' + SOURCE_PATH);
  log('TARGET_PATH:' + TARGET_PATH);

  // Check source exist
  if (!fs.existsSync(SOURCE_PATH)) {
    error(
      'Source packaged folder is not found, please execute the build command first:'
    );
    error(`make build APP=${project} ENV=${env}`);
    process.exitCode = 1;
  }

  // Create output folder
  if (!fs.existsSync(TARGET_PATH)) {
    fs.mkdirSync(TARGET_PATH, { recursive: true });
  }

  // Copy the static chunks
  fs.copySync(CHUNKS_PATH, TARGET_PATH + '/_next/static');

  // Copy pages
  const pageFiles = fs.readdirSync(PAGES_PATH);
  pageFiles.forEach((file) => {
    const isDir = fs.lstatSync(`${PAGES_PATH}/${file}`).isDirectory();
    if (isDir || /.(html|htm)$/.test(file) || fs.is) {
      fs.copySync(`${PAGES_PATH}/${file}`, `${TARGET_PATH}/${file}`);
    }
  });

  // Copy resources
  const publishFiles = fs.readdirSync(PUBLIC_PATH);
  publishFiles.forEach((file) => {
    fs.copySync(`${PUBLIC_PATH}/${file}`, `${TARGET_PATH}/${file}`);
  });

  success('Export Successfully!!');
}

main();
