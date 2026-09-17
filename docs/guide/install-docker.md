# Docker 部署

适合已经在用 Docker 管理服务的场景。

## 前置条件

1. Docker 与 docker compose v2
2. NVIDIA 驱动（`nvidia-smi` 能跑）
3. [NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html)

验证容器能看到 GPU：

```bash
docker run --rm --gpus all nvidia/cuda:12.1.1-base-ubuntu22.04 nvidia-smi
```

## 步骤

```bash
git clone https://github.com/yake1145141/voice-tts-system.git
cd voice-tts-system/deploy/docker

# 1. 准备模型与配置
mkdir -p models output
cp /path/MyVoice.pth /path/MyVoice.index models/
cp ../../tts-server/config.yaml ./config.yaml
vi config.yaml      # 改 security.api_key、rvc.model、rvc.index

# 2. 启动
docker compose up -d
docker compose logs -f
```

## 关于权重文件

镜像里**不放** `hubert_base.pt` / `rmvpe.pt`。最省事的做法是让容器首次启动时下载，
但国内经常连不上 HuggingFace。推荐挂载进去：

```yaml
# docker-compose.yml 的 volumes 里追加
- "${TTS_ASSETS_DIR:-./assets}:/app/assets:ro"
```

然后在容器里软链到 `/app`：

```bash
docker compose exec tts-server ln -sf /app/assets/hubert_base.pt /app/
docker compose exec tts-server ln -sf /app/assets/rmvpe.pt /app/
docker compose restart tts-server
```

## 环境变量

| 变量 | 默认 | 说明 |
| --- | --- | --- |
| `TTS_PORT` | `8080` | 宿主机映射端口 |
| `TTS_CONFIG` | `./config.yaml` | 配置文件路径 |
| `TTS_MODEL_DIR` | `./models` | 模型目录 |
| `TTS_OUTPUT_DIR` | `./output` | 音频输出目录 |

compose 里也预置了这些容器内环境变量：`HF_HUB_OFFLINE=1`（禁止联网检查权重）、
`NVIDIA_VISIBLE_DEVICES=all`（GPU 可见）。

## 常用命令

```bash
docker compose logs -f                 # 看日志
docker compose restart tts-server      # 改完配置重启
docker compose down                    # 停止
docker compose build --no-cache && docker compose up -d    # 重新构建
```

## 注意事项

::: warning 别随便升级镜像里的 PyTorch
镜像基于 `python:3.12-slim`，PyTorch 装的是 **cu121** ——
这是 Pascal 老卡（P106-100 / P4 / P40 / GTX 10 系）唯一可用的版本。
:::

* 音频默认 10 分钟后自动删除，`output` 目录不会无限增长
* 容器里跑的是 root，注意宿主机 `models` / `output` 的权限
