# 本地 HTTPS（Passkey / WebAuthn 调试）

WebAuthn 要求**安全上下文**。本地默认的  
`http://dev.test.bitrunfinance.com:4200` **无法**弹出 Chrome 原生 Passkey 窗口。

本目录用 **mkcert + HTTPS 反代**，把流量转到本机 `nx serve` 端口，用 HTTPS 访问进行调试。  
供 `setting`（Passkey 注册/管理）与 `user-login`（Passkey 登录）共用。

---

## 前置条件

1. `/etc/hosts` 已配置（项目约定）：

   ```text
   127.0.0.1 dev.test.bitrunfinance.com
   ```

2. **不依赖 Homebrew**  
   当前部分 macOS 版本会导致 `brew` 报错（如 `unsupported macOS version`）。  
   `start.sh` 会自动从 GitHub 下载 `mkcert` 到 `bin/`，无需 `brew install mkcert`。

3. `setting` 与 `user-login` 默认都监听 **4200**，同一台机器一次只能 `nx serve` 其中一个。

---

## 日常操作（两步）

### 终端 A：启动目标 app（HTTP :4200）

```bash
cd /Users/awen/Documents/Project/EasiCoin/mini-mono-fe

# Passkey 注册 / 账户安全
pnpm nx serve setting

# 或 Passkey 登录
pnpm nx serve user-login
```

等到本地服务就绪（`http://dev.test.bitrunfinance.com:4200`）。

### 终端 B：启动 HTTPS 反代（默认 :8443）

```bash
cd /Users/awen/Documents/Project/EasiCoin/mini-mono-fe

# setting（账户安全 / Passkey 管理）
pnpm run dev:setting-https

# user-login（Passkey 登录）
pnpm run dev:user-login-https

# 或通用入口（可自行传环境变量）
APP_NAME=setting HINT_PATH=/zh-CN/account-safe/passkey pnpm run dev:https
```

首次运行会：

1. 下载 / 复用 `tools/dev-https/bin/mkcert`
2. 执行 `mkcert -install`（可能弹出**系统密码**框，输入本机登录密码）
3. 在 `certs/` 下签发域名证书
4. 用 `npx local-ssl-proxy`（或本机已安装的 Caddy）反代到 `4200`

---

## 浏览器访问

**必须用 HTTPS + 8443**，不要再用 `http://...:4200`：

```text
# setting
https://dev.test.bitrunfinance.com:8443/zh-CN/account-safe/passkey

# user-login
https://dev.test.bitrunfinance.com:8443/zh-CN/login
```

### 自检

打开 DevTools Console：

```js
location.origin
window.isSecureContext
```

期望：

| 项 | 期望值 |
|----|--------|
| `location.origin` | `https://dev.test.bitrunfinance.com:8443` |
| `window.isSecureContext` | `true` |

---

## 可选参数

| 环境变量 | 默认 | 说明 |
|----------|------|------|
| `HTTPS_PORT` | `8443` | HTTPS 监听端口（改用 443 时可能需要权限） |
| `HTTP_TARGET` | `4200` | 反代目标（nx serve 端口） |
| `HOST` | `dev.test.bitrunfinance.com` | 证书与访问域名 |
| `APP_NAME` | `app` | 提示文案中的 app 名 |
| `HINT_PATH` | `/` | 启动后建议打开的路径 |

示例：

```bash
HTTPS_PORT=9443 pnpm run dev:setting-https
APP_NAME=user-login HTTP_TARGET=4200 HINT_PATH=/en-US/login pnpm run dev:https
```

---

## 目录说明

```text
tools/dev-https/
├── README.md          # 本说明
├── Caddyfile          # Caddy 参考配置（默认 8443）
├── start.sh           # 一键：证书 + 反代
├── bin/               # mkcert 二进制（gitignore，自动下载）
└── certs/             # 证书与运行时配置（gitignore，不提交）
```

根目录脚本：

```bash
pnpm run dev:https              # 通用入口
pnpm run dev:setting-https      # setting 预设 HINT_PATH
pnpm run dev:user-login-https   # user-login 预设 HINT_PATH
```

---

## 常见问题

### 1. `brew install mkcert` 失败

可忽略。本方案**不需要** Homebrew。直接跑对应的 `pnpm run dev:*-https`。

### 2. 证书不被信任 / 浏览器红锁

```bash
./tools/dev-https/bin/mkcert -install
```

然后**完全退出并重启 Chrome**。

### 3. 8443 打不开 / 反代报错

- 确认终端 A 的 `pnpm nx serve <app>` 仍在运行
- 确认终端 B 的 HTTPS 脚本无报错退出
- 端口被占用时可换端口：`HTTPS_PORT=9443 pnpm run dev:setting-https`

### 4. 登录态 / Cookie 异常

http(:4200) 与 https(:8443) 属于不同 origin，Cookie 不互通。请在 **HTTPS 地址**下重新登录后再测 Passkey。

### 5. 从旧路径迁移

原先位于 `apps/setting/dev-https/`。证书/mkcert 缓存不会自动带走；首次在新路径运行会重新下载 mkcert 并签发证书（同一本机 CA，浏览器一般仍信任）。旧目录仅保留兼容跳转说明。

---

## 与测试环境对照

| 环境 | 访问地址 | `rp.id`（前端适配后） |
|------|----------|------------------------|
| 本地 HTTPS | `https://dev.test.bitrunfinance.com:8443` | `bitrunfinance.com` |
| Test | `https://www.test.bitrunfinance.com` | `bitrunfinance.com` |
| 生产 | `https://www.easicoin.io` 等 | `easicoin.io` |

若不方便配本地 HTTPS，也可直接在 Test 环境验证原生 Passkey 弹窗。

---

## 使用结束后恢复

在 Chrome 清除该域名的 HSTS：

打开 chrome://net-internals/#hsts → Delete domain security policies → 
输入 `dev.test.bitrunfinance.com` 并删除  
或用无痕窗口、换浏览器验证。
