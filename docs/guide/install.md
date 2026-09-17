# 部署方式怎么选

::: tip 🇨🇳 国内网络先看这里
GitHub 直连慢或者连不上，在地址前面加上 `https://gh-proxy.cn/` 就能加速：

```bash
# 直连
git clone https://github.com/yake1145141/voice-tts-system.git

# 国内加速（推荐国内用户）
git clone https://gh-proxy.cn/https://github.com/yake1145141/voice-tts-system.git
```

加速站：[gh-proxy.cn](https://gh-proxy.cn) · 使用帮助：[www.gh-proxy.cn](https://www.gh-proxy.cn/)

本文档后面所有 `git clone` 命令都可以这样加前缀。
:::

五种方式都能跑出**完全一样**的服务，区别只在"你手头有什么机器"和"愿意花多少时间"。

| 方式 | 适合场景 | 目标机需要 | 耗时 |
| --- | --- | --- | --- |
| [**Linux 一键安装**](/guide/install-linux) | 有 NVIDIA 显卡的 Linux 服务器 | 一条命令自动搞定 | 10 ~ 20 分钟 |
| [**Windows 整合包**](/guide/install-windows) | 家用 Windows 电脑 | 解压即用，不用装 Python | 5 分钟 |
| [**Docker**](/guide/install-docker) | 已经在用 Docker | NVIDIA Container Toolkit | 10 分钟 |
| [**Google Colab**](/guide/install-colab) | 手头没有显卡 | 一个 Google 账号 | 5 分钟 |
| [**安卓手机**](/guide/install-android) | 想省一台机器 | 有 root 的安卓手机 | 30 分钟 |

## 我的建议

::: tip 第一次部署就走这条路
**Linux 服务器 → [Linux 一键安装](/guide/install-linux)**

它会把 Python 3.12、PyTorch（cu121，老显卡必需）、ffmpeg、本地离线语音、
systemd 服务全部装好，最后还跑一次自检告诉你成没成。
过程中唯一需要你提供的是**一条模型文件路径**和一个**自己想设的密钥**。
:::

**Windows 用户**直接看 [Windows 整合包](/guide/install-windows)，那是最省事的路径
（如果拿不到现成整合包，仓库里有构建脚本可以自己打一个）。

**没有显卡**的话有两个选择：

* 用 [Google Colab](/guide/install-colab) 白嫖免费 GPU（会断线，适合临时体验）
* 把服务端跑在 CPU 上（`rvc.device: "cpu"`），慢 3~5 倍但能用

---

## 部署前必须准备好的两样东西

### ① 一个 RVC 模型

运行前你会需要一个 `.pth` 文件（以及可选的 `.index`）。来源：

* 自己训练的 RVC 模型
* 社区分享的模型

::: warning 关于声音版权
使用他人的声音模型前，请确保已获得授权。
不要用生成的声音冒充他人或从事欺诈 —— 这在多数国家和地区都是违法的。
:::

### ② 一个你想设的 API Key

服务端用它来鉴权，客户端填同一个值才能调用。随便设一串你自己记得住的字符即可，
例如 `my-tts-2026`。留空则完全不校验（**不推荐**，尤其机器在局域网里时）。

### 可选：预置权重

服务端还需要两个权重文件：

| 文件 | 大小 | 说明 |
| --- | --- | --- |
| `hubert_base.pt` | 约 180 MB | RVC 的特征提取模型 |
| `rmvpe.pt` | 约 173 MB | 音高提取模型（`f0_method: rmvpe` 时用） |

不准备也行 —— 服务端首次启动会联网下载。但**国内经常连不上 HuggingFace**，
表现是启动卡好几分钟然后超时，所以强烈建议提前放到服务端目录里。

如果你本地已经有这两个文件，Linux 安装脚本可以用 `--assets` 参数直接指过去：

```bash
sudo bash deploy/linux/install.sh \
     --model /path/MyVoice.pth --index /path/MyVoice.index \
     --assets /path/已有权重的目录 --api-key 你的密钥
```

---

## 装完之后要做什么

不管用哪种方式部署，装完都是同一个终点：

1. 打开网页控制台 `http://<服务器IP>:8080/`，确认「服务状态 正常」
2. 用自带客户端发一句话试试 → [验证是否装好](/guide/verify)
3. 回到 AstrBot 那边装插件、填地址和密钥 → [AstrBot 插件](/client/astrbot)
