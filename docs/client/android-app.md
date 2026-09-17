# 安卓配置 App

`android-app/dist/tts-server-config.apk` 是给**安卓版服务端**用的配置面板 ——
它管的是跑在手机上的那个服务端。

::: tip 只是想从手机访问服务端？
那不需要装这个 App，用浏览器打开服务端地址就行。
:::

## 安装

```bash
adb install -r android-app/dist/tts-server-config.apk
```

也可以把 APK 拷到手机上手动安装（需要允许「安装未知来源应用」）。

## 能配置什么

![安卓配置 App](/android-app-screenshot.png)

| 配置项 | 说明 |
| --- | --- |
| 端口 | 服务端监听端口 |
| API Key | 与服务端 `security.api_key` 一致 |
| 模型 | 放在手机上的 `.pth` 文件名 |
| f0 算法 | `rmvpe` / `pm` / `dio` 等 |
| 音调 | RVC 变调半音数 |
| 音频保留时间 | 生成的音频多久后自动删除 |
| 并发数 / 线程数 | 手机算力有限，建议保持默认 |

配置完可以一键启停服务、刷新状态、直接试听。

## 电脑怎么连过去

```bash
# 方法一：USB 端口转发（推荐，最稳）
adb forward tcp:8080 tcp:8080
# 然后 AstrBot 里填 http://127.0.0.1:8080

# 方法二：直接用局域网 IP（手机和电脑在同一个 WiFi）
# AstrBot 里填 http://<手机IP>:8080
```

## 性能预期

Snapdragon 8 Gen 3，**CPU 推理**：4 秒音频约 11.5 秒生成（2.78x 实时）。
比桌面 CPU 快，比 GPU 慢约 2.5 倍。

::: warning 安卓 GPU 目前跑不了 RVC
安卓上没有可用的 PyTorch GPU 后端，只能走 CPU。
要用上 GPU 需要改成 ONNX + NNAPI / QNN 重写整条推理链路 ——
有折腾能力的话见仓库里 `deploy/android/README.md` 第六节。
:::

服务端本体的部署步骤见[安卓手机部署](/guide/install-android)。
