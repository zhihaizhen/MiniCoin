import { Env } from '@region-lib/env';
import { fetch } from '@better-bit-fe/base-utils';

const { API_HOST } = Env;

const URL = {
  campainDetalsPrivate: `${API_HOST}/rewards/private/v1/recharge/task/user-campaign-info`,
  campainDetalsPublic: `${API_HOST}/rewards/public/v1/recharge/task/user-campaign-info`,
  joinCampaign: `${API_HOST}/rewards/private/v1/recharge/task/user-campaign-register`,
  userCashbackRecord: `${API_HOST}/rewards/private/v1/recharge/task/user-cashback-record`, // 返现记录
  userDepositList: `${API_HOST}/rewards/public/v1/recharge/task/user-deposit-list`, // 用户充值记录（跑马灯数据）
  userTaskInfo: `${API_HOST}/rewards/private/v1/recharge/task/user-task-info`, // 查询用户任务信息
  receiveAward: `${API_HOST}/rewards/private/v1/recharge/task/receive-award` // 查询用户任务信息
};

export const getCampaignDetailsPublic = () => {
  return fetch({
    url: URL.campainDetalsPublic,
    method: 'GET',
    showErrorMessage: true
  });
};

export const getCampaignDetailsPrivate = () => {
  return fetch({
    url: URL.campainDetalsPrivate,
    method: 'GET',
    showErrorMessage: true
  });
};

export const joinCampaign = (params) => {
  return fetch({
    url: URL.joinCampaign,
    method: 'POST',
    data: params,
    showErrorMessage: false
  });
};

export const getUserCashbackRecord = (params) => {
  return fetch({
    url: URL.userCashbackRecord,
    method: 'GET',
    params
  });
};

export const getUserDepositList = (params) => {
  return fetch({
    url: URL.userDepositList,
    method: 'GET',
    params
  });
}

export const getUserTaskInfo = () => {
  return fetch({
    url: URL.userTaskInfo,
    method: 'GET',
  });
}

/**
 * 根据活动id领取任务的奖励，根据任务配置的奖励（体验金，真金等）进行发放动作
 */
export const getReceiveAward = (params) => {
  return fetch({
    url: URL.receiveAward,
    method: 'get',
    params,
    showErrorMessage: false
  });
};
