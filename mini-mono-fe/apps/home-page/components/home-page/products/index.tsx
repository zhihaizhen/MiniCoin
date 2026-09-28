//@ts-ignore
import { useFm } from '@better-bit-fe/base-hooks';
import React from 'react';
import getConfig from 'next/config';
import cls from 'classnames';
import styles from './index.module.less';
import ProductCard from './productCard';
import { useRouter } from 'next/router';

const { staticFolder } = getConfig().publicRuntimeConfig;

const Products = () => {
    const t = useFm();
    const { locale } = useRouter();

    // 产品数据
    const products = [
        {
            id: 1,
            title: t('spotDesc'),
            image: `${staticFolder}/images/homePage/spot.png`,
            linkText: t('spotTrade'),
            linkUrl: `/${locale}/spot/exchange/BTC/USDT`,
        },
        {
            id: 2,
            title: t('futureDesc'),
            image: `${staticFolder}/images/homePage/future.png`,
            linkText: t('contractTrade'),
            linkUrl: `/${locale}/trade/usdt/BTCUSDT`,
        },
    ];


    return (
        <section className={cls(styles.Products)}>
            <div className={styles.coreContent}>
                <div className={styles.productSection}>
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Products;

