# 项目介绍

> 前端 monorepo
> package: pnpm
> monorepo: Nx
> UI: React
> SSR: Nextjs


## 创建一个新项目

pnpm run gen-app  （如有nodejs版本问题，参考https://dsg77uuqhntz.sg.larksuite.com/wiki/JCNDwEujmieVdAkGdNmlvXP3gMg）

## 启动

绑定 host 127.0.0.1 dev.test.bitrunfinance.com
step1: pnpm install
step2: 从仓库拉下多语言 pnpm run lang
setp3: 启动项目 nx serve 项目名，如 nx serve home-page

## 构建

nx run home-page:build

## 发布

如 nx run home-page:build && nx run home-page:cexport

## 重要文件说明

### 全局关键代码

1. 多语言拉取文件 libs/lang/.script/sync-weblate.js
2. 语言配置文件 config/locales.js
3. 多语言 hooks libs/base-hooks/src/useFm.ts

### 项目结构

具体的项目请参考，项目下的 readme.md

```text
+ .husky // Husky 配置，目前没有用到
+ .storybook //
+ .vscode // 项目级 VSCode 配置
+ apps （没有在下面目录写注释的的，就是用不到的）
  + - agent-management // 代理商管理
  + - home-page // 首页项目
    + - .script // 静态文件
    + - api // 定义接口
    + - components // 公共组件
    + - context //
    + - env // 环境相关
    + - hooks // Hooks
    + - pages // 前端页面（包含主入口文件，注意：每一个文件夹代表一个新的页面路由）
    + - public // 静态资源
    + - utils // 工具函数
    + - next.config.js // next的配置文件，环境变量、多语言环境都是从这里注入
    + -postcss.config  // 默认nx是支持的，但是这里装载了阿语的配置插件
    + - package.json // 项目清单
    + - project.json // nx的配置文件，如开发、构建、发布的配置
    + - proxy.config.json // 本地开发的配置文件，如代理
  + - invite // 邀请好友
  + - login-affiliate // 代理商登录
  + - market // 行情项目
  + - setting // 设置项目
  + - user-login // 登录注册项目
+ configs // 全局配置文件
+ libs // 常用lib
  + - app-generator // 生成新项目
  + - base-hooks  // 公用hook，如useFm.
  + - base-provider  // 公用provider, 如useUserInfo
  + - base-ui  // 公用UI， 如Layout
  + - base-utils // 公用工具，常用的都有，不需要自己写
  + - global-widget // 头部header
  + - lang  // 多语言
  + - ws-service  //  ws
+ tools  // 生成新项目用的模版
+ workspace.json


## git commit message

commit message 的基础格式会使用 [commitlint](https://github.com/conventional-changelog/commitlint) 进行校验，但内容无法精准校验，需要人为遵循规范。

- 基础格式
  - `<type>(<scope>): <subject>`，如：`feat(utils): add decrypt`
- type（必需）
  - feat：新功能开发
  - fix：bug 修复
  - refactor：对代码进行重构
  - perf：性能优化
  - docs：文档、注释相关更新
  - chore：辅助工具变动 比如 script、配置文件、husk
  - build: ci、cd 相关代码
  - revert：代码回退
- scope（可选，但最好填上）
  - 用于说明 commit 影响的范围，以所属模块为依据，如：wsot2022、app-bridge 等
- subject（必需）
  - **要**以动词开头，如：修改 xx、修复 xx、完成 xx、重构 xx、change xx、add xx、delete xx
  - **不要**包含多个独立的内容，如：`修复xx & 新增xx & 重构xx`
  - 结尾**不要**加句号、逗号、分号等不必要的符号

## git 分支规范
- 检测当前分支的命名是否符合规范
- 检测分支内是否有 test、testnet 分之的合并

- 分类

  - master: 正式环境的分支(只有 feature、hotfix 分之才能合并进 master)
  - feature: 新功能的分支，以新功能模块为基准创建
  - hotfix: 修复生产环境问题的分支
  - chore: 一些非业务功能性的代码，更多是测试、基建修改的代码
  - test && test/xx: 各个测试环境的分支
  - revert: 回退代码的分支

- 命名规范（只允许小写字母、数字、下划线、中划线）
  - feature: feature/功能，如：feature/xx
  - hotfix: hotfix/功能，如：hotfix/ui
  - chore: chore/xx
  - test: testnet/xx: 与各个正在运行的测试环境相对应
  - test: test/xx: 与各个正在运行的测试环境相对应
  - revert: revert/commitId，如：revert/xx
```

## 公共 Request 模块使用说明

公共 Request 模块已经抽取到 `@better-bit-fe/base-utils` 中，统一管理所有项目的 HTTP 请求配置和错误处理。所有 apps 子项目现在都直接从 `@better-bit-fe/base-utils` 中引用各自的 request 实例，无需通过中间层。

## 可用的请求实例

### 1. 默认请求实例

```typescript
import { request, fetch } from '@better-bit-fe/base-utils';
```

- 基础配置，无特殊错误码过滤
- 无语言头
- 无 i18n 错误处理

### 2. 带语言头的请求实例

```typescript
import { requestWithLang } from '@better-bit-fe/base-utils';
```

- 自动添加 `Lang` 请求头
- 其他配置与默认实例相同

### 3. 带 i18n 错误处理的请求实例

```typescript
import { requestWithI18n } from '@better-bit-fe/base-utils';
```

- 自动添加 `Lang` 请求头
- 启用 i18n 错误消息处理
- 使用 TMS 配置的错误消息

### 4. 登录相关请求实例

```typescript
import { loginRequest } from '@better-bit-fe/base-utils';
```

- 自动添加 `Lang` 请求头
- 启用 i18n 错误消息处理
- 过滤登录相关错误码：`[20007009, 20007004, 20005001, 20000103, 20007010, 20005011]`

### 5. 设置相关请求实例

```typescript
import { settingRequest } from '@better-bit-fe/base-utils';
```

- 自动添加 `Lang` 请求头
- 启用 i18n 错误消息处理
- 过滤设置相关错误码：`[20007009, 20007004, 20005001, 20005011]`

### 6. loginAffiliate相关请求实例

```typescript
import { loginAffiliateRequest } from '@better-bit-fe/base-utils';
```

- 无语言头
- 启用 i18n 错误消息处理
- 过滤loginAffiliate相关错误码：`[20007009, 20007004, 20005001, 20000103, 20007010]`

## 自定义请求实例

如果需要创建自定义配置的请求实例：

```typescript
import { createRequestInstance } from '@better-bit-fe/base-utils';

const customRequest = createRequestInstance({
  showErrorMessage: true,
  noErrorMsgCodes: [20007009, 20005001], // 自定义错误码过滤
  enableLangHeader: true,
  enableI18nError: true
});

export const request = customRequest.request;
export const fetch = customRequest.fetch;
```

## 工具函数

### isUnLogin

```typescript
import { isUnLogin } from '@better-bit-fe/base-utils';

// 判断是否为未登录错误码
const isUnLoginError = isUnLogin(26200007); // true
```

## 配置选项说明

### RequestConfig 接口

```typescript
interface RequestConfig {
  showErrorMessage?: boolean; // 是否显示错误消息，默认 true
  noErrorMsgCodes?: number[]; // 不显示错误消息的错误码数组
  enableLangHeader?: boolean; // 是否启用语言头，默认 false
  enableI18nError?: boolean; // 是否启用 i18n 错误处理，默认 false
}
```

### 代码结构优化

- ✅ **直接引用**: 所有项目直接从@better-bit-fe/base-utils 引用
- ✅ **统一管理**: 所有 request 配置集中在 base-utils 中

### 维护性提升

- ✅ **文档完善**: 详细的使用说明和迁移指南

## 注意事项

1. 所有项目现在都使用统一的请求配置
2. 错误处理逻辑已经标准化
3. 如果需要特殊配置，可以使用 `createRequestInstance` 创建自定义实例
4. 原有的 `fetch` 导出保持兼容性
5. **重要**: 各项目现在直接从 base-utils 引用，无需通过 utils/request.ts 中间层
