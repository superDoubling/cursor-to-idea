# Cursor 到 IntelliJ IDEA 跳转

这个扩展允许您快速地从 Cursor 编辑器跳转到 IntelliJ IDEA，并在 IntelliJ IDEA 中打开相同的文件和行号位置。

## 功能

- 从 Cursor 一键跳转到 IntelliJ IDEA
- 自动打开相同的文件
- 自动定位到相同的行号
- 支持项目自动识别
- 跨平台支持 (macOS, Windows, Linux)

## 使用方法

1. 在 Cursor 中打开一个文件
2. 使用快捷键 `Cmd+Y` (macOS) 或 点击右键菜单中的 "跳转到IntelliJ IDEA"
3. 文件将在 IntelliJ IDEA 中打开并跳转到相同的行号

## 自定义设置

您可以在设置中自定义以下选项：

- `cursorIntellijBridge.ideaPath`: 自定义 IntelliJ IDEA 的安装路径（如果自动检测失败）

## 自定义快捷键

默认快捷键是 `Cmd+Y`，您可以在 VS Code 的键盘快捷方式设置中自定义：

1. 打开命令面板 (Cmd+Shift+P)
2. 搜索 "Preferences: Open Keyboard Shortcuts"
3. 搜索 "跳转到IntelliJ IDEA"
4. 点击快捷键并设置您喜欢的组合

## 问题反馈

如有问题或建议，请在 [GitHub 仓库](https://github.com/superDoubling/cursor-to-idea) 提交 issue。

## 许可证

MIT 