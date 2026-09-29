import React, { useState, useEffect, useMemo } from 'react';
import cls from 'classnames';
import { useFm } from '@better-bit-fe/base-hooks';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { Button, Modal, Table } from 'antd';
import { favLayerList, SECOND_FAV_LAYER } from '~/constants';
import { sortFun } from '~/utils/sort';
import {
  useAllSymbolQuote,
  useAllSpotQuote,
  useCollect
} from 'libs/ws-service';
import { FUTURE_TYPE, isInverseBySymbol, LINEAR_CATEGORY_TYPE } from 'libs/ws-service/src/utils';
import { postFavoriteChange } from '~/api';
import styles from './index.module.less';

export interface IAddFavoritesProps {
  open: boolean;
  handleEditCancel: () => void;
}

export default function EditFavorites(props: IAddFavoritesProps) {
  const { open, handleEditCancel } = props;
  const t = useFm();
  const { userInfo } = useUserInfo();
  const supportBlock = !!(userInfo as any)?.support_block;
  const filteredFavLayerList = useMemo(() => {
    return supportBlock ? favLayerList : favLayerList.filter((it) => it.value !== SECOND_FAV_LAYER.BLOCK);
  }, [supportBlock]);
  const { futureCollect, spotCollect, getCollectList } = useCollect();

  const [curSecondFavLayer, setCurSecondFavLayer] = useState(SECOND_FAV_LAYER.FUTURE);
  const [dataSource, setDataSource] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedDeleteParams, setSelectedDeleteParams] = useState({});
  const [confirmShow, setConfirmShow] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const { allSpotList } = useAllSpotQuote();
  const { allFutureList } = useAllSymbolQuote();

  const columns = [
    {
      title: t('selectAll'),
      dataIndex: 'symbolAlias',
      render: (_, { symbolAlias, type, contractType, symbolCategory }) => {
        return <div className={styles.symbolColumn}>
          <span>
            {symbolAlias}
            {contractType && isInverseBySymbol(contractType) && (
              <span>{t('inverse-coin')}</span>
            )}
          </span>
          {type === 'futures' && symbolCategory !== LINEAR_CATEGORY_TYPE.BLOCK && (
            <span className={styles.tag}>{t('perp')}</span>
          )}
        </div>
      }
    }
  ];

  // 编辑自选，futures是不区分正向和反向的,只区分合约和大宗
  const getCollectData = useMemo(() => {
    const allFuListRaw = allFutureList.filter((it) => futureCollect.includes(it.symbol));
    const fuList = allFuListRaw.filter((it) => it.symbolCategory !== LINEAR_CATEGORY_TYPE.BLOCK);
    const blockList = allFuListRaw.filter((it) => it.symbolCategory === LINEAR_CATEGORY_TYPE.BLOCK);
    const allFuList = supportBlock ? allFuListRaw : fuList;

    const allFuSymbolNames = allFuList.map((it) => it.symbol);

    const spList = allSpotList.filter((it) => spotCollect.includes(it.symbol));
    const spSymbolNames = spList.map((it) => it.symbol);
    return {
      blockList,
      allFuSymbolNames,
      fuList,
      spSymbolNames,
      spList
    };
  }, [spotCollect, futureCollect, allFutureList, allSpotList, supportBlock]);

  useEffect(() => {
    // 每次关闭之后都初始化
    if (!open) {
      setSelectedRowKeys([]);
      setSelectedDeleteParams({});
    }
  }, [open]);

  useEffect(() => {
    handleFavData();
  }, [getCollectData]);

  const handleChangeFavoriteLayer = (val) => {
    setCurSecondFavLayer(val);
    handleFavData(val);
  };

  const handleFavData = (favLayer = curSecondFavLayer) => {
    const { fuList = [], spList = [], blockList = [] } = getCollectData;
    let typeData = [];
    if (favLayer === SECOND_FAV_LAYER.FUTURE) {
      typeData = fuList;
    } else if (favLayer === SECOND_FAV_LAYER.SPOT) {
      typeData = spList;
    } else if (favLayer === SECOND_FAV_LAYER.BLOCK) {
      typeData = blockList;
    }
    typeData.sort((a, b) => sortFun(a, b)); // 采用默认排序
    // 数据源，用于table展示，需要有个key
    setDataSource(typeData);
  };

  const handleDelete = () => {
    setConfirmShow(true);
  };

  const handleConfirmDelete = async () => {
    setConfirmLoading(true);
    // @ts-ignore
    await postFavoriteChange(selectedDeleteParams);
    await getCollectList();
    setConfirmLoading(false);
    setConfirmShow(false); // 关闭确认框
    handleEditCancel(); // 关闭edit框
  };

  const handleCancelDelete = () => {
    setConfirmShow(false);
  };

  const handleSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys); // `${it.symbol}-${it.symbolCategory}`
    const selectedKeysOnlyNameList = newSelectedRowKeys.map((it) => it.split('-')[0]);
    const { allFuSymbolNames = [], spSymbolNames = [] } = getCollectData;

    // 现货独立 key，按现货完整列表差集即可
    if (curSecondFavLayer === SECOND_FAV_LAYER.SPOT) {
      const stillSpFav = spSymbolNames.filter(
        (name) => !selectedKeysOnlyNameList.includes(name)
      );
      setSelectedDeleteParams({
        upsert_keys: {
          spotBookSymbolSequence: stillSpFav.join(',')
        }
      });
      return;
    }

    // 合约与大宗共用 bookSymbolSequence，必须基于完整列表差集，避免另一类被整表覆盖丢失
    const stillFuFav = allFuSymbolNames.filter(
      (name) => !selectedKeysOnlyNameList.includes(name)
    );
    setSelectedDeleteParams({
      upsert_keys: {
        bookSymbolSequence: stillFuFav.join(',')
      }
    });
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: handleSelectChange
  };

  return (
    <>
      <Modal
        title={t('editCollect')}
        open={open}
        width="560px"
        centered={true}
        zIndex={1000}
        onCancel={handleEditCancel}
        wrapClassName={styles.editModal}
        footer={null}
      >
        <div className={styles.contentWrapper}>
          <div className={styles.leftBtns}>
            {filteredFavLayerList.map((it) => (
              <div
                className={cls(styles.leftItem, {
                  [styles.leftItemActive]: it.value === curSecondFavLayer
                })}
                key={it.value}
                onClick={() => handleChangeFavoriteLayer(it.value)}
              >
                <div>
                  <span
                    className={cls(styles.icon, {
                      [styles.spot]: it.value === SECOND_FAV_LAYER.SPOT,
                      [styles.futures]: it.value === SECOND_FAV_LAYER.FUTURE,
                      [styles.block]: it.value === SECOND_FAV_LAYER.BLOCK
                    })}
                  />
                  <span className={styles.btn}>{t(it.label)}</span>
                </div>
                <span className={cls(styles.icon, styles.expand)} />
              </div>
            ))}
          </div>
          <div className={styles.centerLine} />
          <div className={styles.rightTables}>
            <Table
              dataSource={dataSource}
              columns={columns}
              pagination={false}
              rowKey={(record) => `${record?.symbol}-${record?.symbolCategory}`}
              rowSelection={rowSelection}
            />
            <Button
              className={cls(styles.cancelBtn)}
              onClick={handleDelete}
              disabled={selectedRowKeys.length === 0}
            >
              {t('delete')}
            </Button>
          </div>
        </div>
      </Modal>
      <Modal
        open={confirmShow}
        title={t('removeFavTitle')}
        centered={true}
        onCancel={handleCancelDelete}
        wrapClassName={styles.deleteModal}
        width="400px"
        zIndex={1001}
        footer={
          <div className={styles.footer}>
            <Button className={styles.secondaryBtn} onClick={handleCancelDelete}>{t('cancel')}</Button>
            <Button
              className={styles.primaryBtn}
              loading={confirmLoading}
              onClick={handleConfirmDelete}
            >
              {t('confirm')}
            </Button>
          </div>
        }
      >
        <p>{t('removeFavContent')}</p>
      </Modal>
    </>
  );
}
