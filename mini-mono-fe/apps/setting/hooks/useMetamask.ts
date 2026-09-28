import React, { useState } from 'react';

import { useWallet } from '@region-lib/wallet';
import { postGetSignMessage, postVerifySignMessage } from '~/api';

export function useMetamask() {
  const [messageInfo, setmessageInfo] = useState({});
  const { getWallet, wallet, address, chainId, connect, disconnected } =
    useWallet();
  /**
   * 获取nonce并调起钱包进行签名
   */
  async function signMessageEOA() {
    const { message } = await postGetSignMessage({
      address: address.value
      // message: msg
    });
    // 调用metamask签名
    const signature = await wallet.signMessage(message);
    setmessageInfo({ message, signature, address: address });
    return messageInfo;
  }
}
