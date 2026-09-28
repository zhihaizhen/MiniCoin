# mini-mono-fe

Nx monorepo frontend. Agent guidance for engineering skills lives below.

## 标准开发入口

按场景二选一（不要混用硬闸门规则）：

| 入口 | 适用 | 口令示例 |
|------|------|----------|
| **`mono-ship`** | 有需求文档 / Figma / 接口的完整功能交付：Plan 硬闸门 → 实现 → 验证 → 两段式沉淀 | `按 mono-ship 做：……` / `按交付流程做：……` / `需求交付：……` |
| **`mono-dev`** | 日常小改、Bug、无完整文档的默认闭环：场景选型 → grill（可选）→ Plan → Search-First → 实现 → Verify → CR | `按 mono-dev 做：……` / `按最终流程做：……` |

Skill 路径：

- Cursor：`.cursor/skills/mono-ship/SKILL.md`、`.cursor/skills/mono-dev/SKILL.md`
- Claude：`.claude/skills/mono-ship/SKILL.md`、`.claude/skills/mono-dev/SKILL.md`

需要工单时：对齐后走 `to-tickets` / `implement`（见 `docs/agents/`）。

## Agent skills

### Issue tracker

Issues live in this repo's GitLab Issues (via `glab`). See `docs/agents/issue-tracker.md`.

### Triage labels

Default roles: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: root `CONTEXT.md` + `docs/adr/`. See `docs/agents/domain.md`.
