import React, { useEffect, useState } from 'react';
import { withLayout } from '@better-bit-fe/base-ui';
import { useRouter, withRouter } from 'next/router';
import { unixToFormat } from '~/utils/day';
import { getTmsMessages } from '@better-bit-fe/lang';
import { InfiniteScroll, List } from 'antd-mobile'
import { getBalanceRecords } from '~/api';
import { handleGoAppPage } from '@better-bit-fe/app-bridge';
import { useFm } from '@better-bit-fe/base-hooks';
import { toThousands } from '@unified/helpers';
import styles from './index.module.less';

const GiftDetail = ({ router }) => {
  const t = useFm();
  const { locale } = useRouter();

  const [data, setData] = useState([]);
  const [total, setTotal] = useState();
  const [pager, setPager] = useState({
    pageNum: 0,
    pageSize: 10,
    pages: 1, //总页数
  });
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false);

  const fetchRecords = async (pageNum = pager.pageNum) => {
    if (pageNum > pager.pages || loading) {
      return
    }
    setLoading(true);
    try {
      const res = await getBalanceRecords({
        "award_token": "FreeU",
        "page_num": pageNum,
        "page_size": pager.pageSize
      });
      const { records, current, pages } = res;
      setData([...data, ...records])
      setHasMore(pages > current)
      setPager({ ...pager, pageNum, pages })
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setTotal(router.query.total)
  }, [router])

  const loadMore = async () => {
    if (loading) return;
    const newPageNum = pager.pageNum + 1;
    await fetchRecords(newPageNum)
  }

  return (
    <div className={styles.giftDetail}>
      <div className={styles.box}>
        <div className={styles.infos}>
          <div className={styles.title}>{t('freeUByActivitiesTotal')}</div>
          <div className={styles.num}>
            {toThousands(total)}
            <span>FreeU</span>
          </div>
        </div>
        <div className={styles.btns}>
          <button onClick={() => handleGoAppPage('assets', 'rewardsHub')}>{t('goAsset')}</button>
        </div>
      </div>
      <div className={styles.list}>
        <div className={styles.title}>{t('historyRecords')}</div>

        <List style={{ minHeight: '100vh' }}>
          {data.map((item, index) => {
            const { award_source, award_token, language_config, create_time, award_amount, after_amount } = item;
            const { title } = language_config?.[locale].content || {}
            return <List.Item key={index}>
              <div className={styles.item}>
                <div className={styles.left}>
                  <div className={styles.title}>{award_source === 'Lottery' ? t('boxDraw') : t('getInActivity')}</div>
                  {/* <div className={styles.time}>{title}</div> */}
                  <div className={styles.time}>{unixToFormat(create_time)}</div>
                </div>
                <div className={styles.right}>
                  <div className={styles.new}>
                    <span>{`+${toThousands(award_amount)}`}</span>
                    {award_token}
                  </div>
                  <div className={styles.total}>
                    <span>{t('columns-allTotal')}</span>
                    <span>{toThousands(after_amount)}</span>
                    {award_token}
                  </div>
                </div>
              </div>
            </List.Item>
          })}
        </List>
        <InfiniteScroll loadMore={loadMore} hasMore={hasMore}>
          {!hasMore && <p style={{ textAlign: 'center' }}>{t('noMoreData')}</p>}
        </InfiniteScroll>
      </div>
    </div>
  );
};

export const getStaticProps = async (ctx) => {
  const { locale, locales, defaultLocale } = ctx;
  const lc = locale || defaultLocale;
  const messages = await getTmsMessages({
    project: ['rewards-hub', 'error_code'],
    entry: import.meta.url,
    locale: lc,
    additions: ['freeUByActivitiesTotal', 'description']
  });

  return {
    props: {
      locale: lc,
      locales,
      messages,
      title: messages.freeUByActivitiesTotal,
      description: messages.description,
      ogImage: '/static/image/brand/ogImage.png'
    }
  };
};

export default withLayout(withRouter(GiftDetail));