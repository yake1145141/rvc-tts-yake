import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp() {
    // 目前没有额外插件；以后要注册全局组件在这里加
  },
} satisfies Theme
