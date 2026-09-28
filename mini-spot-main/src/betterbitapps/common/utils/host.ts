//  @ts-nocheck
import { Env } from '@region-lib/env';

const { MAIN_HOST } = Env;
const newPath = MAIN_HOST.replace('dev', 'www');
const WS_HOST1 = newPath
  // .replace("www", "ws2")
  .replace('https://', 'wss://')
  .replace('http://', 'wss://'); // Default to wss:// to avoid mixed content or server rejection on public domains

export const HOST = Env?.MAIN_HOST;
export const API_HOST = Env?.API_HOST;
export const WS_HOST = WS_HOST1;
