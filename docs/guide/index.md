# 这项目是什么

**voice-tts-system** 让 AstrBot（以及任何能发 HTTP 请求的程序）的 AI 回复
**自动变成指定音色的语音**发出去。

一条链路串起四件事：

```text
拦截 AI 的回复文本  →  过滤掉括号里的动作描写  →  Edge TTS 合成基础语音
                                                        ↓
                                               RVC 换成你的音色
                                                        ↓
                                              作为语音消息发送
```

::: tip 核心原则
**能语音就语音，不能语音就文字。** 任何一步失败都不会影响 AI 原本的文字回复 ——
连接超时、模型报错、显存不足、API Key 不对，全都会自动降级成文字发出去。
:::

## 它解决什么问题

默认情况下 AstrBot 的 AI 只会发文字。你可能想要：

* 让 AI 用**某个特定音色**说话（你自己的模型、喜欢的声优、游戏角色）；
* 让回复更像"有人在说话"，而不是一段冷冰冰的文本；
* 但又不希望换音色这件事把 AstrBot 搞崩 —— 一旦出问题必须能退回文字。

这套系统的做法是把工作拆成**两个完全独立的进程**：

| 部分 | 跑在哪 | 干什么 |
| --- | --- | --- |
| **服务端** | 有 NVIDIA 显卡的机器 | 接收文字，返回合成好的语音文件 |
| **客户端** | AstrBot 所在的地方 | 拦截回复、过滤文本、调用服务端、替换成语音消息 |

两者只通过 HTTP 通信，所以服务端可以放在另一台有显卡的机器上，甚至放在云端。

## 语音是怎么"换"出来的

合成分两步，这是音质和音色可控的关键：

1. **Edge TTS** 负责把文字读出来 —— 微软的在线语音，中文自然度很好，但音色是固定的
   （默认 `zh-CN-YunxiNeural`）。
2. **RVC**（Retrieval-based Voice Conversion）负责换音色 —— 它不改内容，
   只把"这段声音是谁说的"换成你的模型。

所以你想换音色，只需要换一个 `.pth` 模型文件，不需要自己训练 TTS。

## 能部署在哪

| 方式 | 适合 | 需要什么 |
| --- | --- | --- |
| [Linux 一键安装](/guide/install-linux) | 有显卡的 Linux 服务器 | Ubuntu 20.04+ / Debian 11+ |
| [Windows 整合包](/guide/install-windows) | 家用 Windows 电脑 | 解压即用，无需装 Python |
| [Docker](/guide/install-docker) | 已经在用 Docker 的环境 | NVIDIA Container Toolkit |
| [Google Colab](/guide/install-colab) | 手头没有显卡 | 一个 Google 账号 |
| [安卓手机](/guide/install-android) | 想省一台机器 | 有 root 的安卓手机 |

推荐顺序：**Linux 一键安装 > Windows 整合包 > Docker > 其余**。
前两种基本是复制粘贴一条命令就能跑起来。

## 接下来读什么

* 想知道自己的显卡能不能用 → [硬件与显存要求](/guide/requirements)
* 想搞明白内部怎么跑的 → [整体架构与工作原理](/guide/architecture)
* 想直接开干 → [部署方式怎么选](/guide/install)
