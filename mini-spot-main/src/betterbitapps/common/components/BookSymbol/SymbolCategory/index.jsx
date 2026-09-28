import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ReactComponent as RightIcon } from 'common/assets/images/symbolBook/right.svg';
import { ReactComponent as LeftIcon } from 'common/assets/images/symbolBook/left.svg';
import { useTranslation } from 'react-i18next';
import styles from './index.module.less';

const SymbolCategory = (props) => {
  const {
    disable,
    activeSectionId,
    categoryList,
    handleCategoryClick,
  } = props;
  const [t_error] = useTranslation('ztsl_error_code');
  const scrollRef = useRef(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setShowLeft(el.scrollLeft > 0);
    setShowRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    updateArrows();
  }, [categoryList, updateArrows]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(updateArrows);
    ro.observe(el);
    return () => {
      ro.disconnect();
    };
  }, [updateArrows]);


  const scroll = useCallback((dir) => {
    const el = scrollRef.current;
    if (!el) return;
    const count = categoryList.length;
    let scrollCount;
    if (count <= 10) {
      scrollCount = 1;
    } else  {
      scrollCount = 2;
    } 
    const itemWidth = el.scrollWidth / Math.max(count, 1);
    const step = Math.min(
      Math.max(itemWidth * scrollCount, 60),
      el.clientWidth * 0.55
    );
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
  }, [categoryList.length]);

  return (
    <div className={styles.wrapper}>
      <div
        ref={scrollRef}
        className={styles.categoryList}
        onScroll={updateArrows}
      >
        <For each="categoryItem" of={categoryList} index="inx">
          <div
            className={classNames(styles.item, {
              [styles.itemActive]: categoryItem.sectionId === activeSectionId,
            })}
            onClick={(e) => handleCategoryClick(e, categoryItem.sectionId)}
            key={inx}
          >
            {t_error(categoryItem.translationTxt)}
          </div>
        </For>
      </div>

      {showLeft && (
        <>
          <div className={classNames(styles.mask, styles.maskLeft)} />
          <LeftIcon
            className={classNames(styles.arrow, styles.arrowLeft)}
            onClick={() => scroll(-1)}
          />
        </>
      )}

      {showRight && (
        <>
          <div className={classNames(styles.mask, styles.maskRight)} />
          <RightIcon
            className={classNames(styles.arrow, styles.arrowRight)}
            onClick={() => scroll(1)}
          />
        </>
      )}
    </div>
  );
};

SymbolCategory.defaultProps = {
  disable: false,
  activeSectionId: undefined,
  categoryList: [],
  handleCategoryClick: undefined,
};

SymbolCategory.propTypes = {
  disable: PropTypes.bool,
  activeSectionId: PropTypes.string,
  categoryList: PropTypes.array,
  handleCategoryClick: PropTypes.func,
};

export default SymbolCategory;
