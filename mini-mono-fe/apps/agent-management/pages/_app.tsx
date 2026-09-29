// @ts-nocheck
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { usePathname } from 'next/navigation';
import './global.less';
/**
 * https://nextjs.org/docs/advanced-features/custom-app
 * 初始化页面、数据，服务端渲染
 * 添加全局的css
 */

if (
  `${process.env.ENVIRONMENT}` === 'testnet' ||
  `${process.env.ENVIRONMENT}` === 'production'
) {
  if (typeof window !== 'undefined') {
    const { fetch: originalFetch } = window;
    const nextDataRequestRegex = /\/_next\/data\/[a-zA-Z0-9_.-]*(\/.*\.json)/;
    window.fetch = async (...args) => {
      const [url] = args;
      if (nextDataRequestRegex.test(url as string)) {
        const matched = (url as string).match(nextDataRequestRegex);
        console.log('intercept', url);
        return originalFetch(matched[1]);
      }
      return originalFetch(...args);
    };
  }
}

function CustomApp({ Component, pageProps }: any) {
  const router = useRouter();
  const pathname = usePathname();

  const handleRouteChange = () => {
    const url = router.pathname;
    // if (url === MAIN_URL) {
    //   console.log(url, 'hide back button');
    //   window.Telegram.WebApp.BackButton.hide();
    // } else {
    //   console.log(url, 'show back button');
    //   window.Telegram.WebApp.BackButton.show();
    // }
    // alert('Route Changed: ' + url + '\nPath:' + pathname);
  };

  // useEffect(() => {
  //   // subscribe to routeChangeStart event
  //   router.events.on('routeChangeStart', (e, a) => {
  //     alert(e);
  //     alert(JSON.stringify(a));
  //   });

  //   window.addEventListener('popstate', function (event) {
  //     // Log the state data to the console
  //     alert(event.state);
  //   });
  //   // // subscribe to routeChangeComplete event
  //   // router.events.on('routeChangeComplete', incrementCompleteCount);

  //   // unsubscribe on component destroy in useEffect return function
  //   return () => {
  //     router.events.off('routeChangeStart', incrementStartCount);
  //     // router.events.off('routeChangeComplete', incrementCompleteCount);
  //   };
  // }, []);

  return (
    <>
      <div id="modal" />
      <div>
        <div
          id="widget_header"
          style={{ height: '0px', background: '#17181F' }}
        ></div>
        <Component {...pageProps} />
        <div id="widget_footer"></div>
      </div>
    </>
  );
}

/**
 * https://nextjs.org/docs/basic-features/data-fetching/get-static-props
 *
 * 只在服务端执行，不会出现在浏览器中
 *
 * @param ctx
 * @returns
 */
export default CustomApp;
