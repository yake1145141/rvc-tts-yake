# 客户端总览

服务端只是个 HTTP 服务，**谁都能调**。仓库里现成提供了四种客户端：

| 客户端 | 适合谁 | 在哪 |
| --- | --- | --- |
| [**AstrBot 插件**](/client/astrbot) | 用 AstrBot 的人（主要场景） | 独立仓库 [astrbot_plugin_voice_reply](https://github.com/yake1145141/astrbot_plugin_voice_reply) |
| [**命令行客户端**](/client/cli#命令行客户端) | 想快速测试、批量合成、压测 | `tools/tts_client.py` |
| [**单文件调用库**](/client/cli#单文件调用库) | 要写自己的程序调用 | `tools/voice_tts.py` |
| [**安卓配置 App**](/client/android-app) | 管理安卓版服务端 | `android-app/dist/tts-server-config.apk` |

::: tip 除了 AstrBot 插件，其余三个都是零依赖
`tts_client.py` 和 `voice_tts.py` **只用 Python 标准库**，
不需要 `pip install` 任何东西，拷到哪都能跑。
:::

## 三种调用方式怎么选

```text
你在用 AstrBot？
    → 装插件，填个地址和密钥就完事

只是想试试服务通不通？
    → python tools/tts_client.py say "你好" --play

要在自己的项目里调用？
    → 把 tools/voice_tts.py 复制过去，3 行代码搞定

不是 Python 项目？
    → 直接调 HTTP 接口，见 /reference/api
```

## 服务端地址怎么填

不管用哪种客户端，都只需要两个值：

```yaml
服务地址: http://<服务器IP>:8080
API Key : 与服务端 security.api_key 一致
```

| 客户端在哪 | 服务端地址填什么 |
| --- | --- |
| 同一台机器 | `http://127.0.0.1:8080` |
| 局域网另一台机器 | `http://192.168.x.x:8080` |
| 走公网 / 内网穿透 | `https://your-domain.com`（**务必上 HTTPS**） |

::: warning 密钥一定要一致
服务端配了 `security.api_key` 而客户端没填（或填错），
会返回 401 并**降级为文字回复** —— 功能不崩，但你会一直收不到语音。
:::
