# Windows 整合包

整合包是**解压即用**的绿色包：内置 Python 运行时 + CUDA 版 PyTorch + ffmpeg，
目标机不需要装任何东西，也不用联网装依赖。

## 一、用现成的整合包

### 目录结构

```text
tts-server-win64-cuda\
├── 启动语音服务.bat          ← 双击启动（关掉窗口就停止）
├── 后台启动.bat              ← 后台启动（关掉窗口继续跑）
├── 停止服务.bat
├── 首次运行检查.bat          ← 第一次务必先跑这个
├── 诊断信息.bat              ← 出问题跑它，把 diagnostics.txt 发给别人求助
├── 编辑配置.bat              ← 打开 config.yaml
├── 查看日志.bat
├── 测试合成.bat              ← 合成一句话试听
├── 打开输出目录.bat
├── 应用补丁.bat              ← 覆盖安装补丁（自动备份原文件）
├── 启用本地语音兜底.bat       ← 把 tts.source 改成 auto
├── 升级到老显卡版torch.bat    ← P4 / P40 / P106 等 sm_61 老卡专用
├── models\                   ← 放你的 .pth / .index
├── config.yaml
├── hubert_base.pt / rmvpe.pt
└── app\  bin\  python\  output\  logs\
```

### 步骤

1. **解压到不含中文和空格的路径**，例如 `D:\tts-server-win64-cuda`

   ::: warning 路径里有中文会出问题
   部分依赖在处理中文路径时会出错，请务必用纯英文路径。
   :::

2. 把 `.pth` / `.index` 放进 `models\`

3. 双击 `编辑配置.bat`，改这几个值：

   ```yaml
   security:
     api_key: "换成你自己的密钥"
   rvc:
     model: "MyVoice.pth"
     index: "MyVoice.index"
   ```

4. 双击 `首次运行检查.bat`，确认输出里能看到 `cuda_available True`
5. 双击 `启动语音服务.bat`
6. 浏览器打开 `http://127.0.0.1:8080/` 看网页控制台

### 老显卡必须多做一步

P106-100 / P4 / P40 / GTX 10 系这些 Pascal 卡（计算能力 sm_61）
**必须先跑一次 `升级到老显卡版torch.bat`**（约 2.5 GB 下载）。

它会装 `torch 2.5.1+cu121` —— 这是唯一包含 Pascal 兼容内核的版本。

不跑的话，第一次推理会报：

```text
CUDA error: operation not supported
no kernel image is available for execution on the device
```

---

## 二、自己构建整合包

拿不到现成整合包时，用仓库里的脚本自己打一个。

### 环境要求

* 一台**能上网的 Windows**
* 磁盘留 10 GB 以上
* 提前准备好模型和权重（`hubert_base.pt` / `rmvpe.pt`）

### 构建

```powershell
git clone https://github.com/yake1145141/voice-tts-system.git
cd voice-tts-system

powershell -ExecutionPolicy Bypass -File deploy\windows\build-bundle.ps1 `
  -Model D:\models\MyVoice.pth `
  -Index D:\models\MyVoice.index `
  -Assets D:\models `
  -ApiKey your-secret-key `
  -Zip
```

产物在 `dist\windows\tts-server-win64-cuda\`，压缩后约 3.5 GB。

### 老卡专用的构建命令

默认构建的是 cu128 版 torch（适合 RTX 20 系以上）。
**Pascal 老卡必须显式指定 cu121：**

```powershell
powershell -ExecutionPolicy Bypass -File deploy\windows\build-bundle.ps1 `
  -Model D:\models\MyVoice.pth -Index D:\models\MyVoice.index `
  -Assets D:\models -TorchVersion 2.5.1 -CudaTag cu121 -Zip
```

### 参数

| 参数 | 说明 |
| --- | --- |
| `-Model` | RVC 模型 `.pth`（**必需**） |
| `-Index` | RVC 索引 `.index`（建议） |
| `-Assets` | 内含 `hubert_base.pt` / `rmvpe.pt` 的目录（建议，省得首次运行联网下载） |
| `-ApiKey` | 服务密钥（默认 `win-tts-key`） |
| `-Port` | 监听端口（默认 `8080`） |
| `-Variant` | `cuda`（默认）或 `cpu` |
| `-TorchVersion` | 例如 `2.5.1`（配合 `-CudaTag cu121`） |
| `-CudaTag` | `cu121` / `cu124` / `cu128`；**老卡必须 `cu121`** |
| `-Zip` | 构建完顺便打包成 zip |
| `-LaunchersOnly` | 只刷新启动脚本，不动 Python 环境（打补丁时用） |

---

## 三、不打包，直接在 Windows 上跑源码

已经装了 Python 3.12 的话：

```powershell
cd tts-server
python -m venv .venv
.\.venv\Scripts\python -m pip install --upgrade pip wheel
.\.venv\Scripts\python -m pip install "setuptools<81"
.\.venv\Scripts\python -m pip install torch==2.5.1+cu121 torchaudio==2.5.1+cu121 --index-url https://download.pytorch.org/whl/cu121
.\.venv\Scripts\python -m pip install -r requirements.txt

# 把 hubert_base.pt / rmvpe.pt 放到 tts-server\，模型放到 tts-server\models\
.\.venv\Scripts\python main.py --config config.yaml
```

::: tip 工作目录会自动切
`main.py` 启动时会自动把工作目录切到包含 `hubert_base.pt` 的目录，
所以权重放哪都不用额外配置。它还会把 `<服务目录>\bin` 加进 PATH（放 ffmpeg 用）。
:::

Windows 上还有一点和 Linux 不同：**离线语音兜底用的是系统自带的 SAPI5**，
不需要额外安装 espeak-ng。确认方法：

```powershell
Add-Type -AssemblyName System.Speech
(New-Object System.Speech.Synthesis.SpeechSynthesizer).GetInstalledVoices() |
  ForEach-Object { $_.VoiceInfo.Name + " | " + $_.VoiceInfo.Culture.Name }
```

能看到 `Microsoft Huihui Desktop | zh-CN` 之类的条目就说明可用。
