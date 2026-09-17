# AstrBot 插件

插件有**独立仓库**，AstrBot 官方推荐的分发方式就是「仓库根目录即插件目录」：

::: tip 插件仓库
**<https://github.com/yake1145141/astrbot_plugin_voice_reply>**
:::

> 主仓库里的 `astrbot_plugin_voice_reply/` 是同一份源码（打整合包时要用到），两边内容保持一致。

## 安装

### 1. 先部署好服务端

插件只是客户端，**必须先有服务端**。没装的话看[部署方式怎么选](/guide/install)。

装好后确认服务端可达：

```bash
curl http://127.0.0.1:8080/api/health
```

### 2. 把插件放进 AstrBot

```bash
cd AstrBot/data/plugins
git clone https://github.com/yake1145141/astrbot_plugin_voice_reply.git
```

也可以用 AstrBot 插件市场安装，或者手动下载 zip 解压到同一位置。

目录名保持 `astrbot_plugin_voice_reply`，里面应该直接就是
`main.py`、`metadata.yaml`、`requirements.txt`、`_conf_schema.json`。

### 3. 启用插件

打开 AstrBot WebUI → **插件管理** → 找到 `astrbot_plugin_voice_reply` → 点 **启用 / 重载插件**。

日志里应该出现：

```text
[VoiceReply] v1.0.0 已加载 | 语音回复=开启 | 服务=http://127.0.0.1:8080
             | 交付方式=auto | 最大长度=300 | 并发=2 | 超时=60s | API Key=已配置
```

### 4. 填写服务地址

在插件配置页填两个**必填项**：

| 配置项 | 填什么 |
| --- | --- |
| `TTS 服务地址` | 例如 `http://192.168.1.10:8080` |
| `TTS 服务 API Key` | 与服务端 `security.api_key` 一致 |

::: warning 请关掉 AstrBot 自带的 TTS
避免两套语音合成同时生效。
:::

::: warning 请关掉「流式输出（streaming_response）」
流式模式下文本会逐段发给用户、结束时不再发送完整消息，插件无法把它替换为语音。
日志里会给出明确提示。
:::

---

## 全部配置项

```yaml
tts_server:
  url: "http://127.0.0.1:8080"   # 语音处理端地址
  api_key: ""                    # 与服务端 security.api_key 保持一致
  delivery: "auto"               # auto / file / url

voice:
  enabled: true                  # 总开关（也可用 /voice on|off）
  max_text_length: 300           # 超过该长度直接发文字
  timeout: 60                    # 单次 TTS 请求超时（秒）
  max_concurrent: 2              # 最大并发请求数
  keep_text: false               # true = 语音 + 原文一起发
  only_llm_result: false         # true = 只处理大模型回复
  cleanup_markdown: true         # 去掉 ** ` # 等 Markdown 符号
  cache_expire_minutes: 60       # 本地音频缓存过期时间
  skip_platforms:                # 这些平台不支持语音消息，直接发文字
    - qq_official
    - qq_official_webhook
    - dingtalk
    - lark
```

### delivery 三种模式

| 值 | 行为 | 适用场景 |
| --- | --- | --- |
| `file` | 插件通过 `POST /api/tts/file` 下载音频到本地，再以本地文件发送 | AstrBot 与协议端在同一台机器（**最稳**） |
| `url` | 插件拿到 `audio_url` 后直接交给消息平台拉取 | 语音服务地址能被 QQ / Telegram 等平台访问 |
| `auto`（默认） | 先试 `file`，失败再退回 `url` | 大多数场景 |

---

## 功能

| 功能 | 说明 |
| --- | --- |
| 拦截 AI 文本回复 | 用官方 `on_decorating_result`（发送消息前）钩子，不使用任何废弃 API |
| 括号内容过滤 | 删除 `（）` `()` `[]` `【】` 及其内部内容，支持**嵌套** |
| 可朗读文本判断 | 过滤后为空（如整个回复是 `[笑]`）时不调用 TTS，正常发原文 |
| 最大长度限制 | 超过 `voice.max_text_length` 直接发文字，不浪费 GPU |
| TTS 失败自动降级 | 连接失败 / 超时 / RVC 失败 / API Key 错误 / 音频为空 → 恢复原文发送 |
| 并发与排队 | 异步 HTTP + 信号量限流，多会话同时回复不会拖垮语音服务 |
| 防重复处理 | 事件标记 + 消息段替换双重保证，插件产生的消息不会被再次送去 TTS |
| 语音消息发送 | 使用官方 `Record` 消息段；不支持语音的平台自动回退文字 |
| 管理指令 | `/voice on`、`/voice off`、`/voice status`（仅管理员） |
| WebUI 配置 | 提供 `_conf_schema.json`，可在 AstrBot 管理面板直接改 |

---

## 文本处理规则

实现方式是**字符扫描 + 深度计数**（不是简单正则暴力删除），所以能正确处理嵌套括号。

| 输入 | 送去合成的文本 |
| --- | --- |
| `你好呀！` | `你好呀！` |
| `你好呀！（开心地笑）` | `你好呀！` |
| `Hello! (smile)` | `Hello!` |
| `你好！[挥手]` + 换行 + `很高兴认识你！` | `你好！` + 换行 + `很高兴认识你！` |
| `【系统提示】你好，很高兴见到你。` | `你好，很高兴见到你。` |
| `你好！（开心地说：[笑]）` | `你好！` |
| `（开心）[笑]【挥手】` | **空** → 不调用 TTS，正常发原文 |

孤立的右括号按普通文本保留；未闭合的左括号视为其内容不可朗读。

---

## 指令

| 指令 | 权限 | 说明 |
| --- | --- | --- |
| `/voice on` | 管理员 | 开启语音回复（会持久化，重启后保持） |
| `/voice off` | 管理员 | 关闭语音回复，AI 回复全部以文字发送 |
| `/voice status` | 管理员 | 查看开关、服务地址、健康状态、本次运行统计 |

普通用户无需任何指令即可正常使用语音回复。
管理指令使用 AstrBot 官方的 `PermissionType.ADMIN` 权限校验
（管理员 ID 在 AstrBot 主配置的 `admins_id` 里设置）。

---

## 平台支持

| 平台 | 语音消息 | 说明 |
| --- | --- | --- |
| QQ 个人号（aiocqhttp / NapCat / Lagrange） | ✅ | 推荐 |
| Telegram | ✅ | |
| 企业微信（wecom） | ✅ | |
| QQ 官方接口、钉钉、飞书 | ❌ | 适配器不支持 `Record`，插件自动发文字（见 `skip_platforms`） |

---

## 常见问题

**Q：AI 回复直接变成了文字，没有语音？**

看 AstrBot 日志里 `[VoiceReply]` 开头的行：

| 日志 | 原因 |
| --- | --- |
| `TTS 服务连接失败` | 检查 `tts_server.url`、防火墙、服务是否启动 |
| `TTS 服务返回错误 [unauthorized]` | 两端 API Key 不一致 |
| `文本长度 xx 超过上限` | 调大 `voice.max_text_length` |
| `过滤后没有可朗读文本` | 该回复只有括号内容，属于预期行为 |
| `平台 qq_official 不支持语音消息` | 换了平台或改了 `skip_platforms` |
| `检测到 AstrBot 流式输出` | 请在 AstrBot 配置里关闭 streaming_response |

**Q：第一次语音回复特别慢？**

RVC 首次推理需要加载模型（10~60 秒）。服务端默认开启 `rvc.preload` 会在启动时预热，
所以等它启动完再聊天就没这个问题。

**Q：语音太长？**

调小 `voice.max_text_length`（例如 150），超长回复会直接以文字发送。

**Q：多个群同时说话会卡吗？**

插件用信号量限制并发（`max_concurrent`），服务端也有自己的队列与并发限制，
超出部分会排队或直接降级为文字，不会阻塞 AstrBot 主事件循环。

**Q：能每个用户用不同音色吗？**

本插件是**固定单一模型**设计，模型名只在服务端 `config.yaml` 配置一处。
需要多音色的话，可以复制多份服务端实例（不同端口 + 不同模型），
再配合多个 AstrBot 实例或配置。
