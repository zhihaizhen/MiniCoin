# 已迁移

本目录的 HTTPS 调试工具已抽到仓库级：

**[`tools/dev-https/`](../../../tools/dev-https/README.md)**

请改用：

```bash
pnpm run dev:setting-https
# 或通用
pnpm run dev:https
```

`start.sh` 仍保留为兼容跳转，会转发到 `tools/dev-https/start.sh`。
