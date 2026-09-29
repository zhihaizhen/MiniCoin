const ns = 'guidance';

const initStates = {
  guidanceSwitch: false,
  currentStep: 1,
};

const types = {
  SET_GUIDANCE_SWITCH: 'SET_GUIDANCE_SWITCH',
  SET_GUIDANCE_CURRENT_STEP: 'SET_GUIDANCE_CURRENT_STEP',
};

const actions = {
  [types.SET_GUIDANCE_SWITCH](state, { status }) {
    // 暂时屏蔽指引
    // state[ns].guidanceSwitch = status;
  },
  [types.SET_GUIDANCE_CURRENT_STEP](state, { status }) {
    state[ns].currentStep = status;
  },
};

export default {
  ns,
  initStates,
  types,
  actions,
};
