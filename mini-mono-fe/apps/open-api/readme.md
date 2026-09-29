# open-api

## dev

具体查看根目录下的 Makefile

```bash
make dev app=open-api p=test-better-dex-1
```

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
├── store           // 全局状态的管理
├── styles          // styles 全局引用的css文件存放地方
├── project.json    // nx的配置文件
├── postcss.config  // 默认nx是支持的，但是这里装载了阿语的配置插件
├── next.config.js  // next的配置文件，环境变量、多语言环境都是从这里注入

```
