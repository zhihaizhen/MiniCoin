import { basePath, goPage } from '@better-bit-fe/base-utils';
import ExportedImage from 'next-image-export-optimizer';
import React, { memo, useEffect, useState } from 'react';
import { useUserInfo } from '@better-bit-fe/base-provider';
import ComposedDialog from '~/components/ComposedDialog';
import { CampaignDetail } from '~/interface';
import { CampaignStatus, CharStatus } from '~/enums';
import RecordsDialog from '~/components/RecordsDialog';
import ViewPhraseDialog from '~/components/ViewPhraseDialog';
import SharePhraseDialog from '~/components/SharePhraseDialog';
import { useFm } from '@better-bit-fe/base-hooks';

export interface LotteryChar {
  charId: number;
  charContent: string;
  charType: string;
  count: number;
  sortOrder: number;
}


const CHAR_IDS = [2, 3, 4, 5, 1];
const CHAR_ORDER_MAP: Record<string, number> = {
  lottery_char_2: 0,
  lottery_char_3: 1,
  lottery_char_4: 2,
  lottery_char_5: 3,
  lottery_char_1: 4
};

const BLUR_PLACEHOLDER = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAE/wH+q9GJ+wAAAABJRU5ErkJggg==';

const createDefaultChars = (): LotteryChar[] =>
  CHAR_IDS.map((id) => ({
    charId: id,
    charContent: `lottery_char_${id}`,
    charType: `lottery_char_${id}`,
    count: 0,
    sortOrder: id
  }));

const sortCharsByOrder = (chars: LotteryChar[]): LotteryChar[] =>
  [...chars].sort(
    (a, b) => (CHAR_ORDER_MAP[a.charType] ?? 0) - (CHAR_ORDER_MAP[b.charType] ?? 0)
  );

const CharItem = memo(({
                         item,
                         itemClick,
                         className
                       }: {
  item: LotteryChar;
  itemClick: (item: LotteryChar) => void;
  className: string;
}) => {
  const hasItems = item.count > 0;
  return (
    <div
      className={`${className} relative cursor-pointer`}
      key={item.charId}
      onClick={() => itemClick(item)}
    >
      {hasItems ? (
        <div className="flex items-center justify-center">
          <div className="relative w-5 md:w-10 h-5 md:h-10 mt-4.5 md:mt-9">
            <ExportedImage
              className="z-1"
              src={`${basePath}/images/${item.charType}.png`}
              alt="char"
              fill
              loading="lazy"
              placeholder="blur"
              blurDataURL={BLUR_PLACEHOLDER}
            />
          </div>

          <ExportedImage
            src={`${basePath}/images/lottery_char_bg_red.png`}
            alt="char-bg"
            fill
            loading="lazy"
            placeholder="blur"
            blurDataURL={BLUR_PLACEHOLDER}
          />
        </div>
      ) : (
        <ExportedImage
          src={`${basePath}/images/lottery_char_empty.png`}
          alt="lottery_char_empty"
          fill
          loading="lazy"
          placeholder="blur"
          blurDataURL={BLUR_PLACEHOLDER}
        />
      )}

      {hasItems && (
        <div className="min-w-3.5 min-h-3.5 absolute -right-2 md:-right-3 -top-1 px-[5px] md:px-2 bg-[#FFC67F] rounded-full text-[11px] md:text-base text-[#9F5B06] font-bold flex items-center justify-center border border-[#FFD897]">
          {item.count}
        </div>
      )}
    </div>
  );
});


const CollectGather = ({
  campaignDetail,
  userCollects,
  callback
}: {
  campaignDetail: CampaignDetail;
  userCollects: any;
  callback: () => void;
}) => {
  const t = useFm();
  const { isLogin } = useUserInfo();

  const [myCollects, setMyCollects] = useState<LotteryChar[]>(
    createDefaultChars()
  );
  const [charStatus, setCharStatus] = useState<CharStatus>(CharStatus.Not);
  const [dialogStates, setDialogStates] = useState({
    isComposedOpen: false,
    isRecordsOpen: false,
    isViewPhraseOpen: false,
    isShareOpen: false
  });
  const [selectedPhrase, setSelectedPhrase] = useState<LotteryChar>(null);

  const isRewardTime = campaignDetail?.campaign_status === CampaignStatus.OnReward; // 是否处于领取状态

  const isComposed = charStatus === CharStatus.Done; // 已合成
  const isNotReward = charStatus === CharStatus.Not; // 未合成且不具备合成条件
  const isAbleReward = charStatus === CharStatus.Going; // 未合成且具备合成条件

  // 未登录/ 非抽奖时间/ 未合成且不具备合成条件
  const shouldDisableButton = () => !isLogin || !isRewardTime || isNotReward;

  const getButtonImage = () =>
    shouldDisableButton() ? 'buttonBgDisabled' : 'buttonBgMax';

  const openDialog = (dialogName: keyof typeof dialogStates) => {
    setDialogStates((prev) => ({ ...prev, [dialogName]: true }));
  };

  const closeDialog = (dialogName: keyof typeof dialogStates) => {
    setDialogStates((prev) => ({ ...prev, [dialogName]: false }));
  };

  const handleComposeClick = () => {
    if (!isLogin) {
      goPage('login');
      return;
    }

    if (shouldDisableButton()) return;

    if (isComposed) {
      openDialog('isRecordsOpen');
      return;
    }
    if (isAbleReward) {
      openDialog('isComposedOpen');
    }
  };

  const handleViewPhrase = (item: LotteryChar) => {
    if (!isLogin || item.count <= 0) return;

    setSelectedPhrase(item);
    openDialog('isViewPhraseOpen');
  };

  const handleViewFromComposed = () => {
    closeDialog('isComposedOpen');
    openDialog('isRecordsOpen');
  };

  const handleShareFromView = () => {
    closeDialog('isViewPhraseOpen');
    openDialog('isShareOpen');
  };

  useEffect(() => {
    setCharStatus(userCollects?.char_status || CharStatus.Not);

    if (Array.isArray(userCollects?.char_list)) {
      setMyCollects(sortCharsByOrder(userCollects.char_list));
    }
  }, [userCollects]);

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <div
        className="relative w-[216px] h-[85px] font-bold text-text-white cursor-pointer flex items-start justify-center"
        onClick={handleComposeClick}
      >
        <div className="text-[22px] mt-2.5 md:mt-3 z-1">
          {isComposed ? t('checkRecords') : t('composeNow')}
        </div>
        <ExportedImage
          className="z-0"
          src={`${basePath}/images/${getButtonImage()}.png`}
          alt="buttonBg"
          fill
          loading="lazy"
        />
      </div>

      {/* Desktop View */}
      <div className="hidden md:flex justify-between mt-2 gap-[25px]">
        {myCollects.map((item) => (
          <CharItem
            key={item.charId}
            item={item}
            itemClick={handleViewPhrase}
            className="w-[105px] h-[150px]"
          />
        ))}
      </div>

      {/* Mobile View */}
      <div className="md:hidden w-full h-[170px] relative mt-[-38px]">
        <ExportedImage
          src={`${basePath}/images/collect-box.png`}
          alt="box-h5"
          fill
          loading="lazy"
          placeholder="blur"
          blurDataURL={BLUR_PLACEHOLDER}
          sizes="100vw"
        />
        <div className="absolute w-full inset-0 flex items-center justify-between px-11">
          {myCollects.map((item) => (
            <CharItem
              key={item.charId}
              item={item}
              className="w-12 h-[69px]"
              itemClick={handleViewPhrase}
            />
          ))}
        </div>
      </div>

      <ComposedDialog
        open={dialogStates.isComposedOpen}
        close={() => closeDialog('isComposedOpen')}
        view={handleViewFromComposed}
        callback={callback}
      />
      <RecordsDialog
        open={dialogStates.isRecordsOpen}
        close={() => closeDialog('isRecordsOpen')}
      />
      <ViewPhraseDialog
        phrase={selectedPhrase}
        open={dialogStates.isViewPhraseOpen}
        callback={handleShareFromView}
        close={() => closeDialog('isViewPhraseOpen')}
      />
      <SharePhraseDialog
        phrase={selectedPhrase}
        modalOpen={dialogStates.isShareOpen}
        onClose={() => closeDialog('isShareOpen')}
      />
    </div>
  );
};

export default CollectGather;
