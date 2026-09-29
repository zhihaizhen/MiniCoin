// @ts-nocheck
import { Tooltip, Button } from 'antd';
import cls from 'classnames';
import React from 'react';
import { ReactComponent as EditSvg } from 'common/assets/images/edit.svg';
import Styles from './index.module.less';

interface IProps {
  hasTpsl: boolean;
  canTpsl?: boolean;
  unableReason?: string;
  tpNum: number | string;
  slNum: number | string;
  disableOperate?: boolean;
  readonly?: boolean; // 只读模式（历史委托 / 成交明细）：仅展示数值，不可编辑/新增
  onEdit?: () => void;
  onAdd?: () => void;
}

const isPresent = (value) => value != null && value !== '' && value !== '--';

// 止盈止损单元格：未设置显示 +（可编辑时）或 --/--（只读时）；
// 已设置：双边上下两行，单边一行；止盈绿 / 止损红
const TpSlItem = ({
  hasTpsl,
  canTpsl = true,
  unableReason = '',
  tpNum,
  slNum,
  disableOperate = false,
  readonly = false,
  onEdit,
  onAdd,
}: IProps) => {
  if (!canTpsl) {
    // 不支持设置止盈止损
    return (
      <Tooltip title={unableReason}>
        <span>--/--</span>
      </Tooltip>
    );
  }

  if (hasTpsl) {
    const showTp = isPresent(tpNum);
    const showSl = isPresent(slNum);
    const both = showTp && showSl;
    // 有止盈止损：双边两行 / 单边一行；可编辑时附编辑笔
    return (
      <span className={Styles.tpslValue}>
        <span className={both ? Styles.tpslNums : undefined}>
          {showTp && <span className={Styles.tp}>{tpNum}</span>}
          {showSl && <span className={Styles.sl}>{slNum}</span>}
        </span>
        {!readonly && (
          <EditSvg
            className={cls(Styles.editPencil, {
              [Styles.disabled]: disableOperate,
            })}
            onClick={() => {
              if (!disableOperate && onEdit) onEdit();
            }}
          />
        )}
      </span>
    );
  }

  // 无止盈止损：只读时占位；可编辑时显示 + 新增按钮
  if (readonly) {
    return <span>--/--</span>;
  }

  const handleClick = () => {
    if (disableOperate) return;
    if (onAdd) {
      onAdd();
      return;
    }
    if (onEdit) onEdit();
  };

  return (
    <Button
      className={Styles.addBtn}
      type="outlined"
      color="primary"
      size="small"
      disabled={disableOperate}
      onClick={handleClick}
    >
      <span className={Styles.addIcon}>+</span>
    </Button>
  );
};

TpSlItem.defaultProps = {
  canTpsl: true,
  unableReason: '',
  disableOperate: false,
  readonly: false,
  onEdit: undefined,
  onAdd: undefined,
};

export { TpSlItem };
export default TpSlItem;
