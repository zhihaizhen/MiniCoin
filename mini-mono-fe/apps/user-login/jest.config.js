module.exports = {
  displayName: 'user-login',
  preset: '../../jest.preset.js',
  testEnvironment: 'jsdom',
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/env/'],
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nrwl/react/plugins/jest',
    '^.+\\.[tj]sx?$': [
      'babel-jest',
      { cwd: __dirname, configFile: './babel-jest.config.json' }
    ]
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/$1',
    '^@better-bit-fe/base-hooks$':
      '<rootDir>/../../libs/base-hooks/src/index.ts',
    '^@better-bit-fe/base-provider$':
      '<rootDir>/../../libs/base-provider/src/index.ts',
    '^@better-bit-fe/base-utils$':
      '<rootDir>/../../libs/base-utils/src/index.ts',
    '\\.(css|less)$': 'identity-obj-proxy'
  },
  coverageDirectory: '../../coverage/apps/user-login'
};
