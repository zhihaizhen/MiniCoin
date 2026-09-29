import { FormattedMessage } from 'react-intl';
import ExportedImage from 'next-image-export-optimizer';
import { basePath } from '~/env';
import { CampaignStatus } from '~/enums';
import React, { useMemo } from 'react';
import { useFm } from '@better-bit-fe/base-hooks';
import { AwardItem } from '~/interface';
import { useAwardInfo } from '~/hooks/useAwardInfo';

interface RewardCardProps {
  award: AwardItem;
  status: CampaignStatus | string;
  onRedeem: (award: AwardItem) => void;
  priority?: boolean;
  /** 最后一个卡片：名称与积分使用高亮色 */
  highlightText?: boolean;
}

const RewardCard: React.FC<RewardCardProps> = ({
  award,
  status,
  onRedeem,
  priority,
  highlightText
}) => {
  const t = useFm();

  const { awardDesc, tokenStr, imageUrl } = useAwardInfo(award);

  const { btnText, isDisabled } = useMemo(() => {
    const isEnded = status === CampaignStatus.Ended;
    const isNotStart = status === CampaignStatus.NotStarted
    const isClosed = !!award?.is_close;
    return {
      btnText: isClosed ? t('redeemed') : isEnded ? t('ended') : isNotStart? t('notStart') : t('redeem'),
      isDisabled: isClosed || isEnded || isNotStart
    };
  }, [award, t, status]);

  const highlightClass = highlightText ? 'text-[#1EB16D]' : 'text-text-primary';

  return (
    <div
      className="group border border-solid border-line-border-default bg-bg-secondary relative rounded-xl h-[200px] md:h-[250px] md:hover:border-line-border-hover transition-all duration-300 cursor-pointer">
      <div
        className="overflow-hidden absolute w-full h-full after:content-[''] after:absolute after:left-[25%] after:top-[-60px] after:w-[150px] after:h-[130px] after:bg-[#ABE127] after:blur-2xl after:opacity-0 after:z-5 md:group-hover:after:opacity-100" />

      <div
        className="absolute start-[50%] translate-x-[-55%] md:translate-x-[-50%] w-16 h-16 z-10 md:w-[86px] md:h-[86px] -top-8 md:top-[-50px]">
        <ExportedImage
          className="rounded-full"
          src={`${basePath}/images/gift/${imageUrl}`}
          alt="gift"
          fill
          priority={priority}
          placeholder="blur"
          blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iMTAiIGZpbGw9IiM2NjYiIG9wYWNpdHk9IjAuMyIvPjwvc3ZnPg=="
          sizes="80px"
        />
      </div>

      <div className="relative z-6 flex-1 pb-9 px-4 md:px-9 mt-11 md:mt-[60px]">
        <div className={`text-base md:text-lg font-bold line-clamp-3 text-center ${highlightClass}`}>
          <FormattedMessage
            id="tokenformat"
            defaultMessage={tokenStr}
            values={{
              i: (chunks: React.ReactNode) => (
                <span className={highlightText ? 'text-[#1EB16D]' : 'text-text-brand-default-web'}>
                  {chunks}
                </span>
              ),
            }}
          />
        </div>
        <div className="md:mt-2 text-xs font-semibold text-text-secondary text-center">

          {awardDesc}
        </div>
      </div>

      <div className="absolute w-full px-4 z-11 -bottom-4.5 md:-bottom-4">
        <div className={`text-xs text-center mb-5 ${highlightClass}`}>
          <FormattedMessage
            id="costPoint"
            values={{
              point: <strong className="text-[22px] px-0.5">{award?.points_cost}</strong>
            }}
          />
        </div>
        <button
          type="button"
          disabled={isDisabled}
          className={`w-full h-8 md:h-10 text-xs md:text-sm font-medium rounded-xl transition-colors ${
            isDisabled
              ? 'bg-fill-button-tertiary-default text-text-primary'
              : 'bg-fill-button-primary-default hover:bg-fill-button-brand-default hover:text-black text-text-white-to-black cursor-pointer'
          }`}
          onClick={() => onRedeem(award)}
        >
          {btnText}
        </button>
      </div>
    </div>
  );
};

export default RewardCard;
