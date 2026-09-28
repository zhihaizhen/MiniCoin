import React, { useEffect, useState } from 'react';
import { Tabs, Dropdown, Select } from 'antd';
import { SwapOutlined } from '@ant-design/icons';
import { useFm } from '@better-bit-fe/base-hooks';
import { langList } from '@better-bit-fe/base-utils';
import MultipleLogin from '~/components/multipleLogin';
import Style from './index.module.less';
import { getLang } from '~/utils';

interface IMiniLoginProps {
  mode: 'login' | 'register';
  walletDetail: {
    visible: boolean;
    address: string;
  };
  changeWalletDetail: () => void;
}
const MiniLogin: React.FC<IMiniLoginProps> = (props) => {
  const { walletDetail, changeWalletDetail, mode } = props;

  const [curLang, setCurLang] = useState(getLang());
  const t = useFm();

  const handleChangeMode = () => {
    const lang = getLang();
    if (mode === 'login') {
      window.location.href = `/${lang}/login/register${window.location.search}`;
    } else {
      window.location.href = `/${lang}/account/login${window.location.search}`;
    }
  };

  const handleChangeLang = (key) => {
    setCurLang(key);
    localStorage.setItem('LANG_KEY', key);
    window.location.href = `/${key}/login`;
  };

  const langItems = langList.map((it) => {
    return {
      key: it.key,
      value: it.key,
      label: (
        <span
          className={
            curLang === it.key ? Style.drawerLangActive : Style.drawerLang
          }
        // onClick={() => handleChangeLang(it.key)}
        >
          {it.label}
        </span>
      )
    };
  });

  const items = [
    {
      key: '1',
      label: mode === 'login' ? t('login-emailTab') : t('signUp-emailTab'),
      children: (
        <MultipleLogin
          mode={mode}
          type="email"
          walletDetail={walletDetail}
          changeWalletDetail={changeWalletDetail}
        />
      )
    },
    {
      key: '2',
      label: mode === 'login' ? t('login-mobileTab') : t('signUp-mobileTab'),
      children: (
        <MultipleLogin
          mode={mode}
          type="mobile"
          walletDetail={walletDetail}
          changeWalletDetail={changeWalletDetail}
        />
      )
    }
  ];

  return (
    <div>
      <div className={Style['mini-login']}>
        <div className={Style['login-container']}>
          <div className={Style['right-part']}>
            <div className={Style.titleContainer}>
              <span className={Style.title}>
                {mode === 'register' ? t('signup-title') : t('title-welcome')}
              </span>
              <span className={Style.switchBtn} onClick={handleChangeMode}>
                <SwapOutlined style={{ marginRight: '4px' }} />
                <span>{mode === 'login' ? t('signUpBtn') : t('loginBtn')}</span>
              </span>
            </div>

            <Tabs
              defaultActiveKey="1"
              items={items}
              tabBarExtraContent={
                <Select
                  defaultValue={curLang}
                  style={{ width: 120 }}
                  onChange={handleChangeLang}
                  options={langItems}
                />
                // <Dropdown
                //   overlayClassName={Style.langDropDown}
                //   // align={{ offset: [0, 18] }}
                //   menu={{ items: langItems }}
                //   placement="bottomRight"
                // >
                //   <span className={Style.langIcon} />
                // </Dropdown>
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiniLogin;
