import { updateUserPreferenceSetting } from '@/services/user.service';
import { types, useGlobalState } from '@/store';
import cs from 'classnames';
import { EBookSymbolSetStatus } from 'common/enums/user.enum';
import { message } from 'common/antdComponents';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Style from './setting.module.less';

const preferenceSetArr = [
  {
    descKey: EBookSymbolSetStatus.Booksymbolchangerateset,
  },
  {
    descKey: EBookSymbolSetStatus.Booksymbollastpriceset,
  },
];

const BookSymbolSetting = () => {
  const [globalState, globalDispatch] = useGlobalState();
  const [t] = useTranslation();
  const {
    user: { bookSymbolSetStatus },
  } = globalState;

  const switchPreferSet = ({ descKey }) => {
    updateUserPreferenceSetting({ bookSymbolPreferSet: descKey });
    message.success(t('SuccessfullySet'));
    globalDispatch({
      type: types.SET_BOOK_SYMBOL_PREFER_SETTING,
      status: descKey,
    });
  };

  return (
    <>
      <div className={`${Style["setting-sub-title"]} ${Style["setting-prefer"]}`}>
        {t('bookSymbolPreferSetting')}
      </div>
      <div className={Style["setting-contract__detail"]}>
        <For each="item" of={preferenceSetArr} index="index">
          <div
            className={Style["contract-mode"]}
            key={item.descKey}
            onClick={() => switchPreferSet(item)}
          >
            <div
              className={cs('setting-mode__title', {
                selected: bookSymbolSetStatus === item.descKey,
              })}
            >
              <span
                className={cs('circle-checkbox', {
                  'circle-checkbox__selected':
                    bookSymbolSetStatus === item.descKey,
                })}
              />
              {t(item.descKey)}
            </div>
          </div>
        </For>
      </div>
    </>
  );
};

export default BookSymbolSetting;
