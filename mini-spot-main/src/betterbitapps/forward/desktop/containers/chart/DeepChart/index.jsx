import React, { useEffect } from 'react';
import { useCurSymbolConfig } from '@/store-hooks/use-symbol-config';
import { DeepChartCommon } from 'common/components';
import useCurSymbolQuoteStream from 'common/public-ws/stream-hooks/use-instrument-stream';
import useDepthKineStream from 'common/public-ws/stream-hooks/use-depthKine-stream';
import { types, useGlobalState } from '@/store';
import PropTypes from 'prop-types';

const DeepChart = ({ resize }) => {
  const { depthKineData, depthLoaded } = useDepthKineStream();
  const { lastPriceNumber } = useCurSymbolQuoteStream();
  const [state, dispatchGlobal] = useGlobalState();
  const { tickSize, tickSizeFraction, lotFraction } = useCurSymbolConfig();

  useEffect(() => {
    dispatchGlobal({ type: types.SET_DEPTH_KLINE_VISIBLE, visible: true });
    return () => {
      dispatchGlobal({ type: types.SET_DEPTH_KLINE_VISIBLE, visible: false });
    };
  }, []);
  return (
    <DeepChartCommon
      resize={resize}
      loaded={depthLoaded}
      depthKineData={depthKineData}
      lastPrice={Number(lastPriceNumber) || 0}
      lotFraction={lotFraction}
      tickSizeFraction={tickSizeFraction}
      tickSize={tickSize}
    />
  );
};

DeepChart.defaultProps = {
  resize: {},
};

DeepChart.propTypes = {
  resize: PropTypes.object,
};

export default DeepChart;
