// 参考效能的方案，做了一些修改
import { execSync } from 'child_process';

const FgRed = '\x1b[31m';
const currentBranch = execSync('git rev-parse --abbrev-ref HEAD')
  .toString()
  .trim();

function error(err) {
  console.log(FgRed + '%s', err);
}

/**
 * 检查分支名是否符合规范
 * gitlab的服务器也做了限制，如果修改下面rule时，记得同时修改gitlab的rule规则
 */
const checkName = () => {
  const regExp = /^(?:feature|hotfix|chore|revert|testnet|test)\/[a-z0-9_-]+$/;
  const isInvalid = !regExp.test(currentBranch);
  if (isInvalid) {
    error('Error: 分支名不符合规范, ' + regExp.toString());
    process.exit(1);
  }
};

/**
 * 为了保证master代码的纯净，feature、hotfix的分支会检测是否有test、testnet的分支代码，其他分支不做检测
 * 检查分支里最近的 commit 是否包含意外的代码
 */
const checkRecentCommits = () => {
  const ignoredBranches = /^(?:revert|test).*/;
  if (ignoredBranches.test(currentBranch)) return;

  const messages = execSync('git log master.. -s --format=%s')
    .toString()
    .trim();

  let isInvalid = /Merge\sbranch\s'testnet/.test(messages);
  if (isInvalid) {
    error('Error: 该分支混入了testnet分支的代码');
    return process.exit(1);
  }

  isInvalid = /Merge\sbranch\s'test/.test(messages);
  if (isInvalid) {
    error('Error: 该分支混入了test分支的代码');
    return process.exit(1);
  }
};

const main = () => {
  checkName();
  checkRecentCommits();
};

main();
