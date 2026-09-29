// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs-extra');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const clc = require('cli-color');
const APP_NAME = 'trading-bot';
const DEFAULT_ENV = 'production';

const ENV =
  process.argv.length >= 3 ? `${process.argv[2].replace(/[-]/g, '')}` : '';
const ENV_PATH = ENV ? `/${ENV}` : '';

const SOURCE_PATH = path.join(
  __dirname,
  '..',
  '..',
  '..',
  `dist${ENV_PATH}/apps/${APP_NAME}/.next`
);

const ROOT_PATH = path.join(
  __dirname,
  '..',
  '..',
  '..',
  `dist${ENV_PATH}/apps/${APP_NAME}`
);

const TARGET_PATH = path.join(
  __dirname,
  '..',
  '..',
  '..',
  `dist${!ENV ? `/${DEFAULT_ENV}` : ENV_PATH}/apps/${APP_NAME}/exported`
);
const CHUNKS_PATH = path.join(SOURCE_PATH, 'static');
const PAGES_PATH = path.join(SOURCE_PATH, 'server/pages');
const PUBLIC_PATH = path.join(ROOT_PATH, 'public');

console.log(
  clc.green(
    'Start to export the static files, including: Images, HTML, JS, CSS ... etc\n'
  )
);
console.log(
  clc.green(
    'SOURCE_PATH:',
    SOURCE_PATH,
    '\n',
    'TARGET_PATH:',
    TARGET_PATH,
    '\n'
  )
);

// Check source exist
if (!fs.existsSync(SOURCE_PATH)) {
  console.error(
    clc.red(
      'Source packaged folder is not found, please execute the build command first:\n',
      `nx run ${APP_NAME}:build:${ENV_PATH.replace(/\//, '')}`
    )
  );
  process.exit();
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

console.log(clc.green('Export Successfully!!'));
