---
description: mini-trade 项目通用编码规范，适用于所有文件
globs: ["**/*.js", "**/*.jsx", "**/*.ts", "**/*.tsx", "**/*.less"]
alwaysApply: true
---

# 通用编码规范

## 路径别名（必须使用，禁止相对路径跨层引用）

```js
// ✅ 正确
import { formatPrice } from 'common/utils/price';
import { usePositionStore } from '@/store-hooks/position';

// ❌ 禁止（超过 2 层的相对路径）
import { formatPrice } from '../../../../common/utils/price';
```

别名映射规则：
- `common/*` → `src/betterbitapps/common/*`
- `@/*` → `src/betterbitapps/forward/desktop/*`（仅在 desktop 子项目中）
- `@@/*` → `src/.marvel/*`

## 文件命名规范

| 类型 | 命名方式 | 示例 |
|------|----------|------|
| React 组件 | PascalCase | `OrderPanel.jsx` |
| Hook | camelCase，use 前缀 | `useOrderBook.js` |
| 工具函数 | camelCase | `formatAmount.js` |
| 常量文件 | camelCase | `tradeTypes.js` |
| Less 样式 | 与组件同名 + `.module.less` | `OrderPanel.module.less` |
| Store | camelCase + `.store.js` | `position.store.js` |
| Service | camelCase + `.service.js/ts` | `order.service.ts` |

## 代码格式

- 缩进：**2 空格**（遵循 `.editorconfig`）
- 换行符：**LF**
- 编码：**UTF-8**
- 行尾不留空格
- 文件末尾保留一个空行

## import 顺序（`import/order` 规则）

```js
// 1. React 核心
import React, { useState, useEffect } from 'react';

// 2. 第三方库
import { Button, Modal } from 'antd';
import classNames from 'classnames';

// 3. 内部别名路径
import { useGlobalState } from '@/store';
import { formatPrice } from 'common/utils/price';

// 4. 相对路径（同层或子层）
import OrderInput from './OrderInput';

// 5. 样式文件（必须放最后）
import styles from './OrderPanel.module.less';
```

## Less 样式规范

### 新增样式文件必须模块化

```
// ❌ 禁止：全局样式文件（会污染全局命名空间）
OrderPanel.less

// ✅ 必须：CSS Modules 格式
OrderPanel.module.less
```

在 JSX 中通过 `styles` 对象引用：

```jsx
import styles from './OrderPanel.module.less';

// ✅ 正确
<div className={styles.container}>
  <span className={styles.priceLabel}>...</span>
</div>

// 多个类名使用 classNames 组合
import classNames from 'classnames';
<div className={classNames(styles.item, isActive && styles.active)} />
```

### className 命名：简约语义化

命名应**清晰表达元素的职责**，不描述视觉样式，使用 camelCase：

```jsx
// ❌ 禁止：描述视觉的命名
<div className={styles.redText} />
<div className={styles.bigBoldTitle} />
<div className={styles.marginTop20} />
<div className={styles.div1} />

// ✅ 正确：语义化命名
<div className={styles.header} />
<div className={styles.priceLabel} />
<div className={styles.submitBtn} />
<div className={styles.orderList} />
<div className={styles.emptyTip} />

// ✅ 状态修饰用形容词后缀
<div className={classNames(styles.item, { [styles.itemActive]: isActive })} />
<div className={classNames(styles.btn, { [styles.btnDisabled]: disabled })} />
```

## JavaScript / TypeScript

- 优先使用 `const`，需要重新赋值才用 `let`，禁止 `var`
- 函数优先使用箭头函数（React 组件除外，用 `function` 声明便于 DevTools 识别）
- 异步操作优先使用 `async/await`，避免回调地狱
- 新文件优先使用 TypeScript（`.ts/.tsx`），遗留 `.jsx` 文件按需渐进式添加类型

## ESLint 合规（新增/修改代码必须遵守）

实现功能时，**不得引入 ESLint error 级别的违规**；写完改动后应对本次修改的文件执行 lint 检查。

```bash
yarn eslint path/to/changed-file.jsx
```

### 常见 error 级规则

| 规则 | 要求 | 示例 |
|------|------|------|
| `eqeqeq` | 比较必须用 `===` / `!==`，禁止 `==` / `!=` | `item.res === res` ✅ / `item.res == res` ❌ |
| `no-redeclare` | 禁止重复声明同名变量 | |
| `import/no-mutable-exports` | 禁止 export 可变绑定 | |

```js
// ❌ eqeqeq 违规
ALL_RESOLUTION_OPTIONS.find((item) => item.res == res);
if (currentStatus?.resolution == 'Time') { ... }

// ✅ 正确
ALL_RESOLUTION_OPTIONS.find((item) => item.res === res);
if (currentStatus?.resolution === 'Time') { ... }
```

> 遗留代码中可能仍存在 `==`，**新写或同步的代码一律使用 `===`**，不要延续旧写法。

## 注释规范

- 仅在**非显而易见的业务逻辑**处添加注释
- 解释"为什么"而非"是什么"
- TODO 格式：`// TODO(模块名): 描述内容`
- 禁止提交已注释掉的废弃代码（用 git 管理历史）

## 提交规范

使用 Conventional Commits，通过 `yarn commit` 触发：

```
feat(orderCreate): 新增条件单类型切换
fix(chart): 修复全屏模式下指标面板闪烁
refactor(position): 优化持仓列表虚拟滚动
perf(orderBook): 减少订单簿更新频率
chore(deps): 升级 ahooks 到 3.x
```

## 禁止项

- 禁止在业务代码中使用 `console.log`（使用项目封装的日志工具或 Sentry）
- 禁止直接操作 `localStorage`（必须通过 `global-settings/localStorageSettings.js` 管理键名）
- 禁止使用 `any` 类型（TypeScript 文件中，确实无法确定时使用 `unknown`）
- 禁止在组件内直接调用 REST API（必须通过 `services/` 层）
