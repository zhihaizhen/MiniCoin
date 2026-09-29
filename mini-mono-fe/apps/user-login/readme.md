## 启动

绑定 host `127.0.0.1 dev.test.bitrunfinance.com`

1. `pnpm install`
2. 拉取多语言：`pnpm run lang`
3. 启动：`pnpm nx serve user-login`
4. 访问：`http://dev.test.bitrunfinance.com:4200/en-US/login`

### Passkey / WebAuthn 本地调试

WebAuthn 需要安全上下文，HTTP `:4200` 无法弹出原生 Passkey 窗口。另开终端启动 HTTPS 反代：

```bash
pnpm nx serve user-login          # 终端 A
pnpm run dev:user-login-https     # 终端 B
```

浏览器访问：

```text
https://dev.test.bitrunfinance.com:8443/zh-CN/login
```

说明见 [`tools/dev-https/README.md`](../../tools/dev-https/README.md)。

## 构建

`nx run user-login:build`

## 发布

`nx run user-login:build && nx run user-login:cexport`

