// 用于生成api代码
const { execSync,getApps } = require('./utils');

const apps = getApps()
const depPath = "apidoc/common-proto";
// import { webapi } from "@better-bit-fe/base-utils"
const apiName = 'webapi';
const apiPath = '@better-bit-fe/base-utils';
// url= apiPrefix + "/post/xxx"
const apiPrefix = ""
const output = "apps"

execSync(
  `gtd api -p ./apidoc -o ${output} --apiName=${apiName} --apiPath=${apiPath} --prefix=${apiPrefix} --depPath=${depPath} --apps ${apps.join(' ')} `
);
