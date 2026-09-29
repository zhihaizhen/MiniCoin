// @ts-nocheck
import React,{useEffect, useState} from 'react';
import { useFm } from '@better-bit-fe/base-hooks';
import Style from './index.module.less';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = (props) => {
  const { title } = props;

  return (
    <div className={Style.title}>
      <span>{title}</span>
    </div>
  )
};

export default Header;
