import { EWebConfigDataType } from 'common/enums/webConfig.enum';

export interface IWebConfigResponseDTO {
  data: IWebConfigItemDTO[];
  version: string;
}

export interface IWebConfigItemDTO {
  name: string;
  dataType: EWebConfigDataType;
  value: string;
  activatedAt: string;
  expiredAt: string;
}

export type IWebConfigItem = IWebConfigItemDTO;

export interface INoticeBarConfig {
  version: string;
  symbol_news: INoticeBarSymbolNewsItem[];
}

export interface INoticeBarSymbolNewsItem {
  logId: number;
  info: string;
  url?: string;
}
