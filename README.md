# Cursor到IntelliJ IDEA跳转扩展

这个扩展允许你从Cursor编辑器一键跳转到IntelliJ IDEA，并自动打开相同的文件和行号。按下`Command+Y`快捷键即可触发跳转。无需配置IntelliJ IDEA命令行工具！

## 功能

- 按下`Command+Y`快捷键从Cursor跳转到IntelliJ IDEA
- 自动打开当前编辑的文件
- 自动跳转到当前光标所在的行
- 支持macOS、Windows和Linux平台
- **无需配置IntelliJ IDEA命令行工具**

## 前提条件

- 已安装Cursor编辑器
- 已安装IntelliJ IDEA（任何版本：社区版或旗舰版）

## 工作原理

- **在macOS上**：使用AppleScript自动操作IntelliJ IDEA，模拟键盘操作打开文件并跳转到指定行
- **在Windows上**：自动搜索IntelliJ IDEA安装路径并直接启动应用程序
- **在Linux上**：自动检测IntelliJ IDEA安装位置并启动

## 安装

由于Cursor基于VS Code，你可以通过以下方式安装此扩展：

### 从VSIX文件安装

1. 编译扩展并生成VSIX文件
   ```bash
   cd src/plugins/cursor-intellij-extension
   npm install
   npm run compile
   npx vsce package
   ```

2. 在Cursor中安装VSIX文件
   - 打开Cursor
   - 按下`Ctrl+Shift+P`或`Command+Shift+P`打开命令面板
   - 输入"Install from VSIX"并选择
   - 选择生成的VSIX文件
   - 重启Cursor

### 快速安装

最简单的方法是使用我们提供的安装脚本：

```bash
cd src/plugins/cursor-intellij-extension
chmod +x install.sh
./install.sh
```

### 开发模式安装

1. 克隆此仓库
2. 打开命令行，进入扩展目录
   ```bash
   cd src/plugins/cursor-intellij-extension
   npm install
   ```
3. 使用VS Code打开此目录，按下F5开始调试
   - 或者将此扩展目录链接或复制到Cursor的扩展目录中

## 使用方法

1. 在Cursor中打开任意文件
2. 将光标定位到你想要在IntelliJ IDEA中查看的行
3. 按下`Command+Y`快捷键（macOS）或在命令面板中搜索"跳转到IntelliJ IDEA"
4. IntelliJ IDEA将自动打开并跳转到相同的文件和行号

## 自定义快捷键

如果你想更改默认的`Command+Y`快捷键：

1. 打开Cursor的键盘快捷键设置
2. 搜索"cursorIntellijBridge.jumpToIntelliJ"
3. 点击编辑按钮，设置你喜欢的快捷键

## 故障排除

如果跳转不工作，请检查：

1. 确保IntelliJ IDEA已安装且可以正常启动
2. 确保文件路径是正确的并且文件存在于两个编辑器都可访问的位置
3. 检查控制台输出是否有错误信息

### macOS特定问题

- 如果你在macOS上遇到权限问题，请确保Cursor有权限控制其他应用程序：
  1. 打开系统偏好设置 > 安全性与隐私 > 隐私 > 辅助功能
  2. 确保Cursor在列表中并已勾选

### Windows特定问题

- 如果扩展无法找到IntelliJ IDEA，请尝试重新安装IntelliJ IDEA或手动编辑扩展代码指定路径

### Linux特定问题

- 在Linux上，如果找不到IntelliJ IDEA，请尝试创建符号链接：
  ```bash
  sudo ln -s /path/to/your/idea/bin/idea.sh /usr/local/bin/intellij-idea
  ```

## 贡献

欢迎提交Pull Request或开Issue报告问题。

## 许可证

MIT 