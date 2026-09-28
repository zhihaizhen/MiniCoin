// @ts-nocheck
import React, { CSSProperties } from 'react';
import styled from '@emotion/styled';

interface Props {
  style?: CSSProperties;
  show: boolean;
}

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
`;

const Dot = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
`;

const Start = styled(Dot)`
  margin-right: 12px;
  animation: loading-dot-start 1.6s step-start infinite;
  @keyframes loading-dot-start {
    0% {
      background: rgba(255, 177, 26, 0.1);
    }
    33% {
      background: #ffb11a;
    }
    66% {
      background: rgba(255, 177, 26, 0.5);
    }
    100% {
      background: rgba(255, 177, 26, 0.1);
    }
  }
`;

const Middle = styled(Dot)`
  margin-right: 12px;
  animation: loading-dot-middle 1.6s step-start infinite;
  @keyframes loading-dot-middle {
    0% {
      background: rgba(255, 177, 26, 0.5);
    }
    33% {
      background: rgba(255, 177, 26, 0.1);
    }
    66% {
      background: #ffb11a;
    }
    100% {
      background: rgba(255, 177, 26, 0.5);
    }
  }
`;

const End = styled(Dot)`
  animation: loading-dot-end 1.6s step-start infinite;
  @keyframes loading-dot-end {
    0% {
      background: #ffb11a;
    }
    33% {
      background: rgba(255, 177, 26, 0.5);
    }
    66% {
      background: rgba(255, 177, 26, 0.1);
    }
    100% {
      background: #ffb11a;
    }
  }
`;

export function Loading(props: Props) {
  const { style, show } = props;

  if (!show) {
    return null;
  }

  return (
    <Wrapper style={style}>
      <Start />
      <Middle />
      <End />
    </Wrapper>
  );
}
export default Loading;
