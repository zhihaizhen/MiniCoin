# academy

币圈学院（内容站），采用 **ISR（增量静态再生成）** 形态，以常驻 Node 进程运行，区别于其他 app 的「静态导出 + nginx」方案。

## dev

```bash
make dev app=academy p=test-better-dex-1
```

## 构建与部署

```bash
# 构建 standalone
make build-isr APP=academy ENV=production
# 组装运行目录（含 .next/static 与 public）
make package-isr APP=academy ENV=production
```

启动：

```bash
PORT=3000 HOSTNAME=0.0.0.0 ACADEMY_REVALIDATE_SECRET=<密钥> \
  node output/standalone/apps/academy/server.js
# 访问: http://localhost:3000/academy
```

> 运行时须配置 `ACADEMY_REVALIDATE_SECRET`，用于 `/api/revalidate` 按需刷新（webhook）。
> 网关需将 `/{locale}/academy/*` 反向代理到本服务。

## 目录说明

```bash
tree -L 1
.
├── api             // api的生成文件
├── components      // 公共组件代码
├── containers      // 各个page的代码
├── env             // 环境变量
├── hooks           // 各种hook
├── pages           // 各个页面路径
├── public          // 静态文件
├── styles          // styles 全局引用的css文件存放地方
├── project.json    // nx的配置文件
├── postcss.config  // 默认nx是支持的，但是这里装载了阿语的配置插件
├── next.config.js  // next的配置文件，环境变量、多语言环境都是从这里注入

```
