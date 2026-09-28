#!/usr/bin/env bash
# 已迁移至仓库级 tools/dev-https/。本文件仅作兼容跳转，请改用：
#   pnpm run dev:setting-https
#   pnpm run dev:https
set -euo pipefail
echo "[dev-https] apps/setting/dev-https 已迁移到 tools/dev-https，正在转发..."
export APP_NAME="${APP_NAME:-setting}"
export HINT_PATH="${HINT_PATH:-/zh-CN/account-safe/passkey}"
exec bash "$(cd "$(dirname "$0")/../../.." && pwd)/tools/dev-https/start.sh" "$@"
