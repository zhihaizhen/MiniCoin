// @ts-nocheck
import { act } from '@testing-library/react-hooks';
import { Slider } from 'antd';
import React, { useEffect, useState, useMemo } from 'react';
import './index.less';

type IProps = {
  qtyValue: number | undefined;
  handleQtySelect: (val: number) => void;
  sliderSelections: object;
  min?: number;
  max?: number;
  step?: number;
  tipFormatter?: (val: number) => string;
};

const QtySlider = ({
  qtyValue,
  handleQtySelect,
  sliderSelections,
  step,
  min,
  max,
  tipFormatter,
}: IProps) => {
  const [sliderValue, setSliderValue] = useState(qtyValue);
  useEffect(() => {
    if(!qtyValue){
      setSliderValue(0);
      return
    }
    setSliderValue(qtyValue*100);
  }, [qtyValue]);

  const marks = useMemo(()=>{
    const res = {};
    const keyList = Object.keys(sliderSelections).sort() 
    keyList.forEach(key =>{
      const newKey = key * 100;
      res[newKey] = sliderSelections[key]   
     }) 
    return res
  },[sliderSelections])

  const handleChange = (v) =>{
    handleQtySelect(v/100)
  }

  return (
    <div className="qty-slider-container">
      <Slider
        onChange={handleChange}
        value={sliderValue}
        tooltip={{
          formatter: (val)=> <span> {`${parseInt(val, 10)}%`}</span>,

        }}
        marks={marks}
        min={0}
        max={100}
      />
    </div>
  );
};

QtySlider.defaultProps = {
  min: 0,
  max: 1,
  step: 0.01,
  tipFormatter: (val: number) => `${parseInt(`${val * 100}`, 10)}%`,
};

export default QtySlider;
