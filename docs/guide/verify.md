# 验证是否装好

装完之后按顺序做这几步，每步都能独立确认一件事。

## 1. 服务活着吗

```bash
curl http://127.0.0.1:8080/api/health
```

重点看 `engine` 里这几项：

```json
{
  "engine": {
    "ready": true,                                  ← 引擎是否初始化成功
    "device": "cuda:0",                             ← 用的是 GPU 还是 CPU
    "gpu_detail": "sm_61（复用 sm_60 内核）",         ← 显卡架构识别结果
    "device_fallback": false,                       ← 是否已经降级过
    "rvc_enabled": true,
    "tts_source": "auto",
    "chunk_max_chars": 80,
    "last_error": null
  }
}
```

| 现象 | 说明 |
| --- | --- |
| `ready: true` + `device: cuda:0` | 完美，GPU 正常工作 |
| `device: cpu` 且日志说"自动模式检测到显卡不可用" | 显存不够或架构不支持，看[硬件要求](/guide/requirements) |
| `device_fallback: true` | 运行中 OOM 过，已经降级到 CPU |
| `ready: false` | 初始化失败，看 `last_error` 和服务日志 |

## 2. 能合成出音频吗

```bash
curl -X POST http://127.0.0.1:8080/api/tts/file \
  -H "X-API-Key: your-secret-key" \
  -H "Content-Type: application/json" \
  -d '{"text":"你好，这是一条语音测试。"}' \
  -o test.wav

ffprobe test.wav      # 看时长，正常应该有内容
```

返回 200 且 `test.wav` 有几秒钟长就说明链路通了。

## 3. 用自带客户端测

仓库里的 `tools/tts_client.py` 只用标准库，不需要装任何依赖：

```bash
python tools/tts_client.py --url http://127.0.0.1:8080 --api-key your-secret-key health
python tools/tts_client.py --url http://127.0.0.1:8080 --api-key your-secret-key say "你好" --play
```

想看看性能怎么样，跑一次压测：

```bash
python tools/tts_client.py --url http://127.0.0.1:8080 --api-key your-secret-key bench --count 10 --concurrency 1
```

输出会给出成功率、吞吐、延迟 p50 / p90 / 最大值，以及**实时倍率 RTF**：

```text
成功 10/10 | 总耗时 24.31s | 吞吐 0.41 条/秒
延迟(秒)：平均 2.43 | p50 2.31 | p90 3.12 | 最大 3.12
音频总时长 58.20s | 平均实时倍率 0.42x
```

RTF 小于 1 就说明比实时快 —— P106-100 实测 **0.41x**。

## 4. 看网页控制台

浏览器打开 `http://<服务器IP>:8080/`：

* 顶部「服务状态」显示 **正常**
* 「推理设备」显示 `cuda:0 · fp16`
* 「显卡状态」里的利用率、显存、温度都有数值（不是 `—`）
* 在「合成测试」里输入一句话，点「合成并播放」能听到声音

这一步能过，就说明服务端**完全可用**了。

## 5. 从别的机器能访问吗

在 AstrBot 所在的机器上执行：

```bash
curl http://<服务器IP>:8080/api/health
```

如果连不上：

* 检查 `config.yaml` 里 `server.host` 是不是 `0.0.0.0`
* 检查防火墙：`sudo ufw status`、`sudo iptables -L -n | grep 8080`
* 云服务器还要看**安全组**有没有放行端口

---

## 全流程自检脚本

Ubuntu 部署套件里带了一个七层自检，一条命令把上面这些全跑一遍：

```bash
bash deploy/ubuntu/verify.sh
```

输出长这样：

```text
=== 1. 系统 ===
=== 2. 显卡 ===
=== 3. ffmpeg ===
=== 4. Python 环境 ===
  当前 torch 支持这张卡: 是（复用 sm_60 内核）
=== 5. 配置 ===
=== 6. 服务 ===
=== 7. 端到端合成 ===
  [OK]   合成成功（HTTP 200，251 KB）→ /tmp/_tts_test.wav
```

哪一层出问题一眼就能看出来。
