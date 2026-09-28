import dayjs from 'dayjs';
import QRCode from 'qrcode';

// ==================== Constants ====================

const TIME_UNITS = {
  MS_PER_SECOND: 1000,
  MS_PER_MINUTE: 60 * 1000,
  MS_PER_HOUR: 60 * 60 * 1000,
  MS_PER_DAY: 24 * 60 * 60 * 1000
} as const;

const ZERO_COUNTDOWN: CountdownParts = {
  days: '00',
  hours: '00',
  minutes: '00',
  seconds: '00'
} as const;

const PHRASE_POSTER_CONFIG = {
  width: 644,
  height: 960,
  qrCodeWidth: 270,
  qrCodeMargin: 2,
  qrCodeX: -140,
  qrCodeY: -105,
  borderRadius: 8
} as const;

const POSTER_CONFIG = {
  width: 560,
  height: 360,
  qrCodeWidth: 68,
  qrCodeMargin: 2,
  qrCodeX: -250,
  qrCodeY: 100,
  borderRadius: 4,
  textX: -170,
  textY: 150,
  font: '700 18px Poppins',
  textColor: '#F5F5F5'
} as const;

const POSTER_CONFIG_MB = {
  width: 315,
  height: 456,
  qrCodeWidth: 68,
  qrCodeMargin: 2,
  qrCodeX: 70,
  qrCodeY: 140,
  borderRadius: 4
} as const;

const CANVAS_DPR = 3;
// const CANVAS_DPR = typeof window !== 'undefined' ? (window.devicePixelRatio || 4) : 4;

// ==================== Types ====================

export type CountdownParts = {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
};

type CanvasConfig = {
  width: number;
  height: number;
  qrCodeWidth: number;
  qrCodeX: number;
  qrCodeY: number;
  borderRadius: number;
};

// ==================== Utilities ====================

const padZero = (value: number): string => value.toString().padStart(2, '0');

const calculateTimeComponents = (milliseconds: number): CountdownParts => {
  const days = Math.floor(milliseconds / TIME_UNITS.MS_PER_DAY);
  const hours = Math.floor((milliseconds % TIME_UNITS.MS_PER_DAY) / TIME_UNITS.MS_PER_HOUR);
  const minutes = Math.floor((milliseconds % TIME_UNITS.MS_PER_HOUR) / TIME_UNITS.MS_PER_MINUTE);
  const seconds = Math.floor((milliseconds % TIME_UNITS.MS_PER_MINUTE) / TIME_UNITS.MS_PER_SECOND);

  return {
    days: padZero(days),
    hours: padZero(hours),
    minutes: padZero(minutes),
    seconds: padZero(seconds)
  };
};

const isValidTimestamp = (timestamp: number | undefined | null): timestamp is number => {
  return typeof timestamp === 'number' && Number.isFinite(timestamp);
};

const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
};

const createHiddenCanvas = (width: number, height: number): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  Object.assign(canvas.style, {
    position: 'fixed',
    width: '0',
    height: '0',
    opacity: '0'
  });
  canvas.width = width * CANVAS_DPR;
  canvas.height = height * CANVAS_DPR;
  document.body.appendChild(canvas);
  return canvas;
};

const setupCanvasContext = (
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
): CanvasRenderingContext2D => {
  const ctx = canvas.getContext('2d')!;

  // 启用图像平滑以提高渲染质量
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.scale(CANVAS_DPR, CANVAS_DPR);
  ctx.translate(width / 2, height / 2);

  ctx.beginPath();
  ctx.roundRect(-width / 2, -height / 2, width, height, 8);
  ctx.clip();

  return ctx;
};

const drawScaledImage = (
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  canvasWidth: number,
  canvasHeight: number
): void => {
  const scale = Math.min(canvasWidth / img.width, canvasHeight / img.height);
  const scaledWidth = img.width * scale;
  const scaledHeight = img.height * scale;
  ctx.drawImage(img, -scaledWidth / 2, -scaledHeight / 2, scaledWidth, scaledHeight);
};

const drawRoundedQRCode = (
  ctx: CanvasRenderingContext2D,
  qrImg: HTMLImageElement,
  x: number,
  y: number,
  size: number,
  borderRadius: number
): void => {
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, size, size, borderRadius);
  ctx.clip();
  ctx.drawImage(qrImg, x, y, size, size);
  ctx.restore();
};

const renderCanvas = (
  config: CanvasConfig,
  bgImg: HTMLImageElement,
  qrImg: HTMLImageElement,
  text?: string,
  charImg?: HTMLImageElement
): string => {
  const canvas = createHiddenCanvas(config.width, config.height);

  try {
    const ctx = setupCanvasContext(canvas, config.width, config.height);
    drawScaledImage(ctx, bgImg, config.width, config.height);
    if (charImg) {
      ctx.drawImage(
        charImg,
        -45,
        -290,
        80,
        80
      );
    }
    drawRoundedQRCode(
      ctx,
      qrImg,
      config.qrCodeX,
      config.qrCodeY,
      config.qrCodeWidth,
      config.borderRadius
    );

    if (text) {
      ctx.textBaseline = 'middle';
      ctx.font = POSTER_CONFIG.font;
      ctx.fillStyle = POSTER_CONFIG.textColor;
      ctx.fillText(text, POSTER_CONFIG.textX, POSTER_CONFIG.textY);
    }

    return canvas.toDataURL('image/png');
  } finally {
    document.body.removeChild(canvas);
  }
};

// ==================== Exported Functions ====================

export const countdownFormat = (
  endUnixSeconds: number | undefined | null,
  onTick: (parts: CountdownParts) => void
): (() => void) => {
  let intervalId: ReturnType<typeof setInterval> | undefined;

  const cleanup = () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = undefined;
    }
  };

  const emitZero = () => {
    cleanup();
    onTick(ZERO_COUNTDOWN);
  };

  if (!isValidTimestamp(endUnixSeconds)) {
    emitZero();
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return () => {};
  }

  const updateCountdown = () => {
    const now = dayjs().unix();
    if (endUnixSeconds <= now) {
      emitZero();
      return;
    }

    const msRemaining = (endUnixSeconds - now) * TIME_UNITS.MS_PER_SECOND;
    onTick(calculateTimeComponents(msRemaining));
  };

  updateCountdown();
  intervalId = setInterval(updateCountdown, TIME_UNITS.MS_PER_SECOND);

  return cleanup;
};

export const generatePhrasePoster = async (
  bgUrl: string,
  charUrl: string,
  qrcodeContent: string
): Promise<string> => {
  try {
    const [bgImg, charImg, qrDataUrl] = await Promise.all([
      loadImage(bgUrl),
      loadImage(charUrl),
      QRCode.toDataURL(qrcodeContent, {
        width: PHRASE_POSTER_CONFIG.qrCodeWidth,
        margin: PHRASE_POSTER_CONFIG.qrCodeMargin
      })
    ]);

    const qrImg = await loadImage(qrDataUrl);

    return renderCanvas(
      {
        width: PHRASE_POSTER_CONFIG.width,
        height: PHRASE_POSTER_CONFIG.height,
        qrCodeWidth: PHRASE_POSTER_CONFIG.qrCodeWidth,
        qrCodeX: PHRASE_POSTER_CONFIG.qrCodeX,
        qrCodeY: PHRASE_POSTER_CONFIG.qrCodeY,
        borderRadius: PHRASE_POSTER_CONFIG.borderRadius
      },
      bgImg,
      qrImg,
      '',
      charImg
    );
  } catch (err) {
    console.error('【Poster generation error】', err);
    throw err;
  }
};

export const generatePoster = async (
  imageUrl: string,
  qrcodeContent='none',
  text = '',
  isMb = false
): Promise<string> => {
  try {
    const config = isMb ? POSTER_CONFIG_MB : POSTER_CONFIG;

    const [bgImg, qrDataUrl] = await Promise.all([
      loadImage(imageUrl),
      QRCode.toDataURL(qrcodeContent, {
        width: config.qrCodeWidth,
        margin: config.qrCodeMargin
      })
    ]);

    const qrImg = await loadImage(qrDataUrl);

    return renderCanvas(
      {
        width: config.width,
        height: config.height,
        qrCodeWidth: config.qrCodeWidth,
        qrCodeX: config.qrCodeX,
        qrCodeY: config.qrCodeY,
        borderRadius: config.borderRadius
      },
      bgImg,
      qrImg,
      !isMb && text ? text : undefined
    );
  } catch (err) {
    console.error('【Poster generation error】', err);
    throw err;
  }
};
