# API Hooks 使用说明

本文档说明如何使用 `apiHooks.ts` 中定义的所有 API hooks。

## 📦 导入方式

```tsx
// 从统一入口导入
import { useCampaignDetailsPublic, useDepositList } from '~/hooks';
```

## 📋 查询类 Hooks（自动请求）

这些 hooks 会在组件挂载时自动发起请求。

### 1. useCampaignDetailsPublic
获取活动详情（公开，无需登录）

```tsx
function CampaignPage() {
  const { data: campaignDetail, loading, error, refresh } = useCampaignDetailsPublic();

  if (loading) return <Loading />;
  if (error) return <Error />;

  return (
    <div>
      <h1>{campaignDetail?.campaign_name}</h1>
      <Button onClick={refresh}>刷新</Button>
    </div>
  );
}
```

### 2. useCampaignDetailsPrivate
获取活动详情（登录态，包含用户特定信息）

```tsx
function UserCampaignPage() {
  const { data: campaignDetail, loading } = useCampaignDetailsPrivate();

  return <CampaignCard data={campaignDetail} loading={loading} />;
}
```

### 3. useDepositList
获取用户充值列表（用于跑马灯等展示）

```tsx
function DepositCarousel() {
  const { data: depositList, loading } = useDepositList();

  return (
    <Marquee>
      {depositList.map(item => (
        <div key={item.user_id}>
          用户 {item.user_id} 充值 {item.amount} USDT
        </div>
      ))}
    </Marquee>
  );
}
```

### 4. useTaskInfo
获取用户任务信息

```tsx
function TaskList() {
  const { data: taskInfo, loading, refresh } = useTaskInfo();

  return (
    <div>
      {taskInfo.map(task => (
        <TaskCard
          key={task.task_id}
          taskName={task.campaign_name}
          status={task.task_status}
          progress={task.process_bar}
        />
      ))}
      <Button onClick={refresh}>刷新任务</Button>
    </div>
  );
}
```

### 5. useCashbackRecords
获取用户返现记录（支持分页）

```tsx
function CashbackHistory() {
  const { data: records, loading, run } = useCashbackRecords();

  const handlePageChange = (page: number) => {
    run({ page_num: page, page_size: 50 });
  };

  return (
    <Table
      data={records}
      loading={loading}
      onPageChange={handlePageChange}
    />
  );
}
```

### 6. useAwardRecords
获取领取奖励记录（支持分页）

```tsx
function AwardHistory() {
  const { data: awardRecords, loading, run } = useAwardRecords();

  return (
    <div>
      {awardRecords.map(record => (
        <div key={record.id}>
          {record.award_name} - {record.award_type}
        </div>
      ))}
    </div>
  );
}
```

### 7. useAffiliateLineInfo
获取用户联盟线验证信息

```tsx
function AffiliatePage() {
  const { data: affiliateInfo, loading } = useAffiliateLineInfo();

  return (
    <div>
      验证状态: {affiliateInfo?.is_verified ? '已验证' : '未验证'}
    </div>
  );
}
```

## 🔧 操作类 Hooks（手动触发）

这些 hooks 不会自动请求，需要手动调用 `run` 方法。

### 1. useUserRegister
用户报名活动

```tsx
function RegisterButton() {
  const { run: register, loading } = useUserRegister({
    onSuccess: () => {
      message.success('报名成功！');
      // 可以在这里刷新其他数据
    },
    onError: (err) => {
      message.error('报名失败：' + err.message);
    }
  });

  return (
    <Button onClick={register} loading={loading}>
      立即报名
    </Button>
  );
}
```

### 2. useReceiveAward
领取奖励

```tsx
function AwardCard({ taskId, awardId }) {
  const { run: receiveAward, loading } = useReceiveAward({
    onSuccess: () => {
      message.success('领取成功！');
    }
  });

  const handleReceive = () => {
    receiveAward({ task_id: taskId, award_id: awardId });
  };

  return (
    <Button onClick={handleReceive} loading={loading}>
      领取奖励
    </Button>
  );
}
```

### 3. useReceivePhysicalAward
领取实物奖励（需要填写地址信息）

```tsx
function PhysicalAwardForm() {
  const { run: receiveAward, loading } = useReceivePhysicalAward({
    onSuccess: () => {
      message.success('提交成功，请等待发货');
    }
  });

  const handleSubmit = (values) => {
    receiveAward({
      address: values.address,
      phone: values.phone,
      name: values.name
    });
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Input name="name" placeholder="收货人姓名" />
      <Input name="phone" placeholder="联系电话" />
      <TextArea name="address" placeholder="收货地址" />
      <Button htmlType="submit" loading={loading}>
        提交
      </Button>
    </Form>
  );
}
```

## 🔄 高级用法

### 依赖更新

当某些参数变化时自动重新请求：

```tsx
function UserTasksPage({ userId }) {
  const { data: tasks, loading } = useTaskInfo({
    deps: [userId] // userId 变化时重新请求
  });

  return <TaskList tasks={tasks} />;
}
```

### 组合使用

```tsx
function CampaignDetailPage() {
  // 获取活动详情
  const { data: campaign, loading: campaignLoading } = useCampaignDetailsPrivate();
  
  // 获取任务信息
  const { data: tasks, loading: tasksLoading, refresh: refreshTasks } = useTaskInfo();
  
  // 报名活动
  const { run: register, loading: registering } = useUserRegister({
    onSuccess: () => {
      message.success('报名成功');
      refreshTasks(); // 报名成功后刷新任务列表
    }
  });

  if (campaignLoading) return <Loading />;

  return (
    <div>
      <CampaignHeader data={campaign} />
      <TaskList data={tasks} loading={tasksLoading} />
      <Button onClick={register} loading={registering}>
        立即报名
      </Button>
    </div>
  );
}
```

### 手动刷新数据

```tsx
function DataPanel() {
  const { data: deposits, refresh: refreshDeposits } = useDepositList();
  const { data: tasks, refresh: refreshTasks } = useTaskInfo();

  const refreshAll = () => {
    refreshDeposits();
    refreshTasks();
  };

  return (
    <div>
      <Button onClick={refreshAll}>刷新所有数据</Button>
      <DepositList data={deposits} />
      <TaskList data={tasks} />
    </div>
  );
}
```

## 📝 兼容性说明

为了保持向后兼容，提供了旧命名的别名：

```tsx
// ⚠️ 已废弃，建议使用新命名
useDepositData      → useDepositList
useUserCashbackRecord → useCashbackRecords
```

**建议：** 新代码使用新命名，旧代码逐步迁移。

## 🎯 最佳实践

1. **命名规范**：使用语义化的变量名
   ```tsx
   // ✅ 推荐
   const { data: campaignDetail } = useCampaignDetailsPublic();
   
   // ❌ 不推荐
   const { data } = useCampaignDetailsPublic();
   ```

2. **错误处理**：使用 onError 统一处理错误
   ```tsx
   const { run } = useUserRegister({
     onError: (err) => {
       message.error(err.message);
       // 上报错误日志等
     }
   });
   ```

3. **加载状态**：合理显示加载状态
   ```tsx
   const { data, loading } = useTaskInfo();
   
   if (loading) return <Skeleton />;
   return <TaskList data={data} />;
   ```

4. **数据刷新**：合理使用 refresh 和 run
   ```tsx
   // refresh: 使用上次的参数重新请求
   refresh();
   
   // run: 使用新参数请求
   run({ page_num: 2 });
   ```

## 📚 完整 API 列表

### 查询类（自动请求）
- `useCampaignDetailsPublic()` - 活动详情（公开）
- `useCampaignDetailsPrivate()` - 活动详情（登录态）
- `useDepositList()` - 用户充值列表
- `useTaskInfo()` - 用户任务信息
- `useCashbackRecords()` - 用户返现记录
- `useAwardRecords()` - 领取奖励记录
- `useAffiliateLineInfo()` - 联盟线验证信息

### 操作类（手动触发）
- `useUserRegister()` - 用户报名
- `useReceiveAward()` - 领取奖励
- `useReceivePhysicalAward()` - 领取实物奖励

### 兼容别名（已废弃）
- `useDepositData()` → `useDepositList()`
- `useUserCashbackRecord()` → `useCashbackRecords()`

