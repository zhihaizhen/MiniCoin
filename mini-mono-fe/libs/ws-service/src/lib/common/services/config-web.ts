import http from '../utils/http';
import { IWebConfigResponseDTO } from '../types/webConfig';
import { api2Host } from '../utils/routerSwitchEvent';

interface IProps {
  project_name: string;
  keys: string[];
}

export const getWebConfig = (config: IProps): Promise<IWebConfigResponseDTO> =>
  http.post(`${api2Host}/v3/config/web`, config);
