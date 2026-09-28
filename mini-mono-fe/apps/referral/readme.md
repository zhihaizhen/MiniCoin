# referral — 邀请好友

邀请好友返佣模块，支持邀请链接生成、返佣记录查看、邀请用户列表等功能。

## 页面地址

- 测试：https://www.test.bitrunfinance.com/zh-CN/referral
- 生产：https://www.bitrunfinance.com/zh-CN/referral

## PRD

[C端邀请返佣 + 邀请好友奖励活动](https://dsg77uuqhntz.sg.larksuite.com/wiki/Bu3mwNCrIiwpJmkqhuGlh179gAe)

## 主要功能

- 邀请链接生成与分享
- 邀请数据总览（邀请人数、返佣金额等）
- 邀请好友列表
- 返佣记录列表

## 本地开发

```bash
nx serve referral
```

## 构建发布

```bash
nx run referral:build && nx run referral:cexport
```
