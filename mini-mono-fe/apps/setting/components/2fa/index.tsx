//@ts-nocheck
import React, {
  useState,
  useImperativeHandle,
  forwardRef,
  useRef,
  useEffect
} from 'react';
import { Button, Modal, message } from 'antd';
import { useFm } from '@better-bit-fe/base-hooks';
import { useCaptcha } from '~/hooks/useCaptcha';
import { EmailCodeType } from '~/constant';
import { useUserInfo } from '@better-bit-fe/base-provider';
import CountdownModal from '~/components/countdownModal';
import Unbindmodal from '~/components/2fa/unbindModal';
import VerifyModalGather from '~/components/VerifyModalGather';
import Setup2faModal from './setup2faModal';
import Style from './index.module.less';

export interface ITwoFaProps {
  loginType: number;
}

function TwoFa(props: ITwoFaProps, ref: any) {
  const { loginType } = props;
  const { userInfo, updateUserInfo } = useUserInfo();
  const t = useFm();
  const countdownRef = useRef(null);
  const setup2faRef = useRef(null);
  const UnbindRef = useRef(null);
  const verifyGatherRef = useRef(null);

  function setUp2fa(isUnbind = false) {
    if (isUnbind) {
      UnbindRef.current.changeUnbindModalVisible(false);
      verifyGatherRef.current?.changeModalVisible(true);
      return;
    }
    if (loginType === 1) {
      countdownRef.current.showCaptcha({
        isUnbind: false
      });
    } else if (loginType === 2) {
      return;
    } else if (loginType === 3) {
      if (userInfo?.vague_mobile) {
        countdownRef.current.showCaptcha({
          isUnbind: false
        });
      } else {
        message.warning(t('setup2FAModal-bindEmail'));
      }
    } else {
      return;
    }
  }

  function countdownFinish() {
    setup2faRef.current.show2faModal(true);
  }

  function handleConfirmUnbind() {
    setUp2fa(true);
  }

  function handleUnbindSuccess() {
    updateUserInfo();
  }

  useImperativeHandle(ref, () => ({
    setUp2fa,
    changeUnbindModalVisible: UnbindRef.current.changeUnbindModalVisible
  }));
  return (
    <div>
      <CountdownModal ref={countdownRef} onFinish={countdownFinish} />
      <Setup2faModal ref={setup2faRef} />
      <Unbindmodal ref={UnbindRef} onConfirm={handleConfirmUnbind} />
      <VerifyModalGather
        ref={verifyGatherRef}
        scene="unbind_2fa"
        onSuccess={handleUnbindSuccess}
      />
    </div>
  );
}

export default forwardRef(TwoFa);
