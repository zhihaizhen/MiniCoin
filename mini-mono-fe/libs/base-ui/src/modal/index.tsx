// @ts-nocheck
import React, { memo, PropsWithChildren, ReactNode, useRef } from 'react';
import {
  Modal as BaseModal
  // ModalClose,
  // ModalContent,
  // ModalOverlay,
  // BasicModalProps
} from 'antd';
import { CSSTransition } from 'react-transition-group';
import styled from '@emotion/styled';

const transitionName = 'modal-transition';

// const Overlay = styled(ModalOverlay)`
//   position: fixed;
//   top: 0;
//   left: 0;
//   width: 100%;
//   height: 100%;
//   inset: 0;
//   background: rgba(1, 3, 5, 0.8);
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   z-index: 999;
//   padding: 20px 10px;
//   &.${transitionName}-enter {
//     opacity: 0;
//     transform: scale(0.4);
//   }
//   &.${transitionName}-enter-active {
//     opacity: 1;
//     transform: scale(1);
//     transition: all 0.3s ease-in-out;
//   }
//   &.${transitionName}-exit {
//     opacity: 1;
//     transform: scale(1);
//   }
//   &.${transitionName}-exit-active {
//     opacity: 0;
//     transform: scale(0.4);
//     transition: all 0.3s ease-in-out;
//   }
// `;

// const Content = styled(ModalContent)`
//   min-width: 480px;
//   max-width: 100%;
//   min-height: 300px;
//   max-height: calc(100% - 124px);
//   background-color: #16171a;
//   overflow-y: auto;
//   overscroll-behavior: contain;
//   position: relative;
//   border-radius: 8px;
//   padding: 24px;
//   @media (max-width: 767px) {
//     width: calc(100vw - 48px);
//     min-width: unset;
//     max-width: unset;
//     max-height: calc(100% - 160px);
//   }

//   > h2 {
//     font-weight: 600;
//     font-size: 20px;
//     line-height: ${28 / 20};
//     color: #ffffff;
//   }
// `;

// const Close = styled(ModalClose)`
//   width: 12px;
//   height: 12px;
//   border: 4px solid transparent;
//   box-sizing: border-box;
//   background-image: url('');
//   background-size: cover;
//   background-position: center;
//   background-repeat: no-repeat;
//   background-color: transparent;
//   position: absolute;
//   right: 24px;
//   top: 24px;
//   cursor: pointer;
// `;

interface ModalProps {
  title?: ReactNode;
  className?: string;
  contentClassName?: string;
}

export const Modal = memo(function Modal(props: PropsWithChildren<ModalProps>) {
  const {
    title,
    children,
    className = '',
    contentClassName = '',
    ...otherProps
  } = props;
  const nodeRef = useRef<HTMLDivElement>(null);

  return (
    <BaseModal {...otherProps}>
      <CSSTransition
        in={props.visible}
        timeout={300}
        unmountOnExit
        classNames={transitionName}
        nodeRef={nodeRef}
      >
        {/* <Overlay ref={nodeRef} className={className}> */}
        {/* <Content className={contentClassName}> */}
        {Boolean(title) && <h2>{title}</h2>}
        {/* <Close></Close> */}
        {children}
        {/* </Content> */}
        {/* </Overlay> */}
      </CSSTransition>
    </BaseModal>
  );
});
