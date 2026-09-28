import { useEffect } from 'react';
import { getBranchIoCdn } from '@better-bit-fe/base-ui';
import { isPhone, isApp } from '@better-bit-fe/base-utils';
import { getNativePath } from './deeplink';

import { getLangFromUrl, BRANCH_IO_KEY, LOGO_URL, DOM_ID } from './utils';

const DELAY_TO_LOAD_TIME = 10000;
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    branch: any;
  }
}

interface IBranchio {
  title?: string;
  description?: string;
  deeplinkRouter?: string;
  delay?: boolean;
}

const setBranchInit = () => {
  const currentLang = getLangFromUrl();
  const initParams = {
    metadata: {
      'bio-lang': currentLang
    }
  };
  window.branch.init(BRANCH_IO_KEY, initParams);
};

const setBranchViewData = (
  title?: string,
  description?: string,
  deeplinkRouter?: string
) => {
  const urlSearchParams = new URLSearchParams(window.location.search);
  const campaign = urlSearchParams.get('campaign');
  const medium = urlSearchParams.get('medium');
  const source = urlSearchParams.get('source');
  const stage = urlSearchParams.get('source');
  const { search, href } = window.location;
  const customDeeplinkPath = `app://open/${deeplinkRouter}${search}`;
  const nativePath = getNativePath(href);
  const mappingDeeplinkPath = nativePath ? nativePath.path : '';
  const mappingDeeplinkPathFinal = mappingDeeplinkPath.includes('?')
    ? `${mappingDeeplinkPath}${search?.replace('?', '&')}`
    : `${mappingDeeplinkPath}${search}`;
  const baseLinkData = {
    $og_title: title,
    $og_description: description,
    $og_image_url: LOGO_URL
  };
  //外部传入优先处理，若没自动跳转到web页面映射到APP的页面。
  //若不存在对应的页面则自动打开APP。
  const branchLinkData = deeplinkRouter
    ? {
      $deeplink_path: customDeeplinkPath,
      ...baseLinkData
    }
    : mappingDeeplinkPath
      ? {
        $deeplink_path: mappingDeeplinkPathFinal,
        ...baseLinkData
      }
      : baseLinkData;
  const linkData = {
    campaign,
    channel: source,
    feature: medium,
    stage,
    tags: [''],
    alias: '',
    data: branchLinkData
  };
  window.branch.setBranchViewData(linkData);
};

const onScriptLoaded = (
  title?: string,
  description?: string,
  deeplinkRouter?: string,
  delay = true
) => {
  const script = document.createElement('script');
  script.id = DOM_ID;
  script.src = getBranchIoCdn();
  script.async = true;
  script.onload = () => {
    setBranchInit();
    setBranchViewData(title, description, deeplinkRouter);
  };
  if (delay) {
    setTimeout(() => {
      document.body.appendChild(script);
    }, DELAY_TO_LOAD_TIME);
  } else {
    document.body.appendChild(script);
  }
};

export const branchScriptId = DOM_ID;

export const Branchio = ({
  title,
  description,
  deeplinkRouter,
  delay
}: IBranchio) => {
  useEffect(() => {
    if (isPhone() && !isApp()) {
      onScriptLoaded(title, description, deeplinkRouter, delay);
    }
  }, [title, description, deeplinkRouter, delay]);

  return null;
};
