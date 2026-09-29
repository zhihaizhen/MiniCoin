---
description: Cursor 生成的规划（plan）文件存放与清理约定
alwaysApply: true
---

# 规划文件（Plan）存放约定

## 存放目录

Cursor 生成的所有规划文档统一放在工作区的 `.cursor/plans/` 目录，禁止散落在仓库其他位置或全局 `~/.cursor/plans/`。

- 命名遵循现有约定：`<简短标题>_<hash>.plan.md`，例如 `现货计划委托与止盈止损对接_1508c218.plan.md`。
- 若 `CreatePlan` / 规划技能默认生成到全局 `~/.cursor/plans/`，需移动（或确认已移动）到本工作区的 `.cursor/plans/`。

## 定期清理

每周清理一次 `.cursor/plans/`：

- 删除已完成、已合并或废弃的 plan，仅保留进行中或近期需复用的规划。
- 不确定是否仍需要时，先与用户确认再删除。
