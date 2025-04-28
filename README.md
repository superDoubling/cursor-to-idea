# Cursor to IntelliJ IDEA Bridge

[中文版](#cursor-到-intellij-idea-跳转) | [English](#cursor-to-intellij-idea-bridge-1)

## Cursor 到 IntelliJ IDEA 跳转

这个扩展允许您快速地从 Cursor 编辑器跳转到 IntelliJ IDEA，并在 IntelliJ IDEA 中打开相同的文件和行号位置。

### 功能

- 从 Cursor 一键跳转到 IntelliJ IDEA
- 自动打开相同的文件
- 自动定位到相同的行号
- 支持项目自动识别
- 跨平台支持 (macOS, Windows, Linux)

### 使用方法

1. 在 Cursor 中打开一个文件
2. 使用快捷键 `Cmd+Shift+Y` (macOS) 或 点击右键菜单中的 "跳转到IntelliJ IDEA"
3. 文件将在 IntelliJ IDEA 中打开并跳转到相同的行号

### 自定义设置

您可以在设置中自定义以下选项：

- `cursorIntellijBridge.ideaPath`: 自定义 IntelliJ IDEA 的安装路径（如果自动检测失败）

### 自定义快捷键

默认快捷键是 `Cmd+Shift+Y`，您可以在 VS Code 的键盘快捷方式设置中自定义：

1. 打开命令面板 (Cmd+Shift+P)
2. 搜索 "Preferences: Open Keyboard Shortcuts"
3. 搜索 "跳转到IntelliJ IDEA"
4. 点击快捷键并设置您喜欢的组合

### 问题反馈

如有问题或建议，请在 [GitHub 仓库](https://github.com/superDoubling/cursor-to-idea) 提交 issue。

---

## Cursor to IntelliJ IDEA Bridge

This extension allows you to quickly jump from the Cursor editor to IntelliJ IDEA, opening the same file and line position in IntelliJ IDEA.

### Features

- One-click jump from Cursor to IntelliJ IDEA
- Automatically opens the same file
- Automatically navigates to the same line number
- Project auto-detection support
- Cross-platform support (macOS, Windows, Linux)

### Usage

1. Open a file in Cursor
2. Use the shortcut `Cmd+Shift+Y` (macOS) or click "Jump to IntelliJ IDEA" in the context menu
3. The file will open in IntelliJ IDEA and jump to the same line

### Custom Settings

You can customize the following options in the settings:

- `cursorIntellijBridge.ideaPath`: Custom path to IntelliJ IDEA application (if auto-detection fails)

### Custom Keyboard Shortcuts

The default shortcut is `Cmd+Shift+Y`. You can customize it in VS Code's keyboard shortcuts settings:

1. Open the Command Palette (Cmd+Shift+P)
2. Search for "Preferences: Open Keyboard Shortcuts"
3. Search for "Jump to IntelliJ IDEA"
4. Click on the shortcut and set your preferred combination

### Feedback

For issues or suggestions, please submit an issue on the [GitHub repository](https://github.com/superDoubling/cursor-to-idea).

## License

MIT 