# 相关链接

## 本项目

| 内容 | 地址 |
| --- | --- |
| 服务端仓库 | <https://github.com/yake1145141/voice-tts-system> |
| 服务端发布包 | <https://github.com/yake1145141/voice-tts-system/releases> |
| AstrBot 插件仓库 | <https://github.com/yake1145141/astrbot_plugin_voice_reply> |
| 本文档站源码 | <https://github.com/yake1145141/yake1145141.github.io> |
| 问题反馈 | <https://github.com/yake1145141/voice-tts-system/issues> |

## 依赖的上游项目

| 项目 | 作用 | 地址 |
| --- | --- | --- |
| tts-with-rvc | Edge TTS + RVC 一体化推理库 | <https://github.com/Atm4x/tts-with-rvc> |
| AstrBot | 支持多平台的消息机器人框架 | <https://github.com/AstrBotDevs/AstrBot> |
| PyTorch | 推理框架 | <https://pytorch.org/> |
| FFmpeg | 音频读写与分段拼接 | <https://ffmpeg.org/> |
| FastAPI | HTTP 服务框架 | <https://fastapi.tiangolo.com/> |
| edge-tts | 微软 Edge 朗读接口的 Python 封装 | <https://github.com/rany2/edge-tts> |
| espeak-ng | Linux 上的离线语音兜底 | <https://github.com/espeak-ng/espeak-ng> |
| VitePress | 本文档站用的静态站点生成器 | <https://vitepress.dev/> |

## 相关概念

| 概念 | 是什么 | 参考 |
| --- | --- | --- |
| RVC | 基于检索的语音转换，只换音色不改内容 | <https://github.com/RVC-Project/Retrieval-based-Voice-Conversion-WebUI> |
| CUDA 计算能力 | 显卡架构代号，决定了 PyTorch 要装哪个版本 | <https://developer.nvidia.com/cuda-gpus> |
| CUDA 二进制兼容 | 为什么 sm_61 能复用 sm_60 内核 | <https://docs.nvidia.com/cuda/cuda-c-programming-guide/#application-compatibility> |
| HUBERT | RVC 用来提取语音特征的预训练模型 | <https://github.com/facebookresearch/fairseq/tree/main/examples/hubert> |
| RMVPE | 目前音质最好的音高提取算法 | — |

## 同类项目 / 参考

| 项目 | 说明 |
| --- | --- |
| [NapCat 文档](https://napneko.github.io/guide/napcat) | 本文档站的样式参考 |
| [AstrBot 官方文档](https://astrbot.app/) | AstrBot 的安装与插件开发 |
