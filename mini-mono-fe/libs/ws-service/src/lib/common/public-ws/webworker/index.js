import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { domainChangeWatchers } from '@region/by-route-finder';
// import DataWorker from './marketData.worker';
// const byRouterFinder = dynamic(() => import('@region/by-route-finder'), {
//   ssr: false
// });
// const DataWorker = dynamic(() => import('./marketData.worker'), { ssr: false });

function InitWebWorker() {
  let instance = null;

  if (typeof window !== 'undefined') {
    if (window.Worker) {
      // console.log(DataWorker, 'DataWorker');
      // instance = new DataWorker();
      instance = new Worker(new URL('./marketData.worker.js'), import.meta.url);
      // setinstance(newinstance);
      // console.log(byRouterFinder, 'byRouterFinder');
      // const { domainChangeWatchers } = byRouterFinder;
      domainChangeWatchers.push((item) => {
        instance.postMessage({ method: 'changeUrl', host: item.ws2 });
      });
    }
  }

  // const worker = instance;
  return { worker: instance };
}

// const worker = {};

export default InitWebWorker;
