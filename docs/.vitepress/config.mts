import { defineConfig } from 'vitepress'

const REPO = 'https://github.com/yake1145141/voice-tts-system'
const PLUGIN_REPO = 'https://github.com/yake1145141/astrbot_plugin_voice_reply'
const SITE_REPO = 'https://github.com/yake1145141/rvc-tts-yake'

export default defineConfig({
  lang: 'zh-CN',
  title: 'voice-tts-system',
  description: 'AstrBot AI 语音回复系统 —— Edge TTS + RVC 的完整部署教程、配置说明与接口文档',

  // 绑了自定义域名 rvc-tts.top，站点直接跑在域名根路径下，所以 base 是 /
  // （docs/public/CNAME 里的内容会原样进构建产物，GitHub Pages 靠它认域名）
  base: '/',
  cleanUrls: true,
  lastUpdated: true,

  head: [
    ['link', { rel: 'icon', href: '/logo.svg' }],
    ['link', { rel: 'canonical', href: 'https://rvc-tts.top/' }],
    ['meta', { name: 'theme-color', content: '#3fb950' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'voice-tts-system 文档' }],
    ['meta', { property: 'og:description', content: '把 AI 的文字回复自动变成指定音色的语音' }],
    ['meta', { property: 'og:url', content: 'https://rvc-tts.top/' }],
  ],

  markdown: {
    lineNumbers: false,
    // 代码块里的中文注释也能正常高亮
    theme: { light: 'github-light', dark: 'github-dark' },
  },

  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'voice-tts-system',

    nav: [
      { text: '首页', link: '/' },
      { text: '使用指南', link: '/guide/', activeMatch: '^/guide/' },
      { text: '客户端', link: '/client/astrbot', activeMatch: '^/client/' },
      { text: '接口文档', link: '/reference/api', activeMatch: '^/reference/' },
      {
        text: '相关链接',
        items: [
          { text: '服务端仓库', link: REPO },
          { text: 'AstrBot 插件仓库', link: PLUGIN_REPO },
          { text: '下载发布包', link: `${REPO}/releases` },
          { text: '问题反馈', link: `${REPO}/issues` },
        ],
      },
    ],

    sidebar: {
      '/guide/': [
        {
          text: '开始之前',
          items: [
            { text: '这项目是什么', link: '/guide/' },
            { text: '硬件与显存要求', link: '/guide/requirements' },
            { text: '整体架构与工作原理', link: '/guide/architecture' },
          ],
        },
        {
          text: '部署服务端',
          items: [
            { text: '部署方式怎么选', link: '/guide/install' },
            { text: 'Linux 一键安装', link: '/guide/install-linux' },
            { text: 'Windows 整合包', link: '/guide/install-windows' },
            { text: 'Docker', link: '/guide/install-docker' },
            { text: 'Google Colab', link: '/guide/install-colab' },
            { text: '安卓手机', link: '/guide/install-android' },
          ],
        },
        {
          text: '配置与运维',
          items: [
            { text: 'config.yaml 详解', link: '/guide/config' },
            { text: '网页控制台', link: '/guide/webui' },
            { text: '验证是否装好', link: '/guide/verify' },
            { text: '升级与卸载', link: '/guide/maintain' },
          ],
        },
        {
          text: '排障',
          items: [
            { text: '常见问题 FAQ', link: '/guide/faq' },
            { text: '错误码速查', link: '/guide/troubleshooting' },
          ],
        },
      ],

      '/client/': [
        {
          text: '客户端接入',
          items: [
            { text: '总览', link: '/client/' },
            { text: 'AstrBot 插件', link: '/client/astrbot' },
            { text: '命令行与调用库', link: '/client/cli' },
            { text: '安卓配置 App', link: '/client/android-app' },
          ],
        },
      ],

      '/reference/': [
        {
          text: '参考资料',
          items: [
            { text: 'HTTP 接口', link: '/reference/api' },
            { text: '更新日志', link: '/reference/changelog' },
            { text: '常见问题来源', link: '/reference/links' },
          ],
        },
      ],
    },

    outline: { level: [2, 3], label: '本页目录' },
    docFooter: { prev: '上一篇', next: '下一篇' },
    lastUpdated: { text: '最后更新于', formatOptions: { dateStyle: 'short', timeStyle: 'short' } },

    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: '搜索文档', buttonAriaLabel: '搜索文档' },
          modal: {
            noResultsText: '没有找到相关结果',
            resetButtonTitle: '清除查询条件',
            footer: {
              selectText: '选择',
              navigateText: '切换',
              closeText: '关闭',
            },
          },
        },
      },
    },

    editLink: {
      pattern: `${SITE_REPO}/edit/main/docs/:path`,
      text: '在 GitHub 上编辑此页',
    },

    socialLinks: [
      { icon: 'github', link: REPO, ariaLabel: '服务端仓库' },
    ],

    footer: {
      message: '以 MIT 协议开源 · 请勿用生成的声音冒充他人',
      copyright: 'Copyright © 2026 yake1145141',
    },

    docFooterText: undefined,
    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '目录',
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
    externalLinkIcon: true,
  },
})
