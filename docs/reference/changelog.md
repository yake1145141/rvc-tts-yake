# 更新日志

本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/)。
完整历史见 [GitHub Releases](https://github.com/yake1145141/voice-tts-system/releases)。

## v1.0.1

**修复**

* 引擎在 `rvc.enabled: false` 时会因为缺少 `edge-tts` 直接初始化失败
  （整个服务 `ready=false`）。现在改为记录警告继续启动 ——
  这是个可选依赖，不该拖垮整个引擎。

**构建**

* 安卓配置 App 的成品（24 KB）纳入版本库，Release 工作流才能带上它

## v1.0.0

首个正式版本。

**服务端**

* Edge TTS（`zh-CN-YunxiNeural`）+ RVC 音色转换的 HTTP 合成服务
* **长文本自动分段**：显存峰值只与单段长度有关，2 GB 显存的小卡也能处理长文本
* **离线语音兜底**：在线语音失败时自动改用本地语音
  （Windows SAPI / Linux espeak-ng）
* 在线语音瞬时故障自动重试（空音频、断连、超时）
* 显卡架构智能识别：兼容 Pascal（sm_61，P106-100 / P4 / P40 / GTX 10 系）等老卡
* 显存不足自动降级 CPU 重试，不会让请求失败
* 音频按文本缓存 + 过期自动清理（默认 10 分钟）
* **网页控制台**：显卡状态 / 主机状态 / 在线试听 / 最近请求 / 一键清理
* 网页控制台支持密码登录（HMAC 签名会话 Cookie）
* 完全离线的资源查找：预置 `hubert_base.pt` / `rmvpe.pt`，不需要访问 HuggingFace

**客户端**

* AstrBot 插件：拦截 AI 文本 → 过滤括号内容 → 合成语音 → 发送语音消息，失败自动降级文字
* 命令行客户端 `tts_client.py`：health / say / batch / bench / filter
* 单文件客户端库 `voice_tts.py`：零依赖，拖进任何 Python 项目即可调用
* 安卓配置 App

**部署**

* Windows 一键整合包（内置 Python 运行时、CUDA 版 PyTorch、ffmpeg）
* Linux 一键安装脚本（自动装 Python 3.12、PyTorch、systemd 服务）
* Docker / docker-compose
* Google Colab Notebook
* 安卓 Termux + chroot 部署

**已知限制**

* 在线语音（Edge TTS）依赖微软公开接口，偶发抖动；已加重试与离线兜底
* 服务端尚未内置鉴权以外的访问控制，暴露公网请自行套反向代理与 HTTPS
* 安卓端只能用 CPU 推理（没有可用的 PyTorch GPU 后端）
