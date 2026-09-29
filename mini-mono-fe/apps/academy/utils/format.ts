import type { Difficulty } from '~/types/academy';

/** 难度对应的多语言 key（在 academy lang 项目中维护） */
export const DIFFICULTY_I18N_KEY: Record<Difficulty, string> = {
  beginner: 'difficulty_beginner',
  intermediate: 'difficulty_intermediate',
  advanced: 'difficulty_advanced'
};

/** 格式化发布日期为 YYYY-MM-DD（与竞品列表展示一致） */
export function formatPublishedAt(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
