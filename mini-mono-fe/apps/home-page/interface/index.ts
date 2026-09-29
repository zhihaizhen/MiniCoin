export enum DisplayFrequency {
  EVERY_TIME = 'every_time', // 每次进入
  ONCE_DAILY = 'once_daily', // 每日一次
  FIRST_TIME = 'first_time', // 首次进入
}
export enum LoginState {
  LOGGED_IN= 'logged_in',
  NOT_LOGED_IN = 'not_logged_in',
}

export enum UserTypes {
  NEW_USER = 'new_users',
  OLD_USER = 'old_users',
}

export interface IAdProps {
  /** 编码 */
  code: string;

  /** 标题 */
  title: string;

  /** 简介 */
  abstr: string;

  /** 排序 */
  seq: number;

  /** app 白天图片 */
  pic_app_light_url: string;

  /** app 黑夜图片 */
  pic_app_dark_url: string;

  /** web 白天图片 */
  pic_web_light_url: string;

  /** web 黑夜图片 */
  pic_web_dark_url: string;

  /** h5 白天图片 */
  pic_h5_light_url: string;

  /** h5 黑夜图片 */
  pic_h5_dark_url: string;

  /** h5 跳转地址 */
  redirect_h5_url: string;

  /** web 专用跳转地址 */
  redirect_web_url: string;

  /** 开始时间（秒级时间戳） */
  begin_time: string;

  /** 结束时间（秒级时间戳） */
  end_time: string;

  /** 登录状态 */
  login_status: LoginState;

  /** 语言区域 */
  language_area: string;

  /** 用户类型（新/老用户） */
  user_type: UserTypes;

  /** 展示频次 */
  display_frequency: DisplayFrequency;

  /** 相同用户每日最大展示频次 */
  same_user_max_daily_display_frequency: number;
}

export interface IAdStoreProps {
  code: string;
  login_status: LoginState;
  display_frequency: DisplayFrequency;
  displayed_date: string
  displayed_num: number;
  old_max_daily_display_num: number;
}


// 单个社交媒体项
export interface SocialMediaItem {
  /** 排序 */
  seq: number;
  /** 名称 */
  name: string;
  /** 图片地址 */
  pic_url: string;
  /** 跳转地址 */
  redirect_url: string;
}

// 单语言数据结构
export interface LocaleSocialMedia {
  social_medias: SocialMediaItem[];
}

// 多语言数据结构（支持任意语言 key）
export type SocialMediaMap = Record<string, LocaleSocialMedia>;
