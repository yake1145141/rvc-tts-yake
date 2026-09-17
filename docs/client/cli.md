# 命令行与调用库

这两个文件都在仓库的 `tools/` 目录下，**只用 Python 标准库**，不需要装任何依赖。

---

## 命令行客户端

`tools/tts_client.py`

### 常用命令

```bash
python tools/tts_client.py health                       # 服务状态：设备/模型/并发/统计
python tools/tts_client.py say "你好，这是语音测试。"     # 合成一条并保存
python tools/tts_client.py say "你好" --play             # 合成后直接播放
python tools/tts_client.py say "你好" --mode url         # 走 JSON 接口，验证 audio_url 可下载
python tools/tts_client.py batch tools/sample_texts.txt -c 2   # 逐行批量合成
python tools/tts_client.py bench --count 8 -c 2 --unique       # 并发压测（绕开缓存）
python tools/tts_client.py filter "你好呀！（开心地笑）"   # 预览插件会发给 TTS 的文本
```

### 地址与密钥的查找顺序

```text
--url / --api-key
    >  环境变量 TTS_SERVER_URL / TTS_SERVER_API_KEY
        >  tts-server/config.yaml
            >  默认 http://127.0.0.1:8080
```

所以在本机调试时什么都不用传，它会自己去读 `config.yaml`。

### bench 压测输出怎么看

```text
成功 10/10 | 总耗时 24.31s | 吞吐 0.41 条/秒 | 缓存命中 0
延迟(秒)：平均 2.43 | p50 2.31 | p90 3.12 | 最大 3.12
音频总时长 58.20s | 平均实时倍率 0.42x
```

| 指标 | 含义 |
| --- | --- |
| 成功率 | 失败的请求会按错误码归类（`rvc_failed` / `timeout` / `queue_full` / `unauthorized`） |
| 吞吐 | 每秒能处理多少条 |
| p50 / p90 | 一半 / 九成的请求快于这个值 —— 比平均值更能反映真实体验 |
| **实时倍率** | 推理耗时 ÷ 音频时长，**小于 1 就是比实时快** |

---

## 单文件调用库

`tools/voice_tts.py`

把文件复制进你自己的项目，就能三行调用：

```python
from voice_tts import VoiceTTS

tts = VoiceTTS()                       # 自动从 config.yaml / 环境变量读地址与 Key
path = tts.say("你好，这是一条语音消息。")   # 合成并保存，返回音频文件路径
```

显式指定地址和密钥：

```python
tts = VoiceTTS("http://192.168.1.10:8080", api_key="your-secret-key")
```

### 全部方法

```python
tts.say("合成并保存到文件")           # → 音频文件路径
tts.speak("合成并直接播放")           # 需要系统有播放器
tts.synthesize_bytes("只要字节流")     # → wav bytes，不落盘
tts.audio_url("给我一个可下载链接")    # → URL，交给别的平台去拉
tts.health()                          # → 服务状态 dict
tts.available()                       # → bool，失败不抛异常
```

`say()` 的目标位置很灵活：

```python
tts.say("...", dest="out/")                 # 传目录 → 自动生成文件名
tts.say("...", dest="out/hello.wav")        # 传文件 → 按这个文件名存
tts.say("...", dest="out/2026/09/")         # 目录不存在会自动创建
```

### 命令行也能直接用

```bash
python voice_tts.py "你好" --play
python voice_tts.py --health
python voice_tts.py "你好" --url http://192.168.1.10:8080 --api-key xxx
```

---

## 不用 Python？

直接调 HTTP 接口即可，只有两个端点常用：

```bash
# 直接拿音频文件
curl -X POST http://127.0.0.1:8080/api/tts/file \
  -H "X-API-Key: your-secret-key" \
  -H "Content-Type: application/json" \
  -d '{"text":"你好"}' -o out.wav

# 拿 JSON（含可下载的 audio_url）
curl -X POST http://127.0.0.1:8080/api/tts \
  -H "X-API-Key: your-secret-key" \
  -H "Content-Type: application/json" \
  -d '{"text":"你好"}'
```

完整接口说明见 [HTTP 接口](/reference/api)。
