// @ts-nocheck
import React, { useState } from 'react';
import { Checkbox } from 'common/antdComponents';
import { useTranslation } from 'react-i18next';
import ForwardOpenAnimation from './forwardOpenAnimation';
import ForwardCloseAnimation from './forwardCloseAnimation';
import SceneProps from '../types/senceProps';

interface DescList {
  title: string;
  children: string[];
}

/**
 * 正向合约新手引导弹窗
 * @returns
 */
export default ({ close }: SceneProps) => {
  const [checked, setChecked] = React.useState(false); // 不再提示 checkbox
  const [activeIndex, setActiveIndex] = useState(0);

  const [t] = useTranslation();

  const descList: DescList[] = [
    {
      title: t('openAPosition'),
      children: [
        t('openAPostionDesc11'),
        t('openAPostionDesc12'),
        t('openAPostionDesc13'),
        t('openAPostionDesc14'),
      ],
    },
    {
      title: t('closePoz'), // closeThePosition在翻译里面可以干掉
      children: [
        t('openAPostionDesc21'),
        t('openAPostionDesc22'),
        t('openAPostionDesc23'),
      ],
    },
  ];

  const handleChange = (e) => {
    setChecked(e.target.checked);
  };

  const handleClickFeature = () => {
    if (activeIndex === 0) {
      setActiveIndex(1);
    } else {
      // setActiveIndex(0);
      close(checked);
      // close(true);
    }
  };

  const getDescListItem = (data: string[]) => {
    const items: any[] = [];
    data.forEach((item) => {
      items.push(<li key={item}>{item}</li>);
    });
    return items;
  };

  const getDescList = () => {
    const arr: any[] = [];
    descList.forEach((item, index) => {
      arr.push(
        <div className="item" key={item.title}>
          <h3
            className={`tit ${activeIndex === index ? 'active' : ''}`}
            onClick={() => setActiveIndex(index)}
          >
            {index + 1}.{item.title}
          </h3>
          <ul
            className="list"
            style={{ height: activeIndex === index ? '128px' : 0 }}
          >
            {getDescListItem(item.children)}
          </ul>
        </div>,
      );
    });
    return arr;
  };

  return (
    <div className="content-wrap novice-guide-forword">
      <div className="desc-content">
        <h1 className="title">{t('noviceGuideTitle') as React.ReactNode}</h1>
        <div className="desc">{getDescList()}</div>
        <div className="feature">
          <div className="no-prompt">
            <Checkbox  checked={checked} onChange={handleChange}>
              <span>{t('notRemindAgain') as React.ReactNode}</span>
            </Checkbox>
          </div>
          <div className="btns">
            <span onClick={() => handleClickFeature()}>
              {activeIndex === 0
                ? (t('next') as React.ReactNode)
                : (t('completed') as React.ReactNode)}
            </span>
          </div>
        </div>
      </div>
      <div className="animation-wrap">
        {activeIndex === 0 ? (
          <ForwardOpenAnimation />
        ) : (
          <ForwardCloseAnimation />
        )}
      </div>
    </div>
  );
};
