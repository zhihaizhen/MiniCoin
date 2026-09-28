# Trading Challenges 动态路由改造说明

## 改造概述

将 trading-challenges 项目从基于 URL query 参数的动态加载方式改造为基于动态路由的静态预渲染方式。

## 主要变更

### 1. API 接口新增

**文件**: `api/index.ts`

- 新增 `getCampaignList()` 接口，用于获取所有交易挑战活动列表
- 接口地址: `/rewards/public/v1/challenge/campaign/get-campaign-list`
- 返回数据格式:
  ```typescript
  {
    data: [
      {
        campaign_no: '2937670933',
        campaign_path: 'trading-challenge2'
      },
      {
        campaign_no: '2779588228',
        campaign_path: 'trading-challenge1'
      }
    ];
  }
  ```

### 2. 类型定义新增

**文件**: `types/api.d.ts`

```typescript
export interface CampaignItem {
  campaign_no: string;
  campaign_path: string;
}

export interface CampaignListResponse {
  data: CampaignItem[];
}
```

### 3. 动态路由页面

**文件**: `pages/[campaign_path].tsx`

- 新建动态路由页面，替代原有的通过 query 参数获取 campaign_no 的方式
- 实现 `getStaticPaths`: 在构建时调用 `getCampaignList` 接口获取所有 campaign_path，为每个路径生成静态页面
- 实现 `getStaticProps`: 根据 campaign_path 查找对应的 campaign_no，并通过 props 传递给组件
- 配置 `fallback: false`，确保只生成后端返回的有效路径

### 4. Context 改造

**文件**: `context/CampaignContext.tsx`

- 修改 `CampaignProvider` 接收 `campaignNo` 作为必需的 props
- 移除从 `router.query` 中获取 `campaign_no` 的逻辑
- 改为直接使用传入的 `campaignNo` props

### 5. 兼容性处理

**文件**: `pages/index.tsx`

- 保留原有的 index 页面作为兼容方案
- 支持通过 `?campaign_no=xxx` 的方式访问（兼容旧链接）
- 如果没有任何参数，使用第一个有效的 campaign 作为兜底

## 访问方式

### 新的访问方式（推荐）

通过 campaign_path 直接访问：

```
https://www.test.bitrunfinance.com/zh-CN/activity-hub/trading-challenge1/
https://www.test.bitrunfinance.com/zh-CN/activity-hub/trading-challenge2/
https://www.test.bitrunfinance.com/en-US/activity-hub/trading-challenge1/
```

### 旧的访问方式（兼容）

通过 query 参数访问：

```
https://www.test.bitrunfinance.com/zh-CN/activity-hub/trading-challenges/?campaign_no=2779588228
```

## 构建流程

### 构建时发生的事情

1. **getStaticPaths 阶段**:

   - 调用 `/rewards/public/v1/challenge/campaign/get-campaign-list` 接口
   - 获取所有有效的 campaign_path
   - 为每个 campaign_path 和每个语言生成路径组合
   - 例如: `[{params: {campaign_path: 'trading-challenge1'}, locale: 'zh-CN'}, ...]`

2. **getStaticProps 阶段**:

   - 对每个路径，再次调用 campaign list 接口
   - 根据 campaign_path 查找对应的 campaign_no
   - 加载多语言文件
   - 将 campaign_no 作为 props 传递给页面组件

3. **生成静态文件**:
   - 每个语言和 campaign_path 组合都会生成独立的 HTML 文件
   - 例如: `zh-CN/activity-hub/trading-challenge1/index.html`

### 本地开发

```bash
# 启动开发服务器
nx serve trading-challenges

# 测试构建
nx run trading-challenges:build --configuration=test
```

### 部署

```bash
# 构建测试环境
nx run trading-challenges:build --configuration=test

# 构建生产环境
nx run trading-challenges:build --configuration=production

# 导出静态文件
nx run trading-challenges:cexport
```

## 注意事项

1. **fallback: false**:

   - 只有后端返回的 campaign_path 才会生成对应的页面
   - 访问不存在的路径会返回 404
   - 如果需要添加新的活动，需要重新构建部署

2. **构建时的 API 调用**:

   - getStaticPaths 和 getStaticProps 在构建时执行
   - 需要确保构建环境能够访问后端 API
   - API_HOST 由 @region-lib/env 自动处理

3. **多语言支持**:

   - 当前支持 14 种语言
   - 每个语言都会为所有 campaign_path 生成独立页面
   - 语言列表: zh-CN, zh-TW, en-US, vi-VN, ko-KR, ja-JP, th-TH, id-ID, pt-BR, es-ES, tr-TR, fr-FR, de-DE, ru-RU

4. **缓存策略**:
   - 静态生成的页面可以充分利用 CDN 缓存
   - 如果活动数据更新，需要重新构建部署

## 测试清单

- [ ] 测试环境构建成功
- [ ] 可以通过 `/zh-CN/activity-hub/trading-challenge1/` 访问第一期活动
- [ ] 可以通过 `/zh-CN/activity-hub/trading-challenge2/` 访问第二期活动
- [ ] 页面能正确读取到对应的 campaign_no
- [ ] 多语言切换正常工作
- [ ] 旧链接（带 campaign_no query 参数）仍能正常访问
- [ ] 活动报名、领奖等功能正常
- [ ] 生产环境构建和部署成功

## 回滚方案

如果遇到问题，可以使用 git revert 回退到改造前的版本：

```bash
git log -- apps/trading-challenges/
git revert <commit-hash>
```

## 相关文件清单

```
apps/trading-challenges/
├── api/
│   └── index.ts                          # 新增 getCampaignList 接口
├── context/
│   └── CampaignContext.tsx               # 修改：从 props 获取 campaign_no
├── pages/
│   ├── index.tsx                         # 修改：兼容旧方式访问
│   ├── [campaign_path].tsx               # 新增：动态路由页面
│   └── [campaign_path].module.less       # 新增：样式文件
├── types/
│   └── api.d.ts                          # 新增：CampaignItem 和 CampaignListResponse 类型
└── MIGRATION.md                          # 本文档
```
