# 错误码速查

## HTTP 错误码

服务端所有错误都是统一结构：

```json
{
  "success": false,
  "error": { "code": "rvc_failed", "message": "tts-with-rvc 执行失败: ..." }
}
```

| HTTP | code | 什么情况 | 怎么办 |
| --- | --- | --- | --- |
| 400 | `empty_text` | 文本为空 | 检查客户端有没有把过滤后的空文本发过来 |
| 400 | `text_too_long` | 超过 `storage.max_text_length` | 调大上限，或让客户端侧先截断 |
| 401 | `unauthorized` | API Key 不对 / 控制台没登录 | 两端密钥保持一致 |
| 404 | `audio_not_found` | 音频不存在 | 文件名错了，或早就过期删了 |
| 410 | `audio_expired` | 音频已过期 | 重新合成 |
| 413 | — | 请求体过大 | 同上，先截断文本 |
| 422 | `invalid_request` | 请求体格式不对 | 检查 JSON 里的 `text` 字段 |
| 500 | `rvc_failed` | 合成失败（最常见） | 看下面的[详细分类](#rvc_failed-的几种常见原因) |
| 500 | `empty_audio` | 生成了空音频 | 一般是上游 TTS 返回了空内容，会自动重试 |
| 500 | `ffmpeg_missing` | 没装 ffmpeg | `apt install ffmpeg` |
| 500 | `ffmpeg_failed` | 音频转换 / 拼接失败 | 看日志里的 ffmpeg 报错 |
| 503 | `engine_not_ready` | 引擎还没初始化好 | 等服务启动完（首次要加载模型） |
| 503 | `queue_full` | 排队超过上限 | 调大 `queue.max_queue_size`，或提高客户端并发限制 |
| 504 | `timeout` | 处理超时 | 偶尔一次：调大 `queue.timeout` 或减小 `chunk.max_chars`；**每次都超时**见下方[专门一节](#所有请求都-504-一直生成失败) |

---

## rvc_failed 的几种常见原因

`rvc_failed` 是个大类，具体原因写在 `message` 里。对照这张表看：

| message 里的关键字 | 原因 | 解决 |
| --- | --- | --- |
| `No audio was received` | 微软在线语音抽风 | 会自动重试；`source: auto` 时还会自动转本地离线语音 |
| `Cannot connect to host` / `Connection timeout` | 网络不通 / 被限流 | 同上；长期不行就把 `source` 设成 `sapi` 或 `espeak` |
| `no kernel image is available` | PyTorch 没编译这张卡的架构 | 装 cu121 版 torch，见[硬件要求](/guide/requirements#显卡对照表) |
| `CUDA error: operation not supported` | 同上 | 同上 |
| `CUDA out of memory` | 显存不够 | 调小 `chunk.max_chars`；会自动降级 CPU 重试 |
| `No module named 'edge_tts'` | 没装在线语音库 | `pip install edge-tts`，或改用离线语音 |
| `No module named 'tts_with_rvc'` | 依赖没装全 | 重跑 `install.sh`，或 `pip install -r requirements.txt` |
| `Failed to load audio` | 找不到 ffmpeg | 装 ffmpeg，或放进 `<服务目录>/bin/` |
| `'tuple' object has no attribute 'dtype'` | 同上（ffmpeg 找不到时的连锁反应） | 同上 |

---

## 症状对照表

不知道看哪儿的话，先从这张表定位：

| 现象 | 最可能的原因 | 先看哪儿 |
| --- | --- | --- |
| 服务起不来 | 配置错了 / 模型文件找不到 | `journalctl -u tts-server -n 50` |
| 启动后卡几分钟 | 在联网找 `hubert_base.pt` | 把权重放到服务端根目录 |
| `/api/health` 里 `ready: false` | 引擎初始化失败 | `last_error` 字段 + 日志 |
| `device` 显示 `cpu` 但你有显卡 | 显存低于 `min_vram_mb`，或架构不支持 | 日志里会有明确的"自动模式检测到显卡不可用" |
| 第一次合成特别慢 | 在加载模型（10~60 秒） | 正常现象；`rvc.preload: true` 会在启动时预热 |
| 一直发文字没有语音 | 服务不可达 / 密钥不对 / 文本超长 | 先 `curl .../api/health` |
| 网页控制台打不开 | 端口 / 防火墙 / `host` 配置 | `ss -lntp \| grep 8080` |
| 控制台提示未授权 | 设了 `webui.password` | 用配置里的账号密码登录 |
| 音频文件不见了 | 正常，10 分钟自动删除 | 调大 `storage.expire_minutes` |
| 磁盘被占满 | 输出目录没清理 | 控制台点「立即清理过期音频」，检查 `expire_minutes` |
| 所有请求都 504 / 一直"生成失败" | v1.0.2 之前：`edge-tts` 无超时导致推理锁永久被占 | 升级到 v1.0.2，并用 systemd / `守护启动.bat` 托管 |

---

## 所有请求都 504 /「一直生成失败」

**v1.0.2 已修复**，老版本请升级。症状是：控制台「最近请求」里连续一排 504，
每隔几分钟重启一次服务又能好一小会儿，然后继续全 504。

根因：`edge-tts` 这个库**自身没有任何超时**。微软接口一旦「接了连接却不回音频」，
推理线程里那句 `await communicate.save()` 就永久挂住 —— 不抛异常、不返回、
也不释放推理锁（`can_speak`），于是后面每个请求都卡在等锁，直到 180s 超时。

v1.0.2 的三层防护：

| 配置 | 默认值 | 作用 |
| --- | --- | --- |
| `tts.edge_timeout` | 60s | 单次在线语音的超时，卡住立刻抛错 → 重试 → 自动转离线语音 |
| `queue.hard_timeout` | 100s | 单次推理的硬上限，超过判定卡死，**主动退出进程** |
| —（同上一项） | — | 推理锁被占用超过硬上限，同样判定卡死并重启 |

进程退出后需要有人把它拉起来：Linux 用 systemd（`install.sh` / `install-systemd.sh` 装的都带
`Restart=always`），Windows 用 `守护启动.bat`。
用 `nohup` 或直接双击 `启动语音服务.bat` 起的进程，退出后没人拉起 ——
表现为服务直接停掉，而不是自愈。

---

## 收集诊断信息

要找人帮忙时，把这些一起贴出来最有效：

```bash
# 1. 系统与显卡
nvidia-smi
uname -a

# 2. 服务状态与最近日志
systemctl status tts-server --no-pager
journalctl -u tts-server -n 100 --no-pager

# 3. 健康检查
curl -s http://127.0.0.1:8080/api/health | python3 -m json.tool

# 4. 配置（密钥会被 describe() 过滤掉）
cd /opt/tts-server && ./venv/bin/python app/main.py --config config.yaml --check-config
```

Windows 整合包直接双击 `诊断信息.bat`，它会把上面这些收集到 `diagnostics.txt`。

::: tip 日志里的那些 FutureWarning 可以忽略
你会看到大量 `torch.load` / `weights_only` / `WeightNorm` 的 FutureWarning ——
那是 PyTorch 和第三方库的弃用提醒，不影响功能。真正要看的是
`[ERROR]`、`[WARNING]` 开头的行。
:::
