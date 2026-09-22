# config.yaml 详解

服务端所有可调参数都在 `config.yaml` 里。**改完要重启服务生效**：

```bash
systemctl restart tts-server          # Linux（一键安装）
```

::: tip 相对路径规则
配置里所有相对路径都相对于**配置文件所在目录**解析，
不是相对于你执行命令时的目录，所以从哪里启动都一样。
:::

---

## server —— 监听与日志

```yaml
server:
  host: "0.0.0.0"          # 0.0.0.0 = 局域网可访问；只本机用可改 127.0.0.1
  port: 8080
  log_level: "INFO"        # DEBUG / INFO / WARNING
  public_base_url: ""      # 生成 audio_url 用的对外地址，留空自动按请求头推断
```

`host` 改成 `127.0.0.1` 就只有本机能访问，多一层保护。

---

## security —— 鉴权

```yaml
security:
  api_key: "your-secret-key"   # 留空 = 不校验（不推荐）
  protect_audio: false         # true 时 /audio/xxx 也要带 key
```

客户端支持三种传法，任选：

```http
X-API-Key: your-secret-key
Authorization: Bearer your-secret-key
```

```text
GET /audio/xxx.wav?key=your-secret-key     # 浏览器/播放器没法自定义请求头时用
```

---

## tts —— 语音源

```yaml
tts:
  source: "auto"
  speaker: "zh-CN-YunxiNeural"
  pitch: 5                 # RVC 变调半音数
  rate: 0                  # 语速百分比
  volume: 0                # 音量百分比
  edge_pitch_hz: 0         # Edge TTS 原生音高，非必要不要改
  retries: 3               # 在线语音失败重试次数
  edge_timeout: 60         # 单次在线语音的超时（秒）
```

::: tip edge_timeout 是保命的
`edge-tts` 库**自身没有任何超时**。不给它加这一层，微软接口一旦「接了连接却不回音频」，
请求会永久挂住并拖死整个服务（v1.0.2 修复的 504 问题）。
详见[所有请求都 504](/guide/troubleshooting#所有请求都-504-一直生成失败)。
:::

### source 四个取值

| 值 | 行为 | 需要什么 |
| --- | --- | --- |
| `edgetts` | 只用微软在线语音（音色最自然） | 联网 |
| `sapi` | 只用 Windows 自带离线语音 | Windows（系统自带） |
| `espeak` | 只用 espeak-ng 离线语音 | Linux/macOS，`apt install espeak-ng` |
| **`auto`**（默认） | **先用在线，失败自动转本地** | 推荐 |

`local` / `offline` 是别名：Windows 上指向 `sapi`，其它系统上指向 `espeak`。

### 本地离线语音的参数

```yaml
tts:
  sapi_voice: ""           # Windows 语音名，留空自动挑中文语音
  sapi_rate: 0             # -10 ~ 10
  sapi_timeout: 60
  espeak_voice: "cmn"      # espeak-ng 音色：cmn = 普通话
  espeak_speed: 180        # 词/分钟
  espeak_timeout: 60
```

### pitch 怎么调

`pitch` 是 RVC 的**变调半音数**，不是音高百分比：

* `0` = 不变调
* 正数 = 声音更接近女声 / 更年轻，男声模型转女声一般 `+5 ~ +12`
* 负数 = 更低沉，反向转换一般 `-5 ~ -12`

---

## chunk —— 长文本分段（低显存关键配置）

```yaml
chunk:
  enabled: true
  max_chars: 80            # 单段最大字数
  min_chars: 10            # 相邻过短片段合并阈值
```

RVC 的显存峰值只与**单段长度**相关，与文本总长度无关。按显存选：

| 显存 | `max_chars` | 峰值约 |
| --- | --- | --- |
| 2 GB | **60** | 1.7 GB |
| 4 GB | 120 | 2.4 GB |
| 6 GB | 80 ~ 200 | 1.9 ~ 3.5 GB |
| 8 GB+ | 200 | 基本不触发分段 |

设成 `0` 或 `enabled: false` 就关掉分段（回到旧行为，长文本会吃很多显存）。

---

## rvc —— 音色模型

```yaml
rvc:
  enabled: true
  model: "MyVoice.pth"     # 相对 model_dir，也可写绝对路径
  model_dir: "./models"
  index: "MyVoice.index"   # 可选的 .index，有就填
  f0_method: "rmvpe"
  device: "auto"           # auto / cuda:0 / cpu
  min_vram_mb: 1800        # auto 模式下低于该显存直接用 CPU
  allow_cpu_fallback: true # 运行时显存不足自动降级 CPU 重试
  is_half: true            # 半精度（CPU 上自动关闭）
  preload: true            # 启动即加载模型
```

### f0_method 怎么选

| 值 | 音质 | 速度 | 说明 |
| --- | --- | --- | --- |
| `rmvpe` | 最好 | 中等 | **默认值**，推荐 |
| `fcpe` | 好 | 较快 | 会强制 fp32 |
| `pm` | 一般 | 最快 | 机器慢时用 |
| `dio` | 一般 | 快 | |
| `harvest` | 较好 | 慢 | |
| `crepe` | 好 | 很慢 | 不推荐 |

### 只调试链路不换音色

```yaml
rvc:
  enabled: false           # 跳过 RVC，直接输出 Edge TTS 原始音频
```

显存占用几乎为零，适合先验证整条链路通不通。

---

## webui —— 网页控制台

```yaml
webui:
  enabled: true
  username: "admin"
  password: ""             # 留空 = 打开控制台不需要登录
  session_hours: 12        # 登录状态保持多久
```

详见[网页控制台](/guide/webui)。

---

## storage —— 音频文件

```yaml
storage:
  output_dir: "./output"
  expire_minutes: 10       # 生成的音频多少分钟后自动删除
  cleanup_interval_minutes: 2
  cache_by_text: true      # 相同文本复用音频
  max_text_length: 2000    # 单次请求最大文本长度
```

`expire_minutes` 是最常改的一项。**生成的音频只保留 10 分钟**，
到期由后台任务删除，不会在磁盘上堆积。

---

## queue —— 并发与超时

```yaml
queue:
  max_concurrent: 1        # 同时推理的任务数（RVC 底层库本身串行，建议保持 1）
  max_queue_size: 16       # 排队上限，超过返回 503
  timeout: 180             # 单任务超时（秒）；长文本会自动放宽
  hard_timeout: 100        # 单次推理的硬上限（秒），必须小于 timeout
```

::: warning 不建议调大 max_concurrent
RVC 推理库内部有全局状态，本身不支持并发。设大了容易出
`'tuple' object has no attribute 'dtype'` 之类的怪问题。
:::

`hard_timeout` 是卡死自愈的阈值：单次推理超过它就判定进程卡死，服务端会主动退出，
由 systemd（`Restart=always`）或 Windows 的 `守护启动.bat` 在几秒内拉起来。
留空则默认 150s，并自动收敛到 `timeout - 5` 以内。

---

## audio —— 输出格式

```yaml
audio:
  output_format: "wav"     # wav（推荐）或 mp3（体积更小）
  mp3_bitrate: "64k"
```

AstrBot 发语音消息推荐用 `wav`。

---

## 用环境变量覆盖

不想改配置文件时，可以用环境变量（Docker / systemd 部署方便）：

```text
TTS_SERVER_CONFIG            指定配置文件路径
TTS_SERVER_HOST / TTS_SERVER_PORT / TTS_SERVER_API_KEY
TTS_SERVER_PUBLIC_BASE_URL
TTS_SERVER_OUTPUT_DIR / TTS_SERVER_LOG_LEVEL
RVC_MODEL / RVC_MODEL_DIR / RVC_DEVICE / RVC_ENABLED
```

systemd 里这样写：

```ini
[Service]
Environment=TTS_SERVER_API_KEY=your-secret-key
Environment=RVC_DEVICE=cuda:0
```

## 只校验配置不启动

```bash
python main.py --config config.yaml --check-config
```

会把解析后的完整配置打印出来（不含密钥），用来确认有没有填错。
