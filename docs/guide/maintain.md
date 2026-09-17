# 升级与卸载

## 升级服务端代码

一键安装的目录在 `/opt/tts-server`，代码在 `app/` 下。

```bash
# 1. 拉最新源码
cd /path/to/voice-tts-system
git pull

# 2. 覆盖 app 目录（配置和模型不会被碰）
sudo cp tts-server/*.py /opt/tts-server/app/
sudo cp -r tts-server/static/. /opt/tts-server/app/static/

# 3. 重启
sudo systemctl restart tts-server

# 4. 看一眼有没有报错
journalctl -u tts-server -n 30 --no-pager
```

::: tip 也可以直接重跑安装脚本
`deploy/linux/install.sh` 是**幂等**的：已装好的 Python、已满足的依赖都会跳过，
只会更新代码和配置。加 `--dry-run` 可以先看它打算做什么。
:::

## 升级依赖

一般不需要。除非你要换 PyTorch 版本（比如换了显卡）：

```bash
sudo /opt/tts-server/venv/bin/python -m pip install \
  torch==2.5.1+cu121 torchaudio==2.5.1+cu121 \
  --index-url https://download.pytorch.org/whl/cu121
sudo systemctl restart tts-server
```

Windows 整合包对应的是双击 `升级到老显卡版torch.bat`。

## 换音色模型

1. 把新的 `.pth`（和 `.index`）放进 `models/`
2. 改 `config.yaml`：

   ```yaml
   rvc:
     model: "NewVoice.pth"
     index: "NewVoice.index"
   ```

3. `systemctl restart tts-server`

模型换了之后第一次推理会慢一点（要重新加载），之后恢复正常。

## 改端口

```yaml
server:
  port: 50051
```

重启服务，然后**别忘了同步改 AstrBot 插件里的地址**。

## 备份

需要备份的其实只有三样：

| 内容 | 位置 |
| --- | --- |
| 配置 | `/opt/tts-server/config.yaml` |
| 模型 | `/opt/tts-server/models/` |
| 网页控制台密钥 | `/opt/tts-server/.webui_secret` |

`output/` 是临时音频（10 分钟自动删），`venv/`、`python/` 是运行时可重建，都不用备。

```bash
sudo tar -czf tts-backup-$(date +%F).tar.gz \
  -C /opt/tts-server config.yaml models .webui_secret
```

## 卸载

```bash
# 只停服务、删 systemd 单元（保留安装目录）
sudo bash deploy/linux/uninstall.sh

# 连安装目录一起删（会先把模型备份到 /opt/tts-server.models.bak）
sudo bash deploy/linux/uninstall.sh --purge
```

Windows 整合包直接删目录即可 —— 它是绿色的，不动注册表、不装系统服务。

## 迁移到另一台机器

其实只要三件事：

1. 新机器上跑一遍 `install.sh`（或者复制整合包目录）
2. 把 `config.yaml` + `models/` + `.webui_secret` 拷过去
3. 改 AstrBot 插件里的服务地址

音频缓存不用迁移，换个地方重新生成就行。
