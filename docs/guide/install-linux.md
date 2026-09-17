# Linux 一键安装

支持 **Ubuntu 20.04 / 22.04 / 24.04、Debian 11+（x86_64）**。

## 一条命令

```bash
# 1. 拿到源码
git clone https://github.com/yake1145141/voice-tts-system.git
# 国内网络慢的话，改用加速地址：
# git clone https://gh-proxy.cn/https://github.com/yake1145141/voice-tts-system.git
cd voice-tts-system

# 2. 跑安装脚本（需要 root）
sudo bash deploy/linux/install.sh \
     --model /root/models/MyVoice.pth \
     --index /root/models/MyVoice.index \
     --assets /root/models \
     --api-key 'your-secret-key' \
     --port 8080
```

::: tip 参数都可以省
只有 `--model` 是必需的。`--api-key` 不填会随机生成一个并打印出来，
`--assets` 不填则首次启动联网下载权重。
:::

## 脚本会做什么

一共 9 步，全程有进度输出：

| 步骤 | 内容 |
| --- | --- |
| 1 | 安装系统依赖：ffmpeg、build-essential、curl、espeak-ng |
| 2 | 检查显卡与驱动，显存不足会提醒 |
| 3 | 下载独立 Python 3.12 运行时（不走系统 Python） |
| 4 | 创建虚拟环境，钉住 `setuptools<81` |
| 5 | 安装 **PyTorch 2.5.1+cu121**（约 2.4 GB，最慢的一步） |
| 6 | 安装 `tts-with-rvc` 及全部依赖（含编译 pyworld） |
| 7 | 复制服务端代码、写配置、拷模型与权重 |
| 8 | 注册并启动 systemd 服务 `tts-server` |
| 9 | 等待引擎就绪，做一次端到端合成自检 |

::: warning 为什么一定要 Python 3.12
Linux 上 `tts-with-rvc` 依赖 `fairseq-fixed`，而 PyPI 上只有 **cp312** 的
manylinux wheel。用 3.10 / 3.11 会退化成从源码编译 fairseq，基本必然失败。
所以脚本用 python-build-standalone 装一个独立的 3.12，不污染系统 Python。
:::

::: warning 为什么一定要 cu121 的 PyTorch
Pascal 架构（P106-100 / P4 / P40 / GTX 10 系，计算能力 sm_61）在 cu124 之后
没有编译内核，会报 `no kernel image is available`。
cu121 的架构列表包含 `sm_50 sm_60 sm_70 ...`，P106-100 可以复用 sm_60 内核。
详见[硬件要求](/guide/requirements)。
:::

## 全部参数

| 参数 | 说明 |
| --- | --- |
| `--model PATH` | RVC 模型 `.pth`（**必需**） |
| `--index PATH` | RVC 索引 `.index`（可选但建议） |
| `--assets DIR` | 内含 `hubert_base.pt` / `rmvpe.pt` 的目录（可选，省下载） |
| `--api-key KEY` | 服务密钥（不填随机生成并打印） |
| `--port N` | 监听端口（默认 `8080`） |
| `--device auto\|cuda:0\|cpu` | 推理设备（默认 `auto`） |
| `--max-chars N` | 单段最大字数（默认 `80`；**2 GB 显存填 60**） |
| `--min-vram-mb N` | 低于该显存直接用 CPU（默认 `1800`） |
| `--webui-password P` | 网页控制台密码（不填则打开控制台不需要登录） |
| `--install-dir DIR` | 安装目录（默认 `/opt/tts-server`） |
| `--cpu` | 强制安装 CPU 版 PyTorch（没有 N 卡时） |
| `--dry-run` | 只打印步骤，不实际执行 —— **第一次装建议先跑一遍** |

### 先 dry-run 看看会发生什么

```bash
sudo bash deploy/linux/install.sh \
     --model /root/models/MyVoice.pth --dry-run
```

它会完整走一遍 9 个步骤但不改任何东西，适合确认参数对不对。

## 国内网络加速

脚本默认已经做了两件事：

* Python 运行时优先从**南大 / 中科大镜像**下载（GitHub 在国内常见几十 KB/s）
* 其余 pip 包走 `PIP_INDEX_URL` 指定的源

想换 pip 源可以这样：

```bash
sudo PIP_INDEX_URL=https://pypi.tuna.tsinghua.edu.cn/simple \
  bash deploy/linux/install.sh --model /root/models/MyVoice.pth
```

PyTorch 默认从官方 `download.pytorch.org` 拉（实测 5~19 MB/s），
一般不用换；真要换可以设 `TORCH_INDEX_URL`。

## 装完之后

```bash
systemctl status tts-server      # 服务状态
journalctl -u tts-server -f      # 实时日志（Ctrl+C 退出）
systemctl restart tts-server     # 改完 config.yaml 重启
```

安装脚本最后会打印类似这样的结果：

```text
安装完成

  网页控制台 : http://<服务器IP>:8080/
  API 地址   : http://<服务器IP>:8080/api/tts/file
  API Key    : your-secret-key
  安装目录   : /opt/tts-server
```

接着去做 [验证](/guide/verify)，然后配置 [AstrBot 插件](/client/astrbot)。

## 卸载

```bash
# 只停服务、删 systemd 单元（保留安装目录）
sudo bash deploy/linux/uninstall.sh

# 连安装目录一起删（会先把模型备份到 /opt/tts-server.models.bak）
sudo bash deploy/linux/uninstall.sh --purge
```
