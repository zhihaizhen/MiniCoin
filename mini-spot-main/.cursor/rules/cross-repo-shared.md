---
description: 编辑共享层/共享 UI 时,提醒跨三仓库(mini-trade/mini-spot/mini-cfdtrade)同步
globs: ["src/betterbitapps/common/**", "src/betterbitapps/forward/desktop/components/**", "src/betterbitapps/forward/desktop/containers/**"]
alwaysApply: false
---

# 跨三仓库共享文件提醒

你正在编辑的文件很可能在兄弟仓库 `../mini-trade`、`../mini-cfdtrade` 有近乎相同的副本(三者共享 `common/` 与部分 desktop UI)。改完别忘了同步。

## 收尾前必做

1. 走 **`trade-tri-repo-sync` 技能**完成同步(GitNexus 按符号定位等价代码 + 风险评估)。
2. 字节级兜底:`../tools/trade-sync.sh diff <相对路径>` 查看三方差异。
3. **禁止整文件 `cp` 覆盖**,只以 patch 方式搬运本次改动。
4. **保留各仓库业务差异**:localStorage 键前缀(`futures.*` / `spot.*` / `block.*`)、主题色、渲染写法、单位映射等。
5. 每个被改仓库分别 `yarn eslint <改动文件>`。

## 路径不是 1:1

兄弟仓库的等价文件路径/文件名可能不同(如 `chart/index.jsx` 在某仓库是 `Head.jsx`)。用 GitNexus `context`/`query` 按符号或概念定位,**不要靠路径硬猜**;确实无等价时跳过并说明。
