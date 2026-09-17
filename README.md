# voice-tts-system 文档站

这是 [voice-tts-system](https://github.com/yake1145141/voice-tts-system) 的官方文档站，
基于 [VitePress](https://vitepress.dev/) 构建，托管在 GitHub Pages。

**在线阅读：<https://tts.axzt.top/>**

## 本地开发

```bash
npm install        # 安装依赖（首次）
npm run dev        # 本地预览，http://localhost:5173
npm run build      # 构建到 docs/.vitepress/dist
npm run preview    # 预览构建产物
```

## 目录结构

```text
voice-tts-docs/
├── docs/                       # VitePress 站点根目录
│   ├── .vitepress/
│   │   ├── config.mts          # 导航、侧边栏、搜索等配置
│   │   └── theme/              # 自定义主题与样式
│   ├── public/                 # 静态资源（logo、截图）
│   ├── index.md                # 首页
│   ├── guide/                  # 使用指南：部署服务端
│   ├── client/                 # 客户端接入
│   └── reference/              # 接口文档、更新日志
└── .github/workflows/deploy.yml  # 推 main 自动构建并发布到 Pages
```

## 怎么改

* 改某个页面的内容 → 直接编辑 `docs/` 下对应的 `.md`
* 改导航栏 / 侧边栏 → 编辑 `docs/.vitepress/config.mts`
* 改配色 / 样式 → 编辑 `docs/.vitepress/theme/custom.css`

改完推到 `main` 分支，GitHub Actions 会自动重新构建并发布，大约 1 分钟后生效。
