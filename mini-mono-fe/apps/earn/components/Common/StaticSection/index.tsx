import { ReactComponent as CardIcon1 } from '~/public/images/card1.svg';
import { ReactComponent as CardIcon2 } from '~/public/images/card2.svg';
import { ReactComponent as CardIcon3 } from '~/public/images/card3.svg';
import { ReactComponent as CardIcon4 } from '~/public/images/card4.svg';
import { ReactComponent as CardIcon5 } from '~/public/images/card5.svg';
import { ReactComponent as CardIcon6 } from '~/public/images/card6.svg';
import { useFm } from '@better-bit-fe/base-hooks';

type FeatureSectionType = 'earn' | 'loan';

interface FeatureSectionProps {
  type?: FeatureSectionType;
}

const CARD_ICONS = [CardIcon1, CardIcon2, CardIcon3, CardIcon4, CardIcon5, CardIcon6];

const TYPE_OFFSET: Record<FeatureSectionType, number> = { earn: 0, loan: 3 };

export default function FeatureSection({ type = 'earn' }: FeatureSectionProps) {
  const t = useFm();
  const offset = TYPE_OFFSET[type];

  const features = CARD_ICONS.slice(offset, offset + 3).map((Icon, i) => {
    const n = offset + i + 1;
    return { title: t(`card-title-${n}`), desc: t(`card-content-${n}`), icon: <Icon /> };
  });

  return (
    <section className="pt-16 md:pt-20">
      <h2 className="text-center text-3xl font-bold mb-12">
        {t('cart-group-title')}
      </h2>
      <div className="grid md:grid-cols-3 gap-8">
        {features.map((item, i) => (
          <div
            key={i}
            className="flex flex-row md:flex-col bg-white rounded-2xl md:border border-gray-200 md:p-8 text-center transition hover:shadow-lg"
          >
            <div className="flex justify-center items-center mb-6 w-[52px] md:w-auto h-[52px] md:h-auto bg-fill-button-secondary-default md:bg-transparent rounded-full p-3">
              {item.icon}
            </div>
            <div className="flex flex-col items-start md:items-center ml-4 md:ml-0">
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-500 text-sm">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
