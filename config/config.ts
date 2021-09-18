// https://umijs.org/config/
import { defineConfig } from 'umi';
import { join, resolve } from 'path';

import defaultSettings from './defaultSettings';
import proxy from './proxy';
import routes from './routes';

const CopyWebpackPlugin = require('copy-webpack-plugin')

const { REACT_APP_ENV, NODE_ENV } = process.env;

// cesium
const cesiumSource = 'node_modules/cesium/Source';
const cesiumWorkers = '../Build/Cesium/Workers';
const cesiumPath = NODE_ENV === 'production' ? resolve(__dirname, "../node_modules/cesium/Build/Cesium") : resolve(__dirname, "../node_modules/cesium/Build/CesiumUnminified");

export default defineConfig({
  hash: true,
  antd: {},
  copy: [
    {from: join(cesiumSource,cesiumWorkers), to:'Workers'},
    {from: join(cesiumSource,'Assets'), to:'Assets'},
    {from: join(cesiumSource,'Widgets'), to:'Widgets'},
  ],
  // alias: {
  //   "cesium": resolve(__dirname, '../node_modules/cesium/Source')
  // },
  // define:{
  //   CESIUM_BASE_URL: JSON.stringify('')
  // },
  chainWebpack(memo, { webpack }) {
    memo
      .plugin('define')
      .tap(args => {
        args[0]['CESIUM_BASE_URL'] = JSON.stringify('')
        return args
    })
    memo.resolve.alias.set('@cesiumSource', resolve(__dirname, "../node_modules/cesium/Source"))
    memo.resolve.alias.set('@cesiumBuild', resolve(__dirname, "../node_modules/cesium/Build/Cesium"))
    memo.resolve.alias.set('@cesiumDebug', resolve(__dirname, "../node_modules/cesium/Build/CesiumUnminified"))
    new CopyWebpackPlugin({
      patterns: [
        { from: join(cesiumSource, 'Workers'), to: 'static/Workers' },
        { from: join(cesiumSource, 'Assets'), to: 'static/Assets' },
        { from: join(cesiumSource, 'Widgets'), to: 'static/Widgets' },
        { from: join(cesiumSource, 'ThirdParty'), to: 'static/ThirdParty' }
      ]
    })
  },
  // publicPath: './',
  // base: '/',
  // treeShaking: true,
  dva: {
    hmr: true,
  },
  layout: {
    // https://umijs.org/zh-CN/plugins/plugin-layout
    locale: true,
    siderWidth: 208,
    ...defaultSettings,
  },
  // https://umijs.org/zh-CN/plugins/plugin-locale
  locale: {
    // default zh-CN
    default: 'zh-CN',
    antd: true,
    // default true, when it is true, will use `navigator.language` overwrite default
    baseNavigator: true,
  },
  dynamicImport: {
    loading: '@ant-design/pro-layout/es/PageLoading',
  },
  targets: {
    ie: 11,
  },
  // umi routes: https://umijs.org/docs/routing
  routes,
  // Theme for antd: https://ant.design/docs/react/customize-theme-cn
  theme: {
    'primary-color': defaultSettings.primaryColor,
  },
  // esbuild is father build tools
  // https://umijs.org/plugins/plugin-esbuild
  esbuild: {},
  title: false,
  ignoreMomentLocale: true,
  proxy: proxy[REACT_APP_ENV || 'dev'],
  manifest: {
    basePath: '/',
  },
  // Fast Refresh 热更新
  fastRefresh: {},
  openAPI: [
    {
      requestLibPath: "import { request } from 'umi'",
      // 或者使用在线的版本
      // schemaPath: "https://gw.alipayobjects.com/os/antfincdn/M%24jrzTTYJN/oneapi.json"
      schemaPath: join(__dirname, 'oneapi.json'),
      mock: false,
    },
    {
      requestLibPath: "import { request } from 'umi'",
      schemaPath: 'https://gw.alipayobjects.com/os/antfincdn/CA1dOm%2631B/openapi.json',
      projectName: 'swagger',
    },
  ],
  nodeModulesTransform: { type: 'none' },
  mfsu: {},
  webpack5: {},
  exportStatic: {},
});
