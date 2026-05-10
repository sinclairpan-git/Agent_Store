# AI-SDLC 用户指南

当前发布版：`v0.7.9`

## 启动路径

### 第零点五章：从安装到首次使用的命令卡片

普通用户主路径是先在目标仓库执行：

```sh
ai-sdlc init .
```

初始化会执行安全预演。当前结果 / Result 会说明适配器和预演状态；
下一步 / Next 会给出一条中英双语后续命令。用户不用再手动执行初始化命令，
随后切换到 AI 对话继续。旧文档里的
`ai-sdlc install` 已不是当前入口；如果看到 `No such command 'install'`，
请改用当前更新路径。

## 更新路径

```sh
ai-sdlc self-update check
ai-sdlc self-update check --upgrade-existing
```

发布页路径包含 `releases/download/v0.7.9`。

## 离线包

- Windows `.zip`：`ai-sdlc-offline-0.7.9-windows-amd64.zip`
- macOS `.tar.gz`：`ai-sdlc-offline-0.7.9-macos-arm64.tar.gz`
- Linux `.tar.gz`：`ai-sdlc-offline-0.7.9-linux-amd64.tar.gz`
