/**
 * PasskeyVerifyModal — 通行密钥优先验证弹框
 *
 * 由 VerifyModalGather 在触发时刻判定通过后打开。
 * 切换验证方式 / 关闭时通过 epoch 丢弃进行中的 options/get/finish 回调。
 */

import React, {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  useCallback
} from 'react';
import { Button, Modal, message } from 'antd';
import { useFm } from '@better-bit-fe/base-hooks';
import { useUserInfo } from '@better-bit-fe/base-provider';
import {
  postMultiUnbind,
  postPasskeyVerifyFinish,
  postPasskeyVerifyOptions
} from '~/api';
import { ReactComponent as CloseOutlined } from '~/public/images/accountSafe/close.svg';
import { ReactComponent as IconCrossDevice } from '~/public/images/accountSafe/Cross-device.svg';
import { ReactComponent as IconRight } from '~/public/images/accountSafe/right.svg';
import {
  SCENE_OPERATION_MAP,
  SCENE_SUCCESS_MSG_MAP,
  VERIFY_SCENE_TO_PASSKEY_SCENE
} from './constants';
import {
  buildAssertionPublicKey,
  buildFinishRequest,
  getAssertion,
  serializeAssertionCredential
} from '~/utils/passkey/assertion';
import Style from './index.module.less';

import type { VerifyScene } from './types';
import type { IbindTypes } from '~/types';
import type {
  PasskeyVerifyFinishResponse,
  PasskeyVerifyOptionsResponse
} from '~/types/passkey';

const BUSY_PHASES = [
  'requesting_options',
  'webauthn_pending',
  'requesting_finish',
  'delivering'
] as const;

type PasskeyVerifyPhase =
  | 'idle'
  | (typeof BUSY_PHASES)[number]
  | 'failure';

const DELIVER_TIMEOUT_MS = 15000;

interface PasskeyVerifyModalProps {
  scene: VerifyScene;
  onVerifyComplete?: (codes: Record<string, string>) => Promise<void> | void;
  onFallback: (isChange: boolean) => void;
  onSuccess?: () => void;
  zIndex?: number;
}

export interface PasskeyVerifyModalRef {
  open: (isChange?: boolean) => void;
  close: () => void;
}

function isBusyPhase(phase: PasskeyVerifyPhase): boolean {
  return (BUSY_PHASES as readonly string[]).includes(phase);
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('timeout'));
    }, ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}

function PasskeyVerifyModal(
  props: PasskeyVerifyModalProps,
  ref: React.Ref<PasskeyVerifyModalRef>
) {
  const { scene, onVerifyComplete, onFallback, onSuccess, zIndex } = props;
  const t = useFm();
  const { updateUserInfo } = useUserInfo();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [phase, setPhase] = useState<PasskeyVerifyPhase>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isChangeRef = useRef(false);
  const epochRef = useRef(0);
  const busyRef = useRef(false);

  const isBusy = isBusyPhase(phase);
  const isFailure = phase === 'failure';

  const invalidateCurrentFlow = useCallback(() => {
    epochRef.current += 1;
  }, []);

  const isStale = useCallback((epoch: number) => epochRef.current !== epoch, []);

  const enterFailure = useCallback(
    (epoch: number) => {
      if (isStale(epoch)) return;
      busyRef.current = false;
      setPhase('failure');
      setErrorMessage(t('passkeyVerify-failTip'));
    },
    [isStale, t]
  );

  const resetAndClose = useCallback(() => {
    invalidateCurrentFlow();
    busyRef.current = false;
    setPhase('idle');
    setErrorMessage(null);
    setIsModalOpen(false);
    isChangeRef.current = false;
  }, [invalidateCurrentFlow]);

  const deliverToBusiness = useCallback(
    async (passkeyCode: string) => {
      if (onVerifyComplete) {
        await withTimeout(
          Promise.resolve(onVerifyComplete({ passkey_code: passkeyCode })),
          DELIVER_TIMEOUT_MS
        );
        return;
      }

      const operation = SCENE_OPERATION_MAP[scene] as IbindTypes['operation'] | undefined;
      if (!operation) {
        throw new Error('Unsupported passkey unbind scene');
      }

      await withTimeout(
        postMultiUnbind({
          scenes: 'unbind_opt_scenes',
          operation,
          operation_data: { passkey_code: passkeyCode }
        } as IbindTypes),
        DELIVER_TIMEOUT_MS
      );

      const successMsgKey = SCENE_SUCCESS_MSG_MAP[scene];
      if (successMsgKey) {
        message.success(t(successMsgKey));
      }
      updateUserInfo();
      onSuccess?.();
    },
    [onSuccess, onVerifyComplete, scene, t, updateUserInfo]
  );

  const handleFallback = useCallback(() => {
    const isChange = isChangeRef.current;
    resetAndClose();
    onFallback(isChange);
  }, [onFallback, resetAndClose]);

  const runVerifyFlow = useCallback(async () => {
    if (isBusy || busyRef.current) return;
    busyRef.current = true;

    invalidateCurrentFlow();
    const epoch = epochRef.current;
    setPhase('requesting_options');
    setErrorMessage(null);

    const backendScene = VERIFY_SCENE_TO_PASSKEY_SCENE[scene];
    if (!backendScene) {
      enterFailure(epoch);
      return;
    }

    let optionsRes: PasskeyVerifyOptionsResponse;
    try {
      optionsRes = (await postPasskeyVerifyOptions({
        scene: backendScene
      })) as PasskeyVerifyOptionsResponse;
    } catch {
      enterFailure(epoch);
      return;
    }
    if (isStale(epoch)) return;

    let challengeId: string;
    let publicKey: PublicKeyCredentialRequestOptions;
    try {
      ({ challengeId, publicKey } = buildAssertionPublicKey(optionsRes));
    } catch {
      enterFailure(epoch);
      return;
    }

    if (isStale(epoch)) return;
    setPhase('webauthn_pending');

    let credential: PublicKeyCredential | null;
    try {
      credential = await getAssertion(publicKey);
    } catch {
      enterFailure(epoch);
      return;
    }
    if (isStale(epoch)) return;
    if (!credential) {
      enterFailure(epoch);
      return;
    }

    setPhase('requesting_finish');
    const assertion = serializeAssertionCredential(credential);
    let finishRes: PasskeyVerifyFinishResponse;
    try {
      finishRes = (await postPasskeyVerifyFinish(
        buildFinishRequest(backendScene, challengeId, assertion)
      )) as PasskeyVerifyFinishResponse;
    } catch {
      enterFailure(epoch);
      return;
    }
    if (isStale(epoch)) return;

    const passkeyCode = String(finishRes?.passkey_code || '');
    if (!passkeyCode) {
      enterFailure(epoch);
      return;
    }

    setPhase('delivering');
    try {
      await deliverToBusiness(passkeyCode);
    } catch {
      enterFailure(epoch);
      return;
    }
    if (isStale(epoch)) return;
    resetAndClose();
  }, [
    deliverToBusiness,
    enterFailure,
    invalidateCurrentFlow,
    isBusy,
    isStale,
    resetAndClose,
    scene
  ]);

  useImperativeHandle(ref, () => ({
    open: (isChange?: boolean) => {
      invalidateCurrentFlow();
      busyRef.current = false;
      isChangeRef.current = !!isChange;
      setPhase('idle');
      setErrorMessage(null);
      setIsModalOpen(true);
    },
    close: () => {
      resetAndClose();
    }
  }));

  const optionLabel = isFailure
    ? t('passkeyVerify-optionFailed')
    : t('passkeyVerify-option');

  const optionCls = [
    Style.verifyOption,
    isBusy ? Style.busy : '',
    isFailure ? '' : Style.selected
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Modal
      width={440}
      title={null}
      open={isModalOpen}
      onCancel={resetAndClose}
      footer={null}
      className={`${Style.selectVerifyModal} ${Style.passkeyVerifyModal}`}
      closeIcon={null}
      maskClosable={false}
      zIndex={zIndex}
    >
      <div className={Style.modalHeader}>
        <h3 className={Style.modalTitle}>{t('safe-verify')}</h3>
        <div className={Style.closeBtn} onClick={resetAndClose}>
          <CloseOutlined />
        </div>
      </div>

      <div className={Style.passkeySubtitle}>{t('passkeyVerify-subtitle')}</div>

      <div className={Style.modalBody}>
        <div
          className={optionCls}
          onClick={() => {
            if (!isBusy) void runVerifyFlow();
          }}
        >
          <div className={Style.optionContent}>
            <span className={Style.optionIcon}>
              <IconCrossDevice />
            </span>
            <span className={Style.optionLabel}>{optionLabel}</span>
          </div>
          <span className={Style.optionArrow}>
            <IconRight />
          </span>
        </div>
        {isFailure && errorMessage ? (
          <div className={Style.passkeyFailTip}>{errorMessage}</div>
        ) : null}
      </div>

      <div className={Style.modalFooter}>
        <Button
          type="primary"
          className={Style.confirmBtn}
          onClick={() => {
            void runVerifyFlow();
          }}
          disabled={isBusy}
          loading={isBusy}
        >
          {t('confirmBtn')}
        </Button>
        <div className={Style.switchVerify} onClick={handleFallback}>
          {t('passkeyVerify-switch')}
        </div>
      </div>
    </Modal>
  );
}

export default forwardRef(PasskeyVerifyModal);
