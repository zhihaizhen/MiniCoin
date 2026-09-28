// import { IInvokeFuncParams, checkAndInvokeFunc } from './jsBridge';

// const MODULE_NAME = 'Router';
// const METHOD_NAME = 'push';

// let isRouterPushInvokable = false;

// const REGISTER_PARAMS = {
//   path: 'register',
//   fromWeb: '1', // 注册完跳回原来的页面
//   directlyRegister: true // 用来 fix 在注册页面点击右上角登录按钮直接回到主页面的问题
// };

// const LOGIN_PARAMS = {
//   path: 'loginpage',
//   fromWeb: '1' // 登录完跳回原来的页面
// };

// type IRouterPushApp = Omit<IInvokeFuncParams, 'moduleName' | 'methodName'>;

// const checkAndInvokeRouterPush = (args: IRouterPushApp) => {
//   const { successCallback, errorCallback, params } = args;

//   checkAndInvokeFunc({
//     isFuncInvokable: isRouterPushInvokable,
//     params: {
//       moduleName: MODULE_NAME,
//       methodName: METHOD_NAME,
//       params,
//       successCallback: (res) => {
//         // if (res?.code === 0) {
//         //   console.log(MODULE_NAME, METHOD_NAME, res);
//         // }
//         successCallback?.(res);
//       },
//       errorCallback
//     },
//     updateFlagCallback: (res: boolean) => (isRouterPushInvokable = res)
//   });
// };

// export const navigateRegisterJsBridge = (args: IRouterPushApp) => {
//   checkAndInvokeRouterPush({
//     ...args,
//     params: { ...(args?.params || {}), ...REGISTER_PARAMS }
//   });
// };

// export const navigateLoginJsBridge = (args: IRouterPushApp) => {
//   checkAndInvokeRouterPush({
//     ...args,
//     params: { ...(args?.params || {}), ...LOGIN_PARAMS }
//   });
// };

// 跳转到app的页面,以下是和app联调的文档地址  
// https://dsg77uuqhntz.sg.larksuite.com/wiki/EJTqwhoFEiRcAikuv66lyYXtgeb

const callbackFn = (params) => {
   window.location.reload()
}

export const handleGoAppPage = (path, uniqueId, params = {}, cb=callbackFn) => {
    try {
      const param = {
        methodName: 'push',
        uniqueId,
        params: {
          path,
          ...params
        },
      };
      const jsonPrams = JSON.stringify(param);
      (window as any)?.flutter_inappwebview?.callHandler('_b_bridge_Router_', jsonPrams);
      (window as any)._b_bridge_callback_ = cb;
    } catch (e) {
      console.log('调用app失败', e)
    }
}



const exitCallbackFn = (params) => {};
export const handleAppExit = (params = {}, cb=exitCallbackFn) => {
	const param = {
		methodName: 'pop',
		uniqueId: 'exit',
		params
	};

	try {
		const jsonPrams = JSON.stringify(param);
		(window as any)?.flutter_inappwebview?.callHandler(
			'_b_bridge_Router_',
			jsonPrams
		);

		(window as any)._b_bridge_callback_ = cb;
	} catch (e) {
		console.error('调用失败', e);
	}
};



  
