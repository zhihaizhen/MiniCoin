import React, { useEffect, useState } from 'react';
import { ReactComponent as WarnIcon } from '~/public/images/warnIcon.svg';
import { useFm } from '@better-bit-fe/base-hooks';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { getCampaignDetailsPublic, joinCampaign } from '~/api';
import { message, Modal } from 'antd';
import { formatThousandDigit, handleRegisterJumpWithReturnPage } from '~/utils';
import EmptyState from '~/components/EmptyState';
import { basePath, goPage, isApp } from '@better-bit-fe/base-utils';
import ExportedImage from 'next-image-export-optimizer';
import { ReactComponent as MoreIcon } from '~/public/images/more.svg';
import { ReactComponent as LessIcon } from '~/public/images/less.svg';

/* 0为非限制，1为已限制 */
enum LimitTypes {
  LIMIT = "1",
  FREE = "0"
}
export interface LevelItem {
  /** 档位ID */
  id: number;
  /** 排序序号 */
  order_no: number;
  /** 充值金额 */
  recharge_amount: number;
  /** 返现天数 */
  cashback_days: number;
  /** 每日返现金额 */
  daily_cashback_amount: number;
  /** 每日交易量要求 */
  daily_trade_amount: number;
  /** 总返现 */
  cashback_amount: number;
  /** 显示名额已满状态，用户无法选择 */
  register_limit: LimitTypes;
}

interface IProps {
  registerCallback: () => void;
  levelList: LevelItem[];
  tloading?: boolean;
}
const TaskList = ({ levelList, registerCallback, tloading }: IProps) => {

  const t = useFm();
  const { isLogin } = useUserInfo();
  const [isOpenConfirm, setIsOpenConfirm] = useState(false);
  const [levelId, setLevelId] = useState<number>(0);
  const [isMore, setIsMore] = useState<boolean>(!isApp());

  // const [levelList, setLevelList] = useState<LevelItem[]>(null)

  const [loading, setLoading] = useState<boolean>(tloading);

  // useEffect(() => {
  //   setLoading(true)
  //   getCampaignDetailsPublic().then(res => {
  //     console.log('getCampaignDetailsPublic---', res);
  //     setLevelList(res.level_list || [])
  //   }).finally(() => setLoading(false))
  // }, []);

  useEffect(() => {
    setLoading(tloading)
  }, [tloading]);

  const onOenConfirm = (item: LevelItem) => {
    if (item.register_limit === LimitTypes.LIMIT) return;
    if (!isLogin) {
      const isAppPlatform = isApp();
      if (isAppPlatform) {
        goPage('login');
      } else {
        handleRegisterJumpWithReturnPage();
      }
      return;
    }

    setLevelId(item.id);
    setIsOpenConfirm(true)
  }

  const onApply = () => {
    setIsOpenConfirm(false);
    joinCampaign({ "level_id": levelId }).then((res: string) => {
      if (res === 'success') {
        message.success(t('applySuccess'));
      }
      registerCallback()
    }).catch(err => {
      if (err?.code === 35620005) {
        message.warning(t('register-no-way'));
        return
      }
      if (err?.code === 35600004) {
        message.warning(t('register-limit-tips'));
        return;
      }
      message.error(err?.message || 'register error');
    })
  }

  const SubTitle = ({ content }) => {
    return (
      <p className="md:max-w-[312px] text-text-secondary text-xs md:text-sm flex items-center before:content-[''] before:inline-block before:w-1 before:h-1 before:bg-[#666A6C] before:rounded-full before:mr-1 mt-1">
        {content}
      </p>
    );
  };
  return (
    <div className="px-4 md:px-0" id="taskList">
      {loading || !levelList ? (
        <>
          <div className="h-8 md:h-10 w-48 md:w-64 bg-gray-700 rounded animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="w-full md:w-[588px] px-4 md:px-6 py-6 md:py-9 border border-line-border-default rounded-2xl animate-pulse"
              >
                <div className="flex gap-4 md:gap-6">
                  <div className="hidden md:block w-12 h-12 bg-gray-700 rounded" />
                  <div className="flex-1">
                    <div className="h-6 w-64 bg-gray-700 rounded mb-4" />
                    <div className="space-y-2">
                      <div className="h-4 w-48 bg-gray-700 rounded" />
                      <div className="h-4 w-56 bg-gray-700 rounded" />
                      <div className="h-4 w-52 bg-gray-700 rounded" />
                    </div>
                  </div>
                </div>
                <div className="mt-4 w-full md:w-[100px] h-10 md:h-12 bg-gray-700 rounded-full" />
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* 空状态 */}
          <h2 className="text-text-white text-2xl md:text-[32px] font-semibold">
            {t('invited-user-activity', '受邀用户专享活动')}
          </h2>
          {levelList && levelList.length === 0 ? (
            <EmptyState title="empty-title" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
              {levelList &&
                levelList.slice(0, isMore ? levelList.length : 5).map((item) => (
                  <div
                    key={item.id}
                    className="relative w-full md:w-[588px] px-4 md:px-6 py-6 md:py-9 border border-line-border-default hover:border-text-brand-default rounded-2xl
                    flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6 cursor-pointer group"
                  >
                    <div className="flex justify-start items-center gap-4 md:gap-6">
                      <div className="hidden md:block">
                        <ExportedImage
                          src={`${basePath}/images/taskIcon.png`}
                          alt="task"
                          width={76}
                          height={76}
                        />
                      </div>

                      <div>
                        <div className="text-text-white text-lg md:text-xl mb-2.5">
                          {t('deposit-get2', {
                            value: formatThousandDigit(
                              String(item.recharge_amount)
                            ),
                            cashback: formatThousandDigit(
                              String(item.cashback_amount)
                            )
                          })}
                          {/*充 {item.recharge_amount}, 返{item.recharge_amount}*/}
                        </div>
                        <SubTitle
                          content={`${t(
                            'day-trade-amount'
                          )} ${formatThousandDigit(
                            String(item.daily_trade_amount)
                          )} USDT`}
                        />
                        {/*<SubTitle*/}
                        {/*  content={`${t(*/}
                        {/*    'day-get-amount'*/}
                        {/*  )} ${formatThousandDigit(*/}
                        {/*    String(item.daily_cashback_amount)*/}
                        {/*  )} USDT`}*/}
                        {/*/>*/}
                        {/*<SubTitle*/}
                        {/*  content={`${t('get-interval')} ${formatThousandDigit(*/}
                        {/*    String(item.cashback_days)*/}
                        {/*  )} ${t('day')}`}*/}
                        {/*/>*/}
                      </div>
                    </div>
                    <div
                      onClick={() => onOenConfirm(item)}
                      className={`md:absolute right-4 flex md:hidden group-hover:flex justify-center items-center h-10 md:h-12 bg-fill-button-secondary-default rounded-xl
                      w-full md:w-auto min-w-[100px] text-text-brand-default text-sm cursor-pointer select-none ${
                        item.register_limit === LimitTypes.LIMIT
                          ? 'opacity-70'
                          : 'hover:opacity-90'
                      }`}
                    >
                      {item.register_limit === LimitTypes.LIMIT
                        ? t('register-limit')
                        : t('join-activity')}
                    </div>
                  </div>
                ))}

              {levelList?.length > 5 && (
                <div className="md:hidden flex justify-center items-center text-sm text-text-primary">
                  <div
                    className="cursor-pointer flex items-center gap-1"
                    onClick={() => setIsMore((visible) => !visible)}
                  >
                    {!isMore ? (
                      <>
                        {t('more')} <MoreIcon className="text-xl" />
                      </>
                    ) : (
                      <>
                        {t('hide')} <LessIcon className="text-xl" />
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      <Modal
        open={isOpenConfirm}
        centered
        footer={null}
        closable={false}
        className=" [&_.ant-modal-content]:md:w-[440px] [&_.ant-modal-content]:bg-fill-modal! [&_.ant-modal-content]:p-0!"
      >
        <div className="flex flex-col justify-center items-center gap-6 p-6">
          <WarnIcon className="w-14 h-15 md:w-[72px] md:h-[72px] text-text-brand-default" />

          <p className="text-white text-sm md:text-base px-6 text-center">
            {t('joyin-act-tips')}
          </p>
          <div className="w-full flex justify-between items-center gap-6">
            <div
              onClick={() => setIsOpenConfirm(false)}
              className="bg-bg-tertiary cursor-pointer p-3 flex justify-center items-center text-white text-sm rounded-xl flex-1 hover:opacity-90"
            >
              {t('cancel')}
            </div>
            <div
              onClick={onApply}
              className="bg-text-brand-default cursor-pointer p-3 flex justify-center items-center text-text-black text-sm rounded-xl flex-1 hover:opacity-90"
            >
              {t('join-activity')}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TaskList;
