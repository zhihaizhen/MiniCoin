import React, { useEffect, useState } from "react";
import { basePath } from '@better-bit-fe/base-utils';
import { countdownFormat } from '~/utils';
import { useFm } from '@better-bit-fe/base-hooks';
import dayjs from 'dayjs';
import ExportedImage from 'next-image-export-optimizer';

interface RainCountdownProps {
  targetTime: number; // 时间戳（秒）
  countDownCallback?: () => void;
}

interface ITime {
  day: number;
  hour: number;
  min: number;
  sec: number;
}

const FooterCountDown = ({ targetTime, countDownCallback }: RainCountdownProps) => {
  const t = useFm()
  const [display, setDisplay] = useState<boolean>(true);
  const [time, setTime] = useState<ITime>({
    day: 0,
    hour: 0,
    min: 0,
    sec: 0
  });
  // 每秒更新倒计时
  useEffect(() => {
    if (targetTime <= 0 || dayjs.unix(targetTime).isBefore(dayjs())) return;
    const cb = (data) => {
      setTime({
        day: data.days,
        hour: data.hours,
        min: data.minutes,
        sec: data.seconds,
      })
      if (data.days === 0 && data.hours === 0 && data.minutes === 0 && data.seconds === 0) {
        countDownCallback();
      }
    };

    countdownFormat(targetTime, cb);
  }, [targetTime]);

  if (!display || targetTime <= 0) return null;

  return (
    <div className="fixed bottom-0 z-10 w-full bg-[#2c2f2f] overflow-hidden shadow-lg">
      {/* 顶部横幅 */}
      <div className="bg-[#202420] p-4 flex items-center justify-center relative">
        {/* 斜纹遮罩 */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, rgba(255,255,255,0.05) 0, rgba(255,255,255,0.05) 4px, transparent 4px, transparent 8px)",
          }}
        />

        <div className="relative z-10 flex items-center gap-3">
          <ExportedImage
            src={`${basePath}/images/envIcon.png`}
            alt="gift"
            width={24}
            height={24}
          />
          <span className="text-white text-sm">{t('nextRedRainTime')}</span>
          <span className="text-base text-[#ABE127]">{`${time.day > 0 ? `${time.day}d : ` : ''} ${time.hour}h : ${time.min}m : ${time.sec}s`}</span>
        </div>

        <button
          onClick={() => setDisplay(false)}
          className="w-6 absolute right-4 md:right-10 text-text-secondary cursor-pointer text-xl hover:opacity-70"
        > × </button>
      </div>

    </div>
  );
}

export default FooterCountDown;
