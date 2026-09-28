//@ts-ignore
import React from 'react';
import cls from 'classnames';
import { ReactComponent as ArrowRightSVG } from '~/public/images/homePage/arrow-right.svg';
import styles from './index.module.less';

interface ProductCardProps {
    product: {
        id: number;
        title: string;
        image: string;
        linkText: string;
        linkUrl: string;
    };
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const handleClick = () => {
        window.location.href = product.linkUrl;
    };

    return (
        <div className={styles.productCard}>
            <h4 className={styles.productTitle} dangerouslySetInnerHTML={{ __html: product.title }} />
            <div className={styles.productImageWrapper}>
                <img src={product.image} alt={product.title} className={styles.productImage} />
                <button className={styles.productLink} onClick={handleClick}>
                    <span>{product.linkText}</span>
                    <ArrowRightSVG className={styles.arrowIcon} />
                </button>
            </div>
        </div>
    );
};

export default ProductCard;

