---
layout: home

hero:
  name: voice-tts-system
  text: 让 AI 用你的音色说话
  tagline: 拦截 AstrBot 的文本回复 → Edge TTS 合成 → RVC 换成你的音色 → 作为语音消息发送。任何环节失败都会自动降级为文字，绝不丢消息。
  actions:
    - theme: brand
      text: 开始部署 →
      link: /guide/install
    - theme: alt
      text: 这项目是什么
      link: /guide/
    - theme: alt
      text: GitHub
      link: https://github.com/yake1145141/voice-tts-system

features:
  - icon: 🎙️
    title: 任意音色
    details: 用你自己的 RVC 模型换音色，别人的 AI 是文字，你的 AI 开口说话。
  - icon: 🎮
    title: 显存最低 2 GB
    details: 长文本自动分段，显存峰值与文本长度解耦。P106-100、P4、GTX 10 系这些老卡也能跑。
  - icon: 🔌
    title: 断网也能出声
    details: 在线语音失败会自动重试，仍失败就切本地离线语音（Windows SAPI / Linux espeak-ng）。
  - icon: 📊
    title: 自带网页控制台
    details: 实时看显卡利用率、显存、温度、功耗，还能在页面上直接试听。可设密码。
  - icon: 🧩
    title: 客户端开箱可用
    details: AstrBot 插件、命令行客户端、零依赖的单文件调用库、安卓配置 App。
  - icon: 🐳
    title: 部署方式齐全
    details: Linux 一键脚本、Windows 整合包、Docker、Google Colab、安卓手机，五种任选。
---

## 最低配置要求

这是最常被问到的问题，先给结论：

| 项目 | 最低 | 推荐 | 说明 |
| --- | --- | --- | --- |
| **显卡显存** | **2 GB** | 4 GB 以上 | 见 [显存详解](/guide/requirements) |
| 显卡架构 | NVIDIA，计算能力 ≥ 6.0 | — | **P106-100 / P106-090 / P4 / P40 / GTX 10 系 / RTX 全系都可以** |
| 驱动 | ≥ 525（支持 CUDA 12.1） | — | `nvidia-smi` 能输出即可 |
| CPU / 内存 | 双核 / 4 GB | 4 核 / 8 GB | 显存小的机器建议配 4 GB swap |
| 磁盘 | 8 GB 可用 | 15 GB | PyTorch + CUDA 运行库约占 6 GB |
| 系统 | Ubuntu 20.04+ / Windows 10+ | Ubuntu 22.04 | 也支持 Docker、Colab、安卓 |

::: tip 没有显卡也能跑
把 `rvc.device` 设成 `"cpu"`，或者让 `rvc.min_vram_mb` 高于你的显存，服务会自动用 CPU。
速度大约是实时的 3~5 倍耗时。只想快速验证链路的话，把 `rvc.enabled` 设成 `false` 更省事。
:::

## 这套系统由两部分组成

<div class="use-cases">
  <div>
    <h4>① 服务端 · 语音处理端</h4>
    <p>跑在有显卡的机器上，对外提供 HTTP 合成接口。Edge TTS 生成基础语音，再用 RVC 换成目标音色，输出 wav。</p>
    <p><a href="https://github.com/yake1145141/voice-tts-system">yake1145141/voice-tts-system →</a></p>
  </div>
  <div>
    <h4>② 客户端 · AstrBot 插件</h4>
    <p>跑在 AstrBot 里，拦截 AI 的文本回复、过滤括号里的动作描写，再调用服务端把文字换成语音消息。</p>
    <p><a href="https://github.com/yake1145141/astrbot_plugin_voice_reply">yake1145141/astrbot_plugin_voice_reply →</a></p>
  </div>
</div>

两部分**完全独立**，通过 HTTP 通信，可以装在同一台机器，也可以分开部署。

## 网页控制台

服务端自带一个零依赖的网页控制台（根路径 `/`），能看到显卡状态、主机状态、在线试听和最近请求，
并且支持密码登录。下图是在 Ubuntu 22.04 + P106-100 上的真实运行截图：

![网页控制台](/webui-console.png)

## 实测性能

| 环境 | 短句延迟 | 实时倍率 RTF | 显存峰值 |
| --- | --- | --- | --- |
| Ubuntu 22.04 + P106-100 6 GB | 2 ~ 3 秒 | **0.41x** | 0.9 ~ 2 GB |
| Windows + Tesla P4 8 GB | 4 ~ 6 秒 | 0.70 ~ 0.89x | — |
| 纯 CPU（4 核） | 15 ~ 40 秒 | 3 ~ 5x | — |

> RTF（实时倍率）= 处理耗时 ÷ 音频时长，**越小越快**，小于 1 表示比实时快。

## 现在开始

<div class="use-cases">
  <div>
    <h4>第一次部署</h4>
    <p>先看硬件够不够，再挑一种部署方式。</p>
    <p><a href="./guide/install">部署方式怎么选 →</a></p>
  </div>
  <div>
    <h4>已经装好服务端</h4>
    <p>把 AstrBot 插件接上，填地址和密钥就能用。</p>
    <p><a href="./client/astrbot">配置 AstrBot 插件 →</a></p>
  </div>
  <div>
    <h4>要写自己的调用</h4>
    <p>HTTP 接口文档，含请求响应示例和错误码。</p>
    <p><a href="./reference/api">HTTP 接口 →</a></p>
  </div>
  <div>
    <h4>遇到问题了</h4>
    <p>常见报错、原因和解决办法都在这里。</p>
    <p><a href="./guide/troubleshooting">错误码速查 →</a></p>
  </div>
</div>
