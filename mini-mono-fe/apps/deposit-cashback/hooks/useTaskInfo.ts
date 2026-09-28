import { useState, useEffect } from 'react';
import { getUserTaskInfo } from '../api';

export interface TaskInfo {
  task_date: number;
  campaign_name: string;
  task_status: 'Locked' | 'Init' | 'Awarding' | 'Done' | 'Expired';
  award_token: string;
  award_volume: number;
  task_id: number;
  process_bar: number;
  compare_value: string;
  archive_value: string;
}

/**
 * 管理用户任务信息的 hook
 * @returns 任务信息数据和加载状态
 */
export function useTaskInfo() {
  const [taskInfo, setTaskInfo] = useState<TaskInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchTaskInfo = async (isLoading=true) => {
     try {
       setLoading(isLoading);
       const res = await getUserTaskInfo();
       setTaskInfo(res || []);
     } catch (err) {
       console.error('Failed to fetch task info:', err);
       setTaskInfo([]);
     } finally {
       setLoading(false);
     }
  };

  useEffect(() => {
    fetchTaskInfo(true);
  }, []);

  return {
    fetchTaskInfo,
    taskInfo,
    loading
  };
}
