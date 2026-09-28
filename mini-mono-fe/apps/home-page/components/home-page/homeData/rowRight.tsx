import { useFm } from '@better-bit-fe/base-hooks';
import React from 'react';
import styles from './index.module.less';
import cls from 'classnames';
import { getSymbolUrl } from '@better-bit-fe/base-utils';

const RowData = ({
	symbol,
	symbolAlias,
	formattedLastPrice,
	changeRate24H
}) => {
	const t = useFm();
	return (
		<a
			className={styles.rightRowItem}
			href={`${location.origin}/trade/usdt/${symbolAlias}`}
		>
			<span className={cls(styles.left, styles.pairs)}>
				{symbolAlias && (
					<img className={styles.itemIcon} src={getSymbolUrl(symbolAlias)} />
				)}
				<span> {symbolAlias} </span>
			</span>

			<div className={cls(styles.h524Change, styles.right)}>
				<div>{formattedLastPrice}</div>
				<div className={cls(styles.size14, {
					"upColor": changeRate24H >= 0,
					"downColor": changeRate24H < 0
				})}> {changeRate24H >= 0 ? `+${changeRate24H.toFixed(2)}` : changeRate24H.toFixed(2)}%</div>
			</div>


			<span className={cls(styles.left, styles.change)}>
				{formattedLastPrice}
			</span>

			<span
				className={cls(styles.right, styles.rate, {
					"upColor": changeRate24H >= 0,
					"downColor": changeRate24H < 0
				})}
			>
				{changeRate24H >= 0 ? `+${changeRate24H.toFixed(2)}` : changeRate24H.toFixed(2)}%
			</span>
		</a>
	);
};

export default RowData;
