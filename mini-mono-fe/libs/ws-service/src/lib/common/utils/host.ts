import { Env } from '@region-lib/env';

export const HOST = Env?.MAIN_HOST || '';
export const API_HOST = Env?.API_HOST ||'';
export const WS_HOST = Env?.WS_HOST ||'';
