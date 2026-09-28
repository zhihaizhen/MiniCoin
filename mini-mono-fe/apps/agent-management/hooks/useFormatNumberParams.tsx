import { useMemo } from 'react';
import { formatNumberClean } from '~/utils/format-number';

const useFormatNumberParams = (val) => {
  return useMemo(
    () =>
      formatNumberClean(val, {
        nullIndicator: '-',
        suffix: '%',
        prefix: ''
      }),
    [val]
  );
};

export default useFormatNumberParams;