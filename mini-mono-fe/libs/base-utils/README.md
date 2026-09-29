# utils 共通函数库

为了提高代码的复用性，降低新项目的复杂度，大家可以把一些共通性比较大的函数做成共通函数

## 生成 doc 文档

为了更好的为他人所有，utils 库的所有的代码都会用 [typedoc.js](https://typedoc.org/) 生成，方便在线浏览

以下为代码生成的命令

```bash
./node_modules/.bin/typedoc --tsconfig libs/utils/tsconfig.lib.json --out libs/utils/docs libs/utils/src/index.ts
```

## 文件的一些说明

- libs/utils/src/lib/config.ts 关于环境变量的一些信息
- libs/utils/src/lib/auth.ts 关于个人信息获取
- libs/utils/src/lib/broser.ts 浏览器的一些基础信息
- libs/utils/src/lib/date.ts 时间处理相关，基于 dayjs
- libs/utils/src/lib/amount.ts 和各种金融金额相关的数字处理
- libs/utils/src/lib/webapi 和 webapi 相关的代码，所有请求都可以基于这个来定制

## 使用方式，只需要两步

1. 在 apps 项目内，配置 tsconfig.json 的 paths，比如 "@better-bit-fe/utils": ["libs/utils/src/index.ts"]
2. 代码直接引用 import { ENV } from "@better-bit-fe/utils"
