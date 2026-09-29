
import { Input } from 'common/antdComponents';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback, useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import './index.module.less';

const SymbolSearch = ({ value, onChange }) => {
  const [t] = useTranslation();
  const [isFocus, setIsFocus] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [internalValue, setInternalValue] = useState(value);
  const isComposingRef = useRef(false);
  const composingValueRef = useRef('');

  // 同步外部 value 到内部状态（仅在非组合输入时）
  useEffect(() => {
    if (!isComposingRef.current) {
      setInternalValue(value);
    }
  }, [value]);

  const handleFocus = useCallback(() => {
    setIsFocus(true);
  }, [setIsFocus]);

  const handleBlur = useCallback(() => {
    setIsFocus(false);
  }, [setIsFocus]);

  const handleCompositionStart = useCallback(() => {
    setIsComposing(true);
    isComposingRef.current = true;
    composingValueRef.current = internalValue; // 保存组合输入开始时的值
  }, [internalValue]);

  // 解决windows系统下，拼音输入法时，输入框会多次触发onChange事件的问题
  const handleCompositionEnd = useCallback(
    (e) => {
      setIsComposing(false);
      isComposingRef.current = false;
      // 优先使用 e.target.value，如果为空则使用 internalValue（组合输入期间更新的值）
      const currentValue = e.target.value || internalValue || composingValueRef.current;
      const txt = currentValue.replace(/[^0-9A-Za-z]/g, '');
      const finalValue = txt ? txt.toUpperCase() : '';
      setInternalValue(finalValue);
      onChange(finalValue);
      composingValueRef.current = ''; // 清空引用
    },
    [onChange, internalValue],
  );

  const handleChange = useCallback(
    (key) => {
      if (isComposingRef.current) {
        // 组合输入期间，只更新内部状态，不进行过滤，让输入框能显示内容
        setInternalValue(key);
        composingValueRef.current = key; // 保存组合输入期间的值
      } else {
        // 非组合输入期间，正常处理
        const txt = key.replace(/[^0-9A-Za-z]/g, '');
        const finalValue = txt ? txt.toUpperCase() : '';
        setInternalValue(finalValue);
        onChange(finalValue);
      }
    },
    [onChange],
  );

  const handleDel = useCallback(
    (e) => {
      e.stopPropagation();
      onChange('');
    },
    [onChange],
  );

  return (
    <div className="symbol-search__com">
      <div
        className={classNames('symbol-search__ctr', {
          'symbol-search__ctr--focus': isFocus || value,
        })}
        onClick={(e) => e.stopPropagation()}
      >
        <Input
          value={internalValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          placeholder={t('search')}
          className="symbol-search__ipt"
          prefix={
            <span className="f-12 icon iconfont icon-search symbol-search__icon" />
          }
          allowClear
        />
      </div>
    </div>
  );
};

SymbolSearch.defaultProps = {
  value: '',
  onChange: () => { },
};

SymbolSearch.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
};

export default SymbolSearch;
