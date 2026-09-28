//@ts-ignore
import { useFm } from '@better-bit-fe/base-hooks';
import React, { useState } from 'react';
import cls from 'classnames';
import { useRouter } from 'next/router';
import { useScrollPosition } from '~/hooks/useScrollPosition';
import { ReactComponent as CloseIcon } from '~/public/images/homePage/close.svg';
import styles from './index.module.less';

const Journey = () => {
  const t = useFm()
  const { locale } = useRouter();
  const [visible, setVisible] = useState(true)
  const { isScrolledPastFirstScreen } = useScrollPosition();

  const handleClose = () => {
    setVisible(false)
  }

  if (!visible) return null;

  return (
    <section className={cls(styles.Journey, {
      [styles.fixed]: isScrolledPastFirstScreen
    })}>
      <div className={styles.journeyWrapper}>
        <img src='/images/homePage/journey.png' alt="journey" />
        <div className={styles.desc} dangerouslySetInnerHTML={{ __html: t('journey_desc') }} />
        <a className={styles.btn} href={`/${locale}/account/register`}>{t('signUp')}</a>
        <CloseIcon onClick={handleClose} />
      </div>

    </section>
  );
};

export default Journey;
