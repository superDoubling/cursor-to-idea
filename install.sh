#!/bin/bash

# 安装脚本：用于安装Cursor到IntelliJ IDEA跳转扩展（无需配置命令行工具）

# 颜色
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}开始安装 Cursor到IntelliJ IDEA跳转扩展...${NC}"

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo -e "${RED}错误: 未找到Node.js。请先安装Node.js。${NC}"
    exit 1
fi

# 检查npm是否安装
if ! command -v npm &> /dev/null; then
    echo -e "${RED}错误: 未找到npm。请先安装npm。${NC}"
    exit 1
fi

# 当前脚本所在目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$SCRIPT_DIR"

# 安装依赖
echo -e "${YELLOW}安装依赖...${NC}"
npm install

# 检查vsce是否安装
if ! command -v vsce &> /dev/null; then
    echo -e "${YELLOW}安装vsce...${NC}"
    npm install -g @vscode/vsce
fi

# 编译扩展
echo -e "${YELLOW}编译扩展...${NC}"
npm run compile

# 打包扩展
echo -e "${YELLOW}打包扩展...${NC}"
vsce package

# 找到最新的vsix文件
VSIX_FILE=$(ls -t *.vsix | head -1)

if [ -z "$VSIX_FILE" ]; then
    echo -e "${RED}错误: 未能生成VSIX文件。${NC}"
    exit 1
fi

echo -e "${GREEN}扩展包已生成: $VSIX_FILE${NC}"
echo -e "${YELLOW}现在，请在Cursor中执行以下步骤:${NC}"
echo "1. 打开Cursor"
echo "2. 按下Ctrl+Shift+P或Command+Shift+P打开命令面板"
echo "3. 输入'Install from VSIX'并选择"
echo "4. 选择生成的VSIX文件: $SCRIPT_DIR/$VSIX_FILE"
echo "5. 重启Cursor"

# 检查操作系统，提供额外提示
OS=$(uname)
if [ "$OS" = "Darwin" ]; then
    echo -e "\n${YELLOW}macOS用户注意事项:${NC}"
    echo "1. 首次使用时，系统可能会要求授予Cursor辅助功能权限"
    echo "2. 如果出现权限请求，请点击'允许'"
    echo "3. 或手动前往 系统偏好设置 > 安全性与隐私 > 隐私 > 辅助功能，确保Cursor已勾选"
elif [ "$OS" = "Linux" ]; then
    echo -e "\n${YELLOW}Linux用户注意事项:${NC}"
    echo "确保已安装IntelliJ IDEA，扩展会自动查找常见安装位置"
else
    echo -e "\n${YELLOW}Windows用户注意事项:${NC}"
    echo "确保已安装IntelliJ IDEA，扩展会自动查找常见安装位置及注册表"
fi

echo -e "\n${GREEN}安装脚本完成! 无需额外配置IntelliJ IDEA命令行工具。${NC}" 