//  @ts-nocheck
import React, { useEffect, useMemo, useState } from 'react';
import getConfig from 'next/config';
import { Modal, Input } from 'antd';
import { useFm } from '@better-bit-fe/base-hooks';
import PropTypes from 'prop-types';
import styles from '~/pages/index.module.less';

const { staticFolder } = getConfig().publicRuntimeConfig;

const SpendSymbolModal = (props) => {
  const t = useFm();
  const { isOpen, changeOpen, list, getSpendSymbol } = props;
  const [showList, setShowList] = useState(list);

  console.log(9999, showList);

  const handleChoiceFiat = (it) => {
    if (it) {
      getSpendSymbol(it);
      changeOpen(false);
    }
  };

  const handleSearch = (e) => {
    const val = e.target.value?.toUpperCase();
    const newList = list.filter((it) => {
      if (it.fiat_code.includes(val) || it.fiat_name.includes(val)) {
        return it;
      }
    });
    setShowList(newList);
  };

  return (
    <Modal
      open={isOpen}
      footer={null}
      closable={false}
      wrapClassName={styles.modalWrapper}
      width="414px"
    >
      <div>
        <div className={styles.header}>
          {t('chooseFiat')}
          <div
            className={styles.closeIcon}
            onClick={() => {
              changeOpen(false);
            }}
          />
        </div>
        {/* 搜索   allowClear */}
        <div className={styles.search}>
          <Input
            prefix={
              <svg
                width="24"
                height="25"
                viewBox="0 0 24 25"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M4 11.1963C4 7.40598 7.07267 4.33331 10.863 4.33331C14.6533 4.33331 17.726 7.40598 17.726 11.1963C17.726 14.9866 14.6533 18.0593 10.863 18.0593C7.07267 18.0593 4 14.9866 4 11.1963ZM10.863 2.33331C5.9681 2.33331 2 6.30141 2 11.1963C2 16.0912 5.9681 20.0593 10.863 20.0593C12.9502 20.0593 14.8688 19.3379 16.3832 18.1307L20.3271 22.0747C20.7177 22.4652 21.3508 22.4652 21.7414 22.0747C22.1319 21.6841 22.1319 21.051 21.7414 20.6605L17.7974 16.7165C19.0045 15.2021 19.726 13.2835 19.726 11.1963C19.726 6.30141 15.7579 2.33331 10.863 2.33331Z"
                  fill="#888888"
                />
              </svg>
            }
            onChange={handleSearch}
            placeholder={t('searchFiat')}
          />
        </div>
        {/* 列表 */}
        <div className={styles.listWrapper}>
          {showList.length ? (
            showList.map((it, i) => {
              return (
                <div
                  key={i}
                  className={styles.listItem}
                  onClick={() => handleChoiceFiat(it)}
                >
                  <img
                    src={`/static/image/fiat/${it.fiat_code}.png`}
                    width="32"
                    height="32"
                  ></img>
                  <div>
                    <div className={styles.symbolName}>{it.fiat_code}</div>
                    <div className={styles.symbolFullName}>{it.fiat_name}</div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className={styles.listEmpty}>
              <div
                className={styles.empty}
                style={{
                  backgroundImage: `url('${staticFolder}/images/empty.svg')`
                }}
              />
              <div>{t('noData')}</div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

SpendSymbolModal.defaultProps = {
  isOpen: false,
  changeOpen: () => {},
  getSpendSymbol: () => {},
  list: []
};

SpendSymbolModal.propTypes = {
  isOpen: PropTypes.bool,
  changeOpen: PropTypes.func,
  getSpendSymbol: PropTypes.func,
  list: PropTypes.array
};

export default SpendSymbolModal;
