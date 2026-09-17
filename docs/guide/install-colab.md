# Google Colab 部署

手头没有显卡时，可以白嫖 Colab 的免费 GPU。

::: warning 只适合临时体验
Colab 会不定期断开连接、回收运行时，**不适合长期挂机**。
想稳定使用还是建议找一台有显卡的机器走 [Linux 一键安装](/guide/install-linux)。
:::

## 步骤

1. 打开仓库里的 Notebook：

   <https://github.com/yake1145141/voice-tts-system/blob/main/deploy/colab/tts-server-colab.ipynb>

2. 下载后上传到 [Google Colab](https://colab.research.google.com/)，或者直接在 Colab 里
   「文件 → 上传笔记本」

3. 菜单 **运行时 → 更改运行时类型**，硬件加速器选 **T4 GPU**

4. 从上往下依次执行单元格

5. 第 8 个单元格会打印出公网地址和插件配置片段：

   ```text
   https://xxxx-xxxx.trycloudflare.com
   ```

   用这个地址去配置 [AstrBot 插件](/client/astrbot)。

## 几个要点

* **服务端代码已经内嵌在 Notebook 里** —— 不用上传源码、不用 `git clone`
* **模型从 Google Drive 读取** —— 执行到对应单元格时会让你授权挂载 Drive，
  然后把 `.pth` 放到指定目录即可
* Notebook 里**已经内置了 API Key 鉴权**，公网地址不会裸奔
* 最后一个单元格可以一键停止服务

## 免费额度用完了怎么办

* 换一个 Google 账号
* 或者改成本地 CPU 跑：速度慢 3~5 倍，但完全免费且不用管断线
* 或者按量租一台带 T4 / P4 的云服务器（显存 ≥ 4 GB 体验更好）
