# Empty 空状态组件

全局空状态展示组件，支持大/小图标、标题/副标题/描述文字、一级和三级操作按钮。

## 引入

```tsx
import { Empty } from '@better-bit-fe/base-ui';
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `icon` | `string` | — | 图标图片完整 src 路径，由调用方拼接（如 `` `${basePath}/images/noData.png` ``） |
| `size` | `'large' \| 'small'` | `'large'` | 图标尺寸：large = 80×80，small = 64×64 |
| `title` | `string` | — | 主标题，传多语言 key，内部通过 `useFm()` 翻译 |
| `subtitle` | `string` | — | 副标题，传多语言 key（可选） |
| `description` | `string` | — | 描述文字，传多语言 key，颜色较浅（可选） |
| `primaryBtnText` | `string` | — | 一级按钮文案，传多语言 key（可选） |
| `onPrimaryClick` | `() => void` | — | 一级按钮点击回调 |
| `tertiaryBtnText` | `string` | — | 三级按钮文案，传多语言 key（可选） |
| `onTertiaryClick` | `() => void` | — | 三级按钮点击回调 |
| `className` | `string` | — | 外层容器自定义 class，用于控制外边距等样式 |

## 示例

### 基础用法

```tsx
import { basePath } from '@better-bit-fe/base-utils';

<Empty
  title="no-data"
  icon={`${basePath}/images/noData.png`}
/>
```

### 小尺寸 + 外边距

```tsx
<Empty
  title="no-data"
  icon={`${basePath}/images/noData.png`}
  size="small"
  className="py-11"
/>
```

### 带操作按钮

```tsx
<Empty
  icon={`${basePath}/images/noData.png`}
  title="no-strategy"
  description="no-strategy-desc"
  primaryBtnText="create-strategy"
  onPrimaryClick={() => router.push('/create')}
  tertiaryBtnText="view-market"
  onTertiaryClick={() => router.push('/market')}
/>
```

## 设计规范

- **large**：图标 80×80
- **small**：图标 64×64
- 标题：14px / Bold / `--text-primary`
- 副标题：12px / Medium / `--text-primary`
- 描述：12px / Regular / `--text-secondary`
- 一级按钮：高 32px，圆角 8px，背景 `--fill-button-primary-default`
- 三级按钮：高 32px，圆角 8px，背景 `--fill-button-tertiary-default-app`
