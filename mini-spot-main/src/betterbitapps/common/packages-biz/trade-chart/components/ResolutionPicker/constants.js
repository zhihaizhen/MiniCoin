import { storage } from 'by-storage';
import { KLINE_PINNED_RESOLUTIONS_KEY } from 'common/packages-biz/global-settings/localStorageSettings';

export const ALL_RESOLUTION_OPTIONS = [
  { res: 'Time', resolution: '1', fullKey: 'timeSharing', full: '分时', slug: 'Time' }, // 新增的分时
  // { res: '1S', resolution: '1S', fullKey: '1second', full: '1秒', slug: '1s' }, // 新增的1秒
  { res: '1', resolution: '1', fullKey: '1minute', full: '1分钟', slug: '1m' },
  { res: '3', resolution: '3', fullKey: '3minute', full: '3分钟', slug: '3m' },
  { res: '5', resolution: '5', fullKey: '5minute', full: '5分钟', slug: '5m' },
  { res: '15', resolution: '15', fullKey: '15minute', full: '15分钟', slug: '15m' },
  { res: '30', resolution: '30', fullKey: '30minute', full: '30分钟', slug: '30m' },
  { res: '60', resolution: '60', fullKey: '1hour', full: '1小时', slug: '1H' },
  { res: '120', resolution: '120', fullKey: '2hour', full: '2小时', slug: '2H' },
  { res: '240', resolution: '240', fullKey: '4hour', full: '4小时', slug: '4H' },
  { res: '360', resolution: '360', fullKey: '6hour', full: '6小时', slug: '6H' },
  { res: '480', resolution: '480', fullKey: '8hour', full: '8小时', slug: '8H' },
  { res: '720', resolution: '720', fullKey: '12hour', full: '12小时', slug: '12H' },
  { res: '1440', resolution: '1440', fullKey: '1day', full: '1日', slug: '1D' },
  // { res: '4320', resolution: '4320', fullKey: '3day', full: '3日', slug: '3D' }, // 没有3日
  { res: '10080', resolution: '10080', fullKey: '1week', full: '1周', slug: '1W' },
  { res: '44640', resolution: '44640', fullKey: '1month', full: '1月', slug: '1M' },
];

export const DEFAULT_PINNED_RESOLUTIONS = [
  'Time',
  '1',
  '15',
  '60',
  '240',
  '1440',
];

export const MAX_PINNED_RESOLUTIONS = 6;

export const getPinnedResolutions = () => {
  try {
    const stored = storage.get(KLINE_PINNED_RESOLUTIONS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length) {
        return parsed;
      }
    }
  } catch (e) {
    // ignore invalid storage
  }
  return DEFAULT_PINNED_RESOLUTIONS;
};

export const getResolutionSortValue = (item) => {
  if (!item) return Number.MAX_SAFE_INTEGER;
  if (item.res === 'Time') return 0;
  if (item.res === '1S' || item.resolution === '1S') return 1 / 60;
  const num = Number(item.resolution);
  if (!Number.isNaN(num)) return num;
  return Number.MAX_SAFE_INTEGER;
};

export const getPinnedResolutionItems = (pinnedRes) => {
  const optionMap = new Map(
    ALL_RESOLUTION_OPTIONS.map((item) => [item.res, item]),
  );
  return pinnedRes
    .map((res) => optionMap.get(res))
    .filter(Boolean)
    .sort((a, b) => getResolutionSortValue(a) - getResolutionSortValue(b));
};

export const getResolutionItemByRes = (res) =>
  ALL_RESOLUTION_OPTIONS.find((item) => item.res === res);
