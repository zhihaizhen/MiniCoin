/**
 * SelectVerifyModal — 选择层
 *
 * 职责：展示可用的验证方式供用户选择
 *
 * required 模式：上方必选项（disabled） + 分隔线 + 下方可选项（单选替换）
 * select   模式：扁平列表，已验证的可勾选（多选，上限 minPass），未验证的显示"去认证"
 *
 * 统一使用 OptionItem 子组件渲染每一行选项
 */

import React, { useState, useMemo, forwardRef, useImperativeHandle } from 'react';
import { Modal, Button, Checkbox } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import { useFm } from '@better-bit-fe/base-hooks';
import { ReactComponent as CloseOutlined } from '~/public/images/accountSafe/close.svg';
import {
  VERIFY_LABEL_MAP,
  VERIFY_RECOMMEND_TYPES,
  VERIFY_ICON_MAP
} from './constants';
import Style from './index.module.less';

import type { VerifyQueueItem, VerifyQueueData, VerifyMode } from './types';

interface SelectVerifyModalProps {
  /** 验证模式：required（有必选项）/ select（纯选择） */
  mode?: VerifyMode;
  /** 用户已验证的方式集合，select 模式下用于判断哪些可勾选 */
  verifiedTypes?: Set<string>;
  /** 用户确认选择后的回调，参数为选中的验证类型数组 */
  onConfirm?: (selectedTypes: string[]) => void;
  /** 未验证项点击「去认证」的回调（通常跳转安全设置页），参数为该项 type */
  onGoToSecurity?: (type?: string) => void;
  zIndex?: number;
}

export interface SelectVerifyModalRef {
  /** 打开弹框，传入 getVerifyQueue 返回的数据 */
  open: (data: VerifyQueueData) => void;
  close: () => void;
}


interface OptionItemProps {
  item: VerifyQueueItem;
  isSelected: boolean;
  /** true 时 checkbox 禁用（required 模式的必选项） */
  disabled?: boolean;
  /** true 时右侧展示"去认证"箭头而非 checkbox（select 模式未验证项） */
  unverified?: boolean;
  onClick: () => void;
  t: (key: string) => string;
}

/**
 * 统一的选项行组件，同时服务 required 模式和 select 模式
 * 通过 disabled / unverified 组合出三种行为：
 * - disabled=true:   必选项，checkbox 锁定选中
 * - unverified=true: 未验证项，右侧显示"去认证"→ 跳转安全设置
 * - 默认:            可选项，点击 toggle 选中状态
 */
function OptionItem({ item, isSelected, disabled, unverified, onClick, t }: OptionItemProps) {
  const labelKey = VERIFY_LABEL_MAP[item.type];
  const label = labelKey ? t(labelKey) : item.type;
  const tag = VERIFY_RECOMMEND_TYPES.has(item.type) ? t('verifyTag-recommend') : null;
  const icon = VERIFY_ICON_MAP[item.type];

  const cls = [
    Style.verifyOption,
    isSelected ? Style.selected : '',
    unverified ? Style.unverified : ''
  ].filter(Boolean).join(' ');

  return (
    <div key={item.id} className={cls} onClick={onClick}>
      <div className={Style.optionContent}>
        {icon && <span className={Style.optionIcon}>{icon}</span>}
        <span className={Style.optionLabel}>{label}</span>
        {tag && <span className={Style.optionTag}>{tag}</span>}
      </div>
      {unverified ? (
        <span className={Style.goVerifyBtn}>
          {t('goVerify')}
          <RightOutlined style={{ fontSize: 12, marginLeft: 4 }} />
        </span>
      ) : (
        <Checkbox
          checked={isSelected}
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
            if (!disabled) onClick();
          }}
        />
      )}
    </div>
  );
}

function SelectVerifyModal(
  props: SelectVerifyModalProps,
  ref: React.Ref<SelectVerifyModalRef>
) {
  const {
    mode = 'required',
    verifiedTypes = new Set<string>(),
    onConfirm,
    onGoToSecurity,
    zIndex
  } = props;
  const t = useFm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [queueData, setQueueData] = useState<VerifyQueueData | null>(null);

  const isSelectMode = mode === 'select';

  /** 必选项列表（仅 required 模式有值），按 priority 升序排列 */
  const requiredItems = useMemo(() => {
    if (isSelectMode || !queueData?.required) return [];
    return [...queueData.required].sort((a, b) => a.priority - b.priority);
  }, [queueData, isSelectMode]);

  /** 可选项列表（required + select 模式都有），按 priority 升序排列 */
  const strongFactorItems = useMemo(() => {
    if (!queueData?.strong_factor) return [];
    return [...queueData.strong_factor].sort((a, b) => a.priority - b.priority);
  }, [queueData]);

  /** 用户至少需要选择的 strong_factor 数量 */
  const minPass = queueData?.strong_factor_min_pass ?? (isSelectMode ? 2 : 1);

  /** 确认按钮是否可用：select 模式需勾选 >= minPass；required 模式需可选项中选够 minPass */
  const canConfirm = useMemo(() => {
    if (isSelectMode) {
      return selectedTypes.length >= minPass;
    }
    const strongTypeSet = new Set(strongFactorItems.map((i) => i.type));
    const selectedStrongCount = selectedTypes.filter((t) => strongTypeSet.has(t)).length;
    return selectedStrongCount >= minPass;
  }, [selectedTypes, strongFactorItems, minPass, isSelectMode]);

  // ─── Ref API ───

  const resetModal = () => {
    setIsModalOpen(false);
    setSelectedTypes([]);
    setQueueData(null);
  };

  useImperativeHandle(ref, () => ({
    /**
     * 打开选择弹框
     * - select 模式：默认不勾选任何项，由用户手动选择
     * - required 模式：必选项 + 第一个可选项默认选中
     */
    open: (data: VerifyQueueData) => {
      setQueueData(data);
      if (isSelectMode) {
        setSelectedTypes([]);
      } else {
        const requiredTypes = (data?.required || []).map((i) => i.type);
        const sortedStrong = [...(data?.strong_factor || [])].sort(
          (a, b) => a.priority - b.priority
        );
        const defaultStrongTypes = sortedStrong
          .slice(0, data?.strong_factor_min_pass ?? 1)
          .map((i) => i.type);
        setSelectedTypes([...requiredTypes, ...defaultStrongTypes]);
      }
      setIsModalOpen(true);
    },
    close: resetModal
  }));


  /**
   * required 模式：可选项单选替换
   * 保留所有 required 已选项，将 strong_factor 区域的选中替换为新点击的那个
   */
  const handleStrongClick = (type: string) => {
    const strongTypeSet = new Set(strongFactorItems.map((i) => i.type));
    setSelectedTypes((prev) => {
      if (prev.includes(type)) return prev;
      const withoutStrong = prev.filter((t) => !strongTypeSet.has(t));
      return [...withoutStrong, type];
    });
  };

  /**
   * select 模式：多选 toggle
   * - 未验证项：点击触发 onGoToSecurity 跳转安全设置页
   * - 已验证项：toggle 选中/取消，选中数量上限 = minPass
   */
  const handleSelectToggle = (type: string) => {
    if (!verifiedTypes.has(type)) {
      onGoToSecurity?.(type);
      return;
    }
    setSelectedTypes((prev) => {
      if (prev.includes(type)) return prev.filter((t) => t !== type);
      if (prev.length >= minPass) return prev;
      return [...prev, type];
    });
  };

  const handleConfirm = () => {
    onConfirm?.(selectedTypes);
    setIsModalOpen(false);
  };


  const hasStrongFactor = strongFactorItems.length > 0;

  return (
    <Modal
      width={440}
      title={null}
      open={isModalOpen}
      onCancel={resetModal}
      footer={null}
      className={Style.selectVerifyModal}
      closeIcon={null}
      maskClosable={false}
      zIndex={zIndex}
    >
      <div className={Style.modalHeader}>
        <h3 className={Style.modalTitle}>{t('selectVerifyModal-title')}</h3>
        <div className={Style.closeBtn} onClick={resetModal}>
          <CloseOutlined />
        </div>
      </div>

      <div className={Style.modalBody}>
        {isSelectMode ? (
          <div className={Style.verifySection}>
            {strongFactorItems.length > minPass ? (
              <div className={Style.sectionTitle}>
                {t('selectVerifyModal-pickTwo')}
              </div>
            ) : null}
            <div className={Style.optionsList}>
              {strongFactorItems.map((item) => (
                <OptionItem
                  key={item.id}
                  item={item}
                  isSelected={selectedTypes.includes(item.type)}
                  unverified={!verifiedTypes.has(item.type)}
                  onClick={() => handleSelectToggle(item.type)}
                  t={t}
                />
              ))}
            </div>
          </div>
        ) : (
          <>
            {requiredItems.length > 0 && (
              <div className={Style.verifySection}>
                <div className={Style.sectionTitle}>
                  {t('selectVerifyModal-required')}
                </div>
                <div className={Style.optionsList}>
                  {requiredItems.map((item) => (
                    <OptionItem
                      key={item.id}
                      item={item}
                      isSelected={selectedTypes.includes(item.type)}
                      disabled
                      onClick={() => { }}
                      t={t}
                    />
                  ))}
                </div>
              </div>
            )}

            {requiredItems.length > 0 && hasStrongFactor && (
              <div className={Style.divider}>
                <span className={Style.dividerLine} />
                <span className={Style.dividerText}>
                  {t('selectVerifyModal-and')}
                </span>
                <span className={Style.dividerLine} />
              </div>
            )}

            {hasStrongFactor && (
              <div className={Style.verifySection}>
                <div className={Style.sectionTitle}>
                  {t('selectVerifyModal-pickOne')}
                </div>
                <div className={Style.optionsList}>
                  {strongFactorItems.map((item) => (
                    <OptionItem
                      key={item.id}
                      item={item}
                      isSelected={selectedTypes.includes(item.type)}
                      onClick={() => handleStrongClick(item.type)}
                      t={t}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className={Style.modalFooter}>
        <Button
          type="primary"
          className={Style.confirmBtn}
          onClick={handleConfirm}
          disabled={!canConfirm}
        >
          {t('confirmBtn')}
        </Button>
      </div>
    </Modal>
  );
}

export default forwardRef(SelectVerifyModal);
