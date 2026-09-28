#!/usr/bin/env bash
# 本地 Passkey / WebAuthn 调试：通用 HTTPS 反代（mkcert + Caddy / local-ssl-proxy）
#
# 前置：
#   1. hosts: 127.0.0.1 dev.test.bitrunfinance.com
#   2. 另开终端启动目标 app：pnpm nx serve <app>
#   3. 本脚本：pnpm run dev:https / dev:setting-https / dev:user-login-https
#
# 环境变量：
#   HTTPS_PORT   默认 8443
#   HTTP_TARGET  默认 4200（nx serve 端口）
#   HOST         默认 dev.test.bitrunfinance.com
#   APP_NAME     提示用 app 名（setting / user-login）
#   HINT_PATH    启动后建议打开的路径
#
# 说明：不依赖 Homebrew。首次会自动下载 mkcert（darwin arm64/amd64）。

set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
HOST="${HOST:-dev.test.bitrunfinance.com}"
CERT_DIR="${ROOT}/certs"
BIN_DIR="${ROOT}/bin"
CERT_FILE="${CERT_DIR}/${HOST}.pem"
KEY_FILE="${CERT_DIR}/${HOST}-key.pem"
HTTPS_PORT="${HTTPS_PORT:-8443}"
HTTP_TARGET="${HTTP_TARGET:-4200}"
APP_NAME="${APP_NAME:-app}"
HINT_PATH="${HINT_PATH:-/}"
MKCERT_VERSION="v1.4.4"

echo "[dev-https] app=${APP_NAME} host=${HOST} https=:${HTTPS_PORT} → http://127.0.0.1:${HTTP_TARGET}"

resolve_mkcert() {
  if [[ -x "${BIN_DIR}/mkcert" ]]; then
    echo "${BIN_DIR}/mkcert"
    return
  fi
  if command -v mkcert >/dev/null 2>&1; then
    command -v mkcert
    return
  fi

  local arch
  arch="$(uname -m)"
  local asset=""
  case "${arch}" in
    arm64|aarch64) asset="mkcert-${MKCERT_VERSION}-darwin-arm64" ;;
    x86_64) asset="mkcert-${MKCERT_VERSION}-darwin-amd64" ;;
    *)
      echo "[dev-https] 不支持的架构: ${arch}"
      exit 1
      ;;
  esac

  mkdir -p "${BIN_DIR}"
  local url="https://github.com/FiloSottile/mkcert/releases/download/${MKCERT_VERSION}/${asset}"
  echo "[dev-https] 未找到 mkcert，正在下载（无需 Homebrew）..."
  echo "  ${url}"
  curl -fsSL -o "${BIN_DIR}/mkcert" "${url}"
  chmod +x "${BIN_DIR}/mkcert"
  echo "${BIN_DIR}/mkcert"
}

MKCERT_BIN="$(resolve_mkcert)"
echo "[dev-https] mkcert: ${MKCERT_BIN} ($("${MKCERT_BIN}" -version 2>/dev/null || true))"

# 将本地 CA 装进系统信任（首次会弹密码框；已安装则很快结束）
echo "[dev-https] 安装本地 CA（如弹出系统密码请输入）..."
"${MKCERT_BIN}" -install

mkdir -p "${CERT_DIR}"

if [[ ! -f "${CERT_FILE}" || ! -f "${KEY_FILE}" ]]; then
  echo "[dev-https] 签发本地证书 → ${CERT_DIR}"
  (
    cd "${CERT_DIR}"
    "${MKCERT_BIN}" "${HOST}"
  )
else
  echo "[dev-https] 复用已有证书：${CERT_FILE}"
fi

if ! grep -qE "[[:space:]]${HOST}([[:space:]]|$)" /etc/hosts 2>/dev/null; then
  echo "[dev-https] 警告: /etc/hosts 中未找到 ${HOST}"
  echo "  请添加: 127.0.0.1 ${HOST}"
fi

if ! nc -z 127.0.0.1 "${HTTP_TARGET}" >/dev/null 2>&1; then
  echo "[dev-https] 警告: 127.0.0.1:${HTTP_TARGET} 无服务，请先在另一终端执行："
  echo "  pnpm nx serve ${APP_NAME}"
fi

echo "[dev-https] 请用浏览器打开: https://${HOST}:${HTTPS_PORT}${HINT_PATH}"
echo "[dev-https] 确认 window.isSecureContext === true 后再测 Passkey / WebAuthn"
echo ""

if command -v caddy >/dev/null 2>&1; then
  RUNTIME_CADDY="${CERT_DIR}/Caddyfile.runtime"
  cat > "${RUNTIME_CADDY}" <<EOF
{
	auto_https disable_redirects
}

${HOST}:${HTTPS_PORT} {
	tls ${CERT_FILE} ${KEY_FILE}
	reverse_proxy 127.0.0.1:${HTTP_TARGET}
}
EOF
  echo "[dev-https] 使用 Caddy 启动..."
  exec caddy run --config "${RUNTIME_CADDY}" --adapter caddyfile
fi

echo "[dev-https] 使用 npx local-ssl-proxy 启动（无需 Caddy）..."
exec npx --yes local-ssl-proxy \
  --source "${HTTPS_PORT}" \
  --target "${HTTP_TARGET}" \
  --cert "${CERT_FILE}" \
  --key "${KEY_FILE}"
