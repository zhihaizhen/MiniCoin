import React, { useState, useRef, useEffect, useMemo } from 'react';
import { basePath } from '@better-bit-fe/base-utils';
import { useCampaign } from '~/context';
import { useFm } from '@better-bit-fe/base-hooks';
import { ReactComponent as BackIcon } from '~/public/icons/back.svg';
import { ReactComponent as ForwardIcon } from '~/public/icons/forward.svg';
import styles from './index.module.less';

export interface TaskItem {
  id?: string;
  task_id?: string;
  day_no?: string;
  task_status?: 'Locked' | 'Init' | 'Awarding' | 'Done' | 'Pending' | 'Expired';
  has_reward?: '0' | '1';
  reward_type?: string;
  reward_token?: string;
  reward_amount?: string;
  compare_value?: string;
  archive_value?: string;
  progress_bar?: string;
}

export interface TaskCarouselProps {
  taskItems?: TaskItem[];
  onSelectTask?: (taskItem: TaskItem, index: number) => void;
}

const TaskCarousel: React.FC<TaskCarouselProps> = ({ taskItems: propTaskItems = [], onSelectTask }) => {
  const { campaignDetail } = useCampaign();
  const t = useFm();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  // 从 campaignDetail 中获取 task_items 和 current_day
  const taskItems = useMemo(() => {
    return campaignDetail?.task_items || propTaskItems;
  }, [campaignDetail?.task_items, propTaskItems]);

  const currentDay = campaignDetail?.current_day;

  // 每次滚动的距离(一张卡片宽度 + 间距)
  const SCROLL_DISTANCE = 205; // 185px(卡片宽度) + 20px(间距)

  // 检查滚动状态
  const checkScrollButtons = () => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  // 处理卡片点击
  const handleCardClick = (index: number) => {
    // 如果是拖拽行为,不触发点击
    if (isDraggingRef.current) {
      isDraggingRef.current = false; // 立即重置
      return;
    }

    // 允许点击所有卡片（包括锁定的卡片）
    setSelectedIndex(index);

    // 通知父组件选中的任务
    if (onSelectTask && taskItems[index]) {
      onSelectTask(taskItems[index], index);
    }
  };

  // 处理鼠标按下
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;

    isDraggingRef.current = false;
    startXRef.current = e.pageX - containerRef.current.offsetLeft;
    scrollLeftRef.current = containerRef.current.scrollLeft;

    // 添加鼠标移动和松开事件监听
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // 处理鼠标移动
  const handleMouseMove = (e: MouseEvent) => {
    if (!containerRef.current) return;

    const x = e.pageX - containerRef.current.offsetLeft;
    const distance = Math.abs(x - startXRef.current);

    // 只有移动距离超过5px才算拖拽
    if (distance > 5) {
      e.preventDefault();
      isDraggingRef.current = true;

      const walk = (x - startXRef.current) * 1.5; // 拖拽速度系数
      containerRef.current.scrollLeft = scrollLeftRef.current - walk;
    }
  };

  // 处理鼠标松开
  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  // 处理触摸开始
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!containerRef.current) return;

    isDraggingRef.current = false;
    startXRef.current = e.touches[0].pageX - containerRef.current.offsetLeft;
    scrollLeftRef.current = containerRef.current.scrollLeft;
  };

  // 处理触摸移动
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!containerRef.current) return;

    const x = e.touches[0].pageX - containerRef.current.offsetLeft;
    const distance = Math.abs(x - startXRef.current);

    // 只有移动距离超过5px才算拖拽
    if (distance > 5) {
      isDraggingRef.current = true;

      const walk = (x - startXRef.current) * 1.5; // 拖拽速度系数
      containerRef.current.scrollLeft = scrollLeftRef.current - walk;
    }
  };

  // 处理触摸结束
  const handleTouchEnd = () => {
    // 触摸结束后不需要延迟,因为已经在 handleCardClick 中处理
  };

  // 处理左箭头点击 - 向左滚动
  const handlePrevClick = () => {
    if (containerRef.current && canScrollLeft) {
      containerRef.current.scrollBy({
        left: -SCROLL_DISTANCE,
        behavior: 'smooth'
      });
    }
  };

  // 处理右箭头点击 - 向右滚动
  const handleNextClick = () => {
    if (containerRef.current && canScrollRight) {
      containerRef.current.scrollBy({
        left: SCROLL_DISTANCE,
        behavior: 'smooth'
      });
    }
  };

  // 监听滚动事件
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      checkScrollButtons();
      container.addEventListener('scroll', checkScrollButtons);
      return () => {
        container.removeEventListener('scroll', checkScrollButtons);
      };
    }
  }, []);

  // 当 taskItems 变化时重新检查滚动状态
  useEffect(() => {
    if (taskItems.length > 0) {
      // 使用 setTimeout 确保 DOM 已渲染
      const timer = setTimeout(() => {
        checkScrollButtons();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [taskItems]);

  // 根据 currentDay 自动选中对应的卡片
  useEffect(() => {
    if (taskItems.length === 0) return;

    // 找到 currentDay 对应的卡片索引
    let targetIndex = 0;
    if (currentDay) {
      const dayToFind = currentDay === '0' ? '1' : currentDay;
      const foundIndex = taskItems.findIndex(item => item.day_no === dayToFind);
      if (foundIndex !== -1) {
        targetIndex = foundIndex;
      }
    }

    // 设置选中索引
    setSelectedIndex(targetIndex);

    // 通知父组件
    if (onSelectTask && taskItems[targetIndex]) {
      onSelectTask(taskItems[targetIndex], targetIndex);
    }
  }, [taskItems, currentDay, onSelectTask]);

  // 自动滚动到选中的卡片
  useEffect(() => {
    const selectedCard = cardsRef.current[selectedIndex];
    if (selectedCard && containerRef.current) {
      const container = containerRef.current;
      const cardRect = selectedCard.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      // 计算卡片相对于容器的位置
      const cardCenter = cardRect.left + cardRect.width / 2;
      const containerCenter = containerRect.left + containerRect.width / 2;
      const scrollOffset = cardCenter - containerCenter;

      // 平滑滚动
      container.scrollBy({
        left: scrollOffset,
        behavior: 'smooth'
      });
    }
  }, [selectedIndex]);

  return (
    <div className={styles.carouselWrapper}>
      {/* 左箭头 */}
      <button
        className={`${styles.arrowBtn} ${styles.arrowLeft} ${!canScrollLeft ? styles.disabled : ''}`}
        onClick={handlePrevClick}
        disabled={!canScrollLeft}
      >
        <BackIcon />
      </button>

      {/* 卡片容器 */}
      <div
        className={styles.carouselContainer}
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className={styles.taskCards}>
          {taskItems.map((taskItem, index) => {
            const dayNo = Number(taskItem.day_no || index + 1);
            const taskStatus = taskItem?.task_status || 'Locked';
            const isCompleted = taskStatus === 'Done';
            const isLocked = taskStatus === 'Locked';
            const isSelected = index === selectedIndex;
            // 判断是否是当前天：如果 currentDay 为 '0'，则显示第一天；否则匹配 currentDay
            const isCurrentDay = currentDay === '0'
              ? taskItem.day_no === '1'
              : taskItem.day_no === currentDay;

            return (
              <div
                key={taskItem.id || index}
                ref={(el) => (cardsRef.current[index] = el)}
                className={styles.taskCardWrapper}
              >
                {isCurrentDay && (
                  <div className={styles.cardTooltip}>
                    {t('task-carousel-tooltip', { completed: campaignDetail?.total_completed_days || '0', total: taskItems.length })}
                  </div>
                )}
                <div
                  className={`${styles.taskCard} ${isCompleted ? styles.completed : ''} ${isLocked ? styles.locked : ''} ${isSelected ? styles.selected : ''} ${isCurrentDay ? styles.currentDay : ''}`}
                  onClick={() => handleCardClick(index)}
                >
                  {/* 顶部区域 */}
                  <div className={styles.cardTop}>
                    <div className={styles.taskDay}>{t('task-carousel-day', { day: dayNo })}</div>
                  </div>

                  {/* 中间图标区域 */}
                  <div className={styles.taskIcon}>
                    <img
                      src={`${basePath}/images/task-coin.png`}
                      alt={`Day ${dayNo}`}
                      className={styles.taskCoinImage}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 右箭头 */}
      <button
        className={`${styles.arrowBtn} ${styles.arrowRight} ${!canScrollRight ? styles.disabled : ''}`}
        onClick={handleNextClick}
        disabled={!canScrollRight}
      >
        <ForwardIcon />
      </button>
    </div>
  );
};

export default TaskCarousel;
