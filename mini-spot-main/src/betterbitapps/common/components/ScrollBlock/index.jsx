import { transformNum } from '@unified/helpers';
import debounce from 'lodash.debounce';
import PropTypes from 'prop-types';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useGlobalState } from '@/store';
import './scrollBlock.less';

const DIRECTION = {
  right: 'add',
  left: 'sub',
};

const ScrollBlock = ({
  children,
  scrollCS,
  containerCS,
  childrenNumber,
  scrollDistance,
}) => {
  const [scrollType, updateScrollType] = useState('left');
  const [isShowScrollbar, setIsShowScrollbar] = useState(false);
  const [distance, setDistance] = useState(() => {
    if (scrollDistance) {
      return scrollDistance;
    }
    const windowWidth = window.innerWidth;
    // eslint-disable-next-line no-nested-ternary
    return windowWidth >= 1770 ? 240 : windowWidth >= 1440 ? 180 : 100;
  });
  const scrollRef = useRef(null);
  const [globalState ] = useGlobalState();
  const updateScrollStatus = useCallback(() => {
    const el = scrollRef.current;
    const { scrollWidth, clientWidth, scrollLeft } = el || {};
    setIsShowScrollbar(clientWidth < scrollWidth);
    if (scrollLeft === 0) {
      updateScrollType('left');
    } else if (scrollWidth <= clientWidth + scrollLeft) {
      updateScrollType('right');
    } else {
      updateScrollType(undefined);
    }
  }, []);

  const handleArrowClick = useCallback(
    (type) => {
      const scrollDom = scrollRef.current;
      if (scrollDom) {
        scrollDom.scrollTo({
          left: transformNum(scrollDom.scrollLeft, distance, DIRECTION[type]),
          behavior: 'smooth',
        });
      }
    },
    [distance],
  );

  const updateDistance = () => {
    if (scrollDistance) {
      return;
    }
    const windowWidth = window.innerWidth;
    if (windowWidth >= 1770) {
      setDistance(240);
    } else if (windowWidth >= 1440) {
      setDistance(180);
    } else {
      setDistance(100);
    }
  };

  const onScroll = debounce((e) => {
    const el = e.target;
    // clientWidth 默认四舍五入，需要通过 getBoundingClientRect 获取 width 属性计算
    const { width } = el.getBoundingClientRect();
    if (el?.scrollLeft === 0) {
      updateScrollType('left');
    } else if (el?.scrollWidth <= Math.ceil(width + el?.scrollLeft)) {
      // scrollWidth 四舍五入，通过 Math.ceil 计算避免存在误差导致判断失效
      updateScrollType('right');
    } else {
      updateScrollType(undefined);
    }
  }, 100);

  const updateScrollBarStatus = useMemo(() => {
    return debounce(() => {
      updateScrollStatus();
      updateDistance();
    }, 500);
  }, [updateScrollStatus]);

  useEffect(() => {
    const timer = setTimeout(() => {
      updateScrollStatus();
    });
    return () => {
      clearTimeout(timer);
    };
  }, [childrenNumber, updateScrollStatus]);

  useEffect(() => {
    window.addEventListener('resize', updateScrollBarStatus);
    return () => {
      window.removeEventListener('resize', updateScrollBarStatus);
    };
  }, [updateScrollBarStatus]);

  useEffect(() => {
    const scrollDom = scrollRef.current;
    if (scrollDom) {
      scrollDom.addEventListener('scroll', onScroll);
    }
    return () => {
      if (scrollDom) {
        scrollDom.removeEventListener('scroll', onScroll);
      }
    };
  }, [onScroll]);

  return (
    <>
      <div className={`scroll-block__container ${containerCS}`}>
        <div
          className={`scroll-arrow arrow-lf ${
            isShowScrollbar && scrollType !== 'left' ? '' : 'hide'
          }`}
          onClick={() => handleArrowClick('left')}
        >
          <span className="icon iconfont icon-down f-12" />
        </div>
        <div
          className={`scroll-details zero-scrollbar ${scrollCS}`}
          ref={scrollRef}
        >
          {children}
        </div>
        <div
          className={`scroll-arrow arrow-rf ${
            isShowScrollbar && scrollType !== 'right' ? '' : 'hide'
          }`}
          onClick={() => handleArrowClick('right')}
        >
          <span className="icon iconfont icon-down f-12" />
        </div>
      </div>
    </>
  );
};

ScrollBlock.defaultProps = {
  scrollCS: '',
  containerCS: '',
  childrenNumber: 0,
  scrollDistance: undefined,
};

ScrollBlock.propTypes = {
  children: PropTypes.array.isRequired,
  scrollCS: PropTypes.string,
  containerCS: PropTypes.string,
  childrenNumber: PropTypes.number,
  scrollDistance: PropTypes.number,
};
export default ScrollBlock;
