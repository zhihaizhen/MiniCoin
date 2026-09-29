// 构建后组装 standalone 运行目录。
// 背景: output: 'standalone' 产物默认不含 .next/static 与 public，需在构建后手动拷入，
// 否则运维 rsync 整个 dist 部署后，standalone 的 server.js 运行时找不到静态资源，
// 导致全站 JS/CSS 404、页面无样式。
//
// 关键: 因 next.config 设了 experimental.outputFileTracingRoot=monorepo 根，standalone 内
// server.js 位于 <standalone>/apps/academy/server.js 且 process.chdir(__dirname)，其
// distDir 形如 "./../../dist/<env>/apps/academy/.next"，即真实运行时 .next 在
// <standalone>/dist/<env>/apps/academy/.next。static 必须拷到该 distDir 下，而非
// <standalone>/apps/academy/.next。public 则相对 server.js 同级(./public)。
// 这里直接从 server.js 解析 distDir，保证与运行时一致、跨环境健壮。
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs-extra');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

const APP = 'academy';
const KNOWN = ['production', 'testnet', 'test', 'dev'];

// 环境解析: 优先运维已 export 的 DEPLOY_ENV，回退 CLI 参数，默认 test
const argEnv = process.argv.slice(2).find((a) => KNOWN.includes(a));
const env = process.env.DEPLOY_ENV || argEnv || 'test';

// dist 基址与运维 rsync 逻辑及 project.json outputPath 保持一致
const distBase =
  env === 'production'
    ? path.join('dist', 'apps', APP)
    : path.join('dist', env, 'apps', APP);

const standaloneApp = path.join(distBase, '.next', 'standalone', 'apps', APP);
const serverJsPath = path.join(standaloneApp, 'server.js');

if (!fs.existsSync(serverJsPath)) {
  console.error(
    `[assemble] standalone server.js 不存在: ${serverJsPath}\n` +
      `请确认 apps/${APP}/next.config.js 已设置 output: 'standalone' 且已完成构建。`
  );
  process.exit(1);
}

// 从 server.js 解析运行时 distDir(相对 server.js 同级)，得到 static 的真实落点
const serverSrc = fs.readFileSync(serverJsPath, 'utf8');
const distDirMatch = serverSrc.match(/"distDir":"([^"]+)"/);
const distDirRel = distDirMatch ? distDirMatch[1] : './.next';
const runtimeDistDir = path.resolve(standaloneApp, distDirRel);

const srcStatic = path.join(distBase, '.next', 'static');
const dstStatic = path.join(runtimeDistDir, 'static');
const srcPublic = path.join('apps', APP, 'public');
const dstPublic = path.join(standaloneApp, 'public');

if (!fs.existsSync(srcStatic) || fs.readdirSync(srcStatic).length === 0) {
  console.error(`[assemble] .next/static 缺失或为空: ${srcStatic}`);
  process.exit(1);
}

fs.copySync(srcStatic, dstStatic);
if (fs.existsSync(srcPublic)) {
  fs.copySync(srcPublic, dstPublic);
}

console.log(`[assemble] env=${env}`);
console.log(`[assemble] static -> ${dstStatic}`);
console.log(`[assemble] public -> ${dstPublic}`);
