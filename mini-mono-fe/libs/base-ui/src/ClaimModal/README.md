# ClaimModal

A modal dialog component for claim/reward flows, built on Ant Design `Modal`.

## Usage

```tsx
import { ClaimModal } from '@better-bit-fe/base-ui';

// Basic usage
<ClaimModal
  open={isOpen}
  title="Claim Your Reward"
  confirmText="Claim Now"
  confirmLoading={isClaiming}
  onConfirm={handleClaim}
  onCancel={() => setIsOpen(false)}
>
  <p>You are about to claim 100 USDT.</p>
</ClaimModal>

// With card-style award
<ClaimModal
  open={isOpen}
  title="Congratulations!"
  onConfirm={handleClaim}
  onCancel={() => setIsOpen(false)}
  award={{ type: 'card', amount: '100', unit: 'USDT', desc: 'Mystery Card Reward' }}
/>

// With image award
<ClaimModal
  open={isOpen}
  title="You've earned a reward!"
  confirmLoading={isClaiming}
  onConfirm={handleClaim}
  onCancel={() => setIsOpen(false)}
  award={{ type: 'default', imgSrc: '/images/coin.png', amount: '50 USDT', desc: 'Trading Bonus' }}
/>
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` | — | Controls modal visibility |
| `title` | `ReactNode` | — | Modal title rendered in bold centered text |
| `children` | `ReactNode` | — | Additional body content rendered below the award |
| `confirmText` | `string` | `'Confirm'` | Label for the confirm button |
| `cancelText` | `string` | — | Reserved (not rendered; close is via the ✕ icon) |
| `onConfirm` | `() => void` | — | Called when the confirm button is clicked |
| `onCancel` | `() => void` | — | Called when the ✕ icon is clicked |
| `confirmLoading` | `boolean` | — | Shows a spinner and disables the confirm button |
| `award` | `AwardInfo` | — | Award display config; renders above `children` when provided |

## AwardInfo

| Field | Type | Description |
|---|---|---|
| `type` | `'card' \| 'default' \| ''` | Display variant — `'card'` renders a card with SVG background; `'default'` renders an image icon |
| `amount` | `string` | Award amount (required) |
| `unit` | `string` | Unit label shown next to amount (card type only) |
| `imgSrc` | `string` | Image URL (default type only) |
| `desc` | `string` | Descriptive text shown below the amount |

## Notes

- Background color uses the CSS variable `--fill-fill-modal` (fallback `#101112`).
- The confirm button is disabled (not clickable) while `confirmLoading` is `true`.
- Responsive sizing throughout: mobile-first with `md:` breakpoint overrides.
- Card award uses hardcoded warm brown tones (`#593813`, `#664F3C`) matched to the `card.svg` background.
