import { domainChangeWatchers } from '@region/by-route-finder';
import DataWorker from './public.ws.worker';

let instance = null;
if (window.Worker) {
  instance = new DataWorker();
  domainChangeWatchers.push((item) => {
    instance.postMessage({ method: 'changeUrl', host: item.ws2 });
  });
}
const worker = instance;

export default worker;
