const commonPlugins = [
  [
    'babel-plugin-import',
    {
      libraryName: 'antd',
      style: true, // 在项目编译阶段，可以对引入的 antd 样式文件进行编译，从而可以压缩打包尺寸；而配置style: "css", 则直接引入经过打包后的 antd 样式文件
      libraryDirectory: 'es',
    },
    'antd',
  ],
];

module.exports = {
  forward: {
    desktop: {
      plugins: commonPlugins,
    },
  },
};
