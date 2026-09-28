const { PROJECT, PLATFORM } = process.env;
module.exports = {
  collectCoverageFrom: [
    `src/betterbitapps/${PROJECT}/${PLATFORM}/**/*.{js,jsx,ts,tsx}`,
    '!src/**/*.d.ts',
  ],
  coverageDirectory: `.coverage/${PROJECT}/${PLATFORM}`,
  resolver: 'jest-pnp-resolver',
  setupFiles: [
    'react-app-polyfill/jsdom',
    `<rootDir>/src/betterbitapps/${PROJECT}/__tests__/${PLATFORM}/setup.js`,
  ],
  testMatch: [
    `<rootDir>/src/betterbitapps/${PROJECT}/__tests__/${PLATFORM}/**/?(*.)(spec|test).{js,jsx,ts,tsx}`,
  ],
  testEnvironment: 'jsdom',
  testURL: 'http://localhost',
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': '<rootDir>/node_modules/babel-jest',
    '^.+\\.css$': '<rootDir>/src/.marvel/config/jest/cssTransform.js',
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)':
      '<rootDir>/src/.marvel/config/jest/fileTransform.js',
  },
  transformIgnorePatterns: [
    '[/\\\\]node_modules[/\\\\].+\\.(js|jsx|ts|tsx)$',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
  moduleNameMapper: {
    '^react-native$': 'react-native-web',
    '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
    '^@/(.*)$': `<rootDir>/src/betterbitapps/${PROJECT}/${PLATFORM}/$1`,
    '^@@/(.*)$': '<rootDir>/src/.marvel/$1',
    '^common/(.*)$': '<rootDir>/src/betterbitapps/common/$1',
  },
  moduleFileExtensions: [
    'web.js',
    'js',
    'web.ts',
    'ts',
    'web.tsx',
    'tsx',
    'json',
    'web.jsx',
    'jsx',
    'node',
  ],
};
