"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const child_process_1 = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");
/**
 * 尝试查找文件所属的项目根目录
 * @param filePath 文件路径
 * @returns 项目根目录，如果找不到则返回null
 */
function findProjectRoot(filePath) {
    let currentDir = path.dirname(filePath);
    let foundRoot = null;
    // 向上查找最多15层目录
    for (let i = 0; i < 15; i++) {
        // 关键项目标识文件优先级（从高到低）
        const highPriorityMarkers = [
            '.git',
            '.idea', // IntelliJ IDEA项目配置
        ];
        // 常规项目标识文件
        const normalPriorityMarkers = [
            'pom.xml',
            'build.gradle',
            'package.json',
            'tsconfig.json',
            'Cargo.toml',
            'go.mod',
            'CMakeLists.txt',
            'build.sbt',
            'Makefile',
            'settings.gradle',
            'gradlew',
            'mvnw',
            'build.xml', // Ant构建文件
        ];
        // 先检查高优先级标记
        for (const marker of highPriorityMarkers) {
            if (fs.existsSync(path.join(currentDir, marker))) {
                // 发现高优先级标记，记录当前目录作为潜在项目根目录
                foundRoot = currentDir;
                break;
            }
        }
        // 如果找到了高优先级标记，记录但继续向上查找
        // 如果没有高优先级标记，检查常规标记
        if (!foundRoot) {
            for (const marker of normalPriorityMarkers) {
                if (fs.existsSync(path.join(currentDir, marker))) {
                    // 找到常规标记，记录当前目录作为潜在项目根目录
                    foundRoot = currentDir;
                    break;
                }
            }
        }
        // 如果到达了根目录，则停止搜索
        const parentDir = path.dirname(currentDir);
        if (parentDir === currentDir) {
            break;
        }
        // 继续向上查找
        currentDir = parentDir;
    }
    // 返回找到的最顶层项目根目录
    return foundRoot;
}
/**
 * 检查项目是否已在IntelliJ IDEA中打开
 * 这个函数尝试通过多种方式检查项目是否已在IntelliJ IDEA中打开
 * @param projectPath 项目路径
 * @returns 如果项目已打开则返回true，否则返回false
 */
function isProjectOpenInIntelliJ(projectPath) {
    try {
        const platform = os.platform();
        if (platform === 'darwin') { // macOS
            // 在macOS上，使用AppleScript获取IntelliJ IDEA的窗口标题
            // 窗口标题通常包含项目名称
            try {
                const projectName = path.basename(projectPath);
                const appleScriptCommand = `
          tell application "System Events"
            set appList to name of every application process where name contains "IntelliJ"
            if appList is not {} then
              set ideaApp to item 1 of appList
              tell process ideaApp
                set winTitles to name of every window
                set hasProject to false
                repeat with t in winTitles
                  if t contains "${projectName}" then
                    set hasProject to true
                    exit repeat
                  end if
                end repeat
                return hasProject
              end tell
            end if
            return false
          end tell
        `;
                const result = (0, child_process_1.execSync)(`osascript -e '${appleScriptCommand.replace(/'/g, "'\\''")}' 2>/dev/null`).toString().trim();
                return result === 'true';
            }
            catch (error) {
                console.error("检查项目窗口失败:", error);
                return false; // 出错时保守假设项目未打开
            }
        }
        else if (platform === 'win32') { // Windows
            // 在Windows上，使用PowerShell获取窗口标题
            try {
                const projectName = path.basename(projectPath);
                // 使用PowerShell获取窗口标题列表
                const command = `powershell -command "[void][System.Reflection.Assembly]::LoadWithPartialName('System.Windows.Forms'); [System.Windows.Forms.Application]::EnableVisualStyles(); $titles = @(Get-Process | Where-Object { $_.MainWindowTitle -like '*IntelliJ*' -or $_.Name -like '*idea*' } | ForEach-Object { $_.MainWindowTitle }); $found = $false; foreach ($title in $titles) { if ($title -like '*${projectName}*') { $found = $true; break; } }; return $found"`;
                const result = (0, child_process_1.execSync)(command).toString().trim();
                return result.toLowerCase() === 'true';
            }
            catch (error) {
                console.error("检查Windows项目窗口失败:", error);
                return false; // 出错时保守假设项目未打开
            }
        }
        else { // Linux
            // 在Linux上，使用wmctrl获取窗口标题（如果可用）
            try {
                const projectName = path.basename(projectPath);
                const result = (0, child_process_1.execSync)(`wmctrl -l | grep -i "${projectName}" | grep -i "IntelliJ" || echo "Not found"`).toString();
                return !result.includes("Not found");
            }
            catch (error) {
                console.error("检查Linux项目窗口失败:", error);
                return false; // 出错时保守假设项目未打开
            }
        }
        return false; // 默认保守假设项目未打开
    }
    catch (error) {
        console.error("检查项目是否已打开时出错:", error);
        return false; // 出错时保守假设项目未打开
    }
}
/**
 * 从Cursor跳转到IntelliJ IDEA，并打开相同的文件和行号
 * @param filePath 当前在Cursor中打开的文件路径
 * @param lineNumber 当前在Cursor中的行号
 */
function jumpToIntelliJ(filePath, lineNumber) {
    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
        vscode.window.showErrorMessage(`文件不存在: ${filePath}`);
        return;
    }
    // 获取文件的绝对路径
    const absolutePath = path.resolve(filePath);
    // 尝试查找项目根目录
    const projectRoot = findProjectRoot(absolutePath);
    if (!projectRoot) {
        vscode.window.showWarningMessage(`未能找到文件 ${absolutePath} 所属的项目根目录，将直接打开文件`);
        // 如果找不到项目根目录，将直接尝试打开文件
    }
    else {
        console.log(`检测到项目根目录: ${projectRoot}`);
    }
    // 检查项目是否已在IntelliJ IDEA中打开
    const isProjectOpen = projectRoot ? isProjectOpenInIntelliJ(projectRoot) : false;
    // 根据操作系统使用不同的方法打开IntelliJ IDEA
    const platform = os.platform();
    try {
        if (platform === 'darwin') { // macOS
            // 获取IntelliJ IDEA的可执行路径和应用程序路径
            const possibleScriptPaths = [
                '/Applications/IntelliJ IDEA.app/Contents/MacOS/idea',
                '/Applications/IntelliJ IDEA CE.app/Contents/MacOS/idea',
                '/Applications/IntelliJ IDEA Ultimate.app/Contents/MacOS/idea',
                '/usr/local/bin/idea'
            ];
            const possibleAppPaths = [
                '/Applications/IntelliJ IDEA.app',
                '/Applications/IntelliJ IDEA CE.app',
                '/Applications/IntelliJ IDEA Ultimate.app'
            ];
            let ideaScript = '';
            for (const scriptPath of possibleScriptPaths) {
                if (fs.existsSync(scriptPath)) {
                    ideaScript = scriptPath;
                    break;
                }
            }
            let ideaAppPath = '';
            for (const appPath of possibleAppPaths) {
                if (fs.existsSync(appPath)) {
                    ideaAppPath = appPath;
                    break;
                }
            }
            if (!ideaAppPath) {
                vscode.window.showErrorMessage('未找到IntelliJ IDEA应用程序');
                return;
            }
            // 如果项目未在IntelliJ IDEA中打开，先打开项目
            if (!isProjectOpen && projectRoot) {
                try {
                    // 优先使用命令行工具
                    if (ideaScript) {
                        // 先打开项目
                        (0, child_process_1.execSync)(`"${ideaScript}" "${projectRoot}"`);
                        // 然后通过URL协议打开特定文件
                        const encodedPath = encodeURIComponent(absolutePath);
                        const url = `idea://open?file=${encodedPath}&line=${lineNumber}`;
                        (0, child_process_1.execSync)(`open "${url}"`);
                        vscode.window.showInformationMessage(`已请求IntelliJ IDEA打开项目并跳转到文件: ${absolutePath}:${lineNumber}`);
                        return;
                    }
                    else {
                        // 使用open命令打开项目
                        (0, child_process_1.execSync)(`open -a "${ideaAppPath}" "${projectRoot}"`);
                        // 然后发送AppleScript命令打开文件并跳转到行
                        const appleScriptCommand = `
              tell application "${ideaAppPath}"
                activate
                delay 0.5
                tell application "System Events"
                  tell process "idea"
                    # 使用⌘O打开文件
                    keystroke "o" using {command down}
                    # 输入文件路径
                    keystroke "${absolutePath}"
                    keystroke return
                    # 跳转到指定行
                    keystroke "l" using {command down, option down}
                    keystroke "${lineNumber}"
                    keystroke return
                  end tell
                end tell
              end tell
            `;
                        (0, child_process_1.execSync)(`osascript -e '${appleScriptCommand.replace(/'/g, "'\\''")}' &`);
                        vscode.window.showInformationMessage(`已请求IntelliJ IDEA打开项目并跳转到文件: ${absolutePath}:${lineNumber}`);
                        return;
                    }
                }
                catch (error) {
                    console.error("打开项目失败，尝试其他方法:", error);
                }
            }
            // 如果项目已在IDEA中打开或者上面的方法失败，尝试直接操作文件
            if (ideaScript) {
                // 使用命令行脚本打开文件
                const args = ['--line', lineNumber.toString(), absolutePath];
                // 使用spawn而不是execSync，这样不会阻塞扩展
                const process = (0, child_process_1.spawn)(ideaScript, args, {
                    detached: true,
                    stdio: 'ignore'
                });
                process.unref(); // 让进程在后台运行
                vscode.window.showInformationMessage(`已请求IntelliJ IDEA打开文件: ${absolutePath}:${lineNumber}`);
                return;
            }
            // 尝试使用URL协议
            try {
                const encodedPath = encodeURIComponent(absolutePath);
                let url = `idea://open?file=${encodedPath}&line=${lineNumber}`;
                if (projectRoot) {
                    // 添加项目参数
                    const encodedProject = encodeURIComponent(projectRoot);
                    url = `idea://open?file=${encodedPath}&line=${lineNumber}&project=${encodedProject}`;
                }
                (0, child_process_1.execSync)(`open "${url}"`);
                vscode.window.showInformationMessage(`已通过URL协议请求IntelliJ IDEA打开文件: ${absolutePath}:${lineNumber}`);
                return;
            }
            catch (error) {
                console.error("URL协议打开失败，尝试其他方法");
            }
            // 最后的回退方法：使用open命令
            try {
                const cmd = `open -a "${ideaAppPath}" "${absolutePath}"`;
                (0, child_process_1.execSync)(cmd);
                // 对于已经打开的项目，直接发送跳转命令，不设置延迟
                try {
                    const appleScriptCommand = `
            tell application "${ideaAppPath}"
              activate
              tell application "System Events"
                keystroke "l" using {command down, option down}
                keystroke "${lineNumber}"
                keystroke return
              end tell
            end tell
          `;
                    (0, child_process_1.execSync)(`osascript -e '${appleScriptCommand.replace(/'/g, "'\\''")}' &`);
                }
                catch (error) {
                    console.error("AppleScript跳转失败:", error);
                }
                vscode.window.showInformationMessage(`已请求IntelliJ IDEA打开文件: ${absolutePath}:${lineNumber}`);
            }
            catch (error) {
                vscode.window.showErrorMessage(`启动IntelliJ IDEA时出错: ${error}`);
            }
        }
        else if (platform === 'win32') { // Windows
            // 如果项目未在IntelliJ IDEA中打开，先打开项目
            if (!isProjectOpen && projectRoot) {
                // 查找IntelliJ IDEA可执行文件
                const possiblePaths = [
                    'C:\\Program Files\\JetBrains\\IntelliJ IDEA\\bin\\idea64.exe',
                    'C:\\Program Files\\JetBrains\\IntelliJ IDEA Community Edition\\bin\\idea64.exe',
                    'C:\\Program Files (x86)\\JetBrains\\IntelliJ IDEA\\bin\\idea64.exe',
                    'C:\\Program Files (x86)\\JetBrains\\IntelliJ IDEA Community Edition\\bin\\idea64.exe'
                ];
                let ideaPath = '';
                for (const p of possiblePaths) {
                    if (fs.existsSync(p)) {
                        ideaPath = p;
                        break;
                    }
                }
                if (!ideaPath) {
                    // 尝试通过注册表查找IntelliJ IDEA的安装路径
                    try {
                        const regQueryCmd = `powershell -command "Get-ItemProperty -Path 'HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\idea64.exe' -Name '(Default)' | Select-Object -ExpandProperty '(Default)'"`;
                        ideaPath = (0, child_process_1.execSync)(regQueryCmd).toString().trim();
                    }
                    catch (error) {
                        // 注册表查询失败，使用默认路径
                        ideaPath = 'idea64.exe';
                    }
                }
                try {
                    // 先启动IntelliJ IDEA并打开项目
                    const processProject = (0, child_process_1.spawn)(ideaPath, [projectRoot], {
                        detached: true,
                        stdio: 'ignore'
                    });
                    processProject.unref();
                    // 然后通过URL协议打开特定文件
                    try {
                        const encodedPath = encodeURIComponent(absolutePath);
                        const encodedProject = encodeURIComponent(projectRoot);
                        const url = `idea://open?file=${encodedPath}&line=${lineNumber}&project=${encodedProject}`;
                        (0, child_process_1.execSync)(`start "" "${url}"`);
                    }
                    catch (error) {
                        console.error("打开文件失败:", error);
                        // 回退方法：尝试直接打开文件
                        const processFile = (0, child_process_1.spawn)(ideaPath, ['--line', lineNumber.toString(), absolutePath], {
                            detached: true,
                            stdio: 'ignore'
                        });
                        processFile.unref();
                    }
                    vscode.window.showInformationMessage(`已请求IntelliJ IDEA打开项目并跳转到文件: ${absolutePath}:${lineNumber}`);
                    return;
                }
                catch (error) {
                    console.error("打开项目失败，尝试其他方法:", error);
                }
            }
            // 如果项目已在IDEA中打开或者上面的方法失败，尝试直接操作文件
            // 首先尝试使用URL协议打开
            try {
                const encodedPath = encodeURIComponent(absolutePath);
                let url = `idea://open?file=${encodedPath}&line=${lineNumber}`;
                if (projectRoot) {
                    // 添加项目参数
                    const encodedProject = encodeURIComponent(projectRoot);
                    url = `idea://open?file=${encodedPath}&line=${lineNumber}&project=${encodedProject}`;
                }
                (0, child_process_1.execSync)(`start "" "${url}"`);
                vscode.window.showInformationMessage(`已请求IntelliJ IDEA打开文件: ${absolutePath}:${lineNumber}`);
                return;
            }
            catch (error) {
                console.error("URL协议打开文件失败:", error);
            }
            // 如果URL协议方式都失败，回退到命令行方式
            const possiblePaths = [
                'C:\\Program Files\\JetBrains\\IntelliJ IDEA\\bin\\idea64.exe',
                'C:\\Program Files\\JetBrains\\IntelliJ IDEA Community Edition\\bin\\idea64.exe',
                'C:\\Program Files (x86)\\JetBrains\\IntelliJ IDEA\\bin\\idea64.exe',
                'C:\\Program Files (x86)\\JetBrains\\IntelliJ IDEA Community Edition\\bin\\idea64.exe'
            ];
            let ideaPath = '';
            for (const p of possiblePaths) {
                if (fs.existsSync(p)) {
                    ideaPath = p;
                    break;
                }
            }
            if (!ideaPath) {
                // 尝试通过注册表查找IntelliJ IDEA的安装路径
                try {
                    const regQueryCmd = `powershell -command "Get-ItemProperty -Path 'HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\idea64.exe' -Name '(Default)' | Select-Object -ExpandProperty '(Default)'"`;
                    ideaPath = (0, child_process_1.execSync)(regQueryCmd).toString().trim();
                }
                catch (error) {
                    // 注册表查询失败，使用默认路径
                    ideaPath = 'idea64.exe';
                }
            }
            // 构建命令行参数
            const args = ['--line', lineNumber.toString(), absolutePath];
            // 启动IntelliJ IDEA并传递参数
            (0, child_process_1.spawn)(ideaPath, args, {
                detached: true,
                stdio: 'ignore'
            }).unref();
            vscode.window.showInformationMessage(`已请求IntelliJ IDEA打开文件: ${absolutePath}:${lineNumber}`);
        }
        else { // Linux
            // 如果项目未在IntelliJ IDEA中打开，先打开项目
            if (!isProjectOpen && projectRoot) {
                // 查找IntelliJ IDEA可执行文件
                const possiblePaths = [
                    '/opt/idea/bin/idea.sh',
                    '/usr/local/bin/idea',
                    '/usr/bin/idea',
                    '/snap/intellij-idea-community/current/bin/idea.sh',
                    '/snap/intellij-idea-ultimate/current/bin/idea.sh'
                ];
                let ideaPath = '';
                for (const p of possiblePaths) {
                    if (fs.existsSync(p)) {
                        ideaPath = p;
                        break;
                    }
                }
                if (!ideaPath) {
                    // 尝试在用户主目录查找
                    const homeDir = os.homedir();
                    const userPaths = [
                        `${homeDir}/.local/share/JetBrains/Toolbox/apps/IDEA-U/ch-0/*/bin/idea.sh`,
                        `${homeDir}/.local/share/JetBrains/Toolbox/apps/IDEA-C/ch-0/*/bin/idea.sh`
                    ];
                    for (const globPattern of userPaths) {
                        try {
                            // 使用find命令查找匹配的文件
                            const foundPath = (0, child_process_1.execSync)(`find ${globPattern.replace(/\*/g, '\\*')} -type f 2>/dev/null | head -1`).toString().trim();
                            if (foundPath && fs.existsSync(foundPath)) {
                                ideaPath = foundPath;
                                break;
                            }
                        }
                        catch (error) {
                            // 忽略错误，继续尝试其他路径
                        }
                    }
                    // 如果仍然找不到，使用通用命令
                    if (!ideaPath) {
                        ideaPath = 'intellij-idea';
                    }
                }
                try {
                    // 先启动IntelliJ IDEA并打开项目
                    const processProject = (0, child_process_1.spawn)(ideaPath, [projectRoot], {
                        detached: true,
                        stdio: 'ignore'
                    });
                    processProject.unref();
                    // 然后通过URL协议打开特定文件
                    try {
                        const encodedPath = encodeURIComponent(absolutePath);
                        const encodedProject = encodeURIComponent(projectRoot);
                        const url = `idea://open?file=${encodedPath}&line=${lineNumber}&project=${encodedProject}`;
                        (0, child_process_1.execSync)(`xdg-open "${url}"`);
                    }
                    catch (error) {
                        console.error("打开文件失败:", error);
                        // 回退方法：尝试直接打开文件
                        const processFile = (0, child_process_1.spawn)(ideaPath, ['--line', lineNumber.toString(), absolutePath], {
                            detached: true,
                            stdio: 'ignore'
                        });
                        processFile.unref();
                    }
                    vscode.window.showInformationMessage(`已请求IntelliJ IDEA打开项目并跳转到文件: ${absolutePath}:${lineNumber}`);
                    return;
                }
                catch (error) {
                    console.error("打开项目失败，尝试其他方法:", error);
                }
            }
            // 如果项目已在IDEA中打开或者上面的方法失败，尝试直接操作文件
            // 首先尝试URL协议方式
            try {
                const encodedPath = encodeURIComponent(absolutePath);
                let url = `idea://open?file=${encodedPath}&line=${lineNumber}`;
                if (projectRoot) {
                    // 添加项目参数
                    const encodedProject = encodeURIComponent(projectRoot);
                    url = `idea://open?file=${encodedPath}&line=${lineNumber}&project=${encodedProject}`;
                }
                (0, child_process_1.execSync)(`xdg-open "${url}"`);
                vscode.window.showInformationMessage(`已请求IntelliJ IDEA打开文件: ${absolutePath}:${lineNumber}`);
                return;
            }
            catch (error) {
                console.error("URL协议打开文件失败:", error);
            }
            // 如果URL协议失败，回退到命令行方式
            const possiblePaths = [
                '/opt/idea/bin/idea.sh',
                '/usr/local/bin/idea',
                '/usr/bin/idea',
                '/snap/intellij-idea-community/current/bin/idea.sh',
                '/snap/intellij-idea-ultimate/current/bin/idea.sh'
            ];
            let ideaPath = '';
            for (const p of possiblePaths) {
                if (fs.existsSync(p)) {
                    ideaPath = p;
                    break;
                }
            }
            if (!ideaPath) {
                // 尝试在用户主目录查找
                const homeDir = os.homedir();
                const userPaths = [
                    `${homeDir}/.local/share/JetBrains/Toolbox/apps/IDEA-U/ch-0/*/bin/idea.sh`,
                    `${homeDir}/.local/share/JetBrains/Toolbox/apps/IDEA-C/ch-0/*/bin/idea.sh`
                ];
                for (const globPattern of userPaths) {
                    try {
                        // 使用find命令查找匹配的文件
                        const foundPath = (0, child_process_1.execSync)(`find ${globPattern.replace(/\*/g, '\\*')} -type f 2>/dev/null | head -1`).toString().trim();
                        if (foundPath && fs.existsSync(foundPath)) {
                            ideaPath = foundPath;
                            break;
                        }
                    }
                    catch (error) {
                        // 忽略错误，继续尝试其他路径
                    }
                }
                // 如果仍然找不到，使用通用命令
                if (!ideaPath) {
                    ideaPath = 'intellij-idea';
                }
            }
            // 构建命令行参数
            const args = ['--line', lineNumber.toString(), absolutePath];
            // 启动IntelliJ IDEA并传递参数
            (0, child_process_1.spawn)(ideaPath, args, {
                detached: true,
                stdio: 'ignore'
            }).unref();
            vscode.window.showInformationMessage(`已请求IntelliJ IDEA打开文件: ${absolutePath}:${lineNumber}`);
        }
    }
    catch (error) {
        vscode.window.showErrorMessage(`启动IntelliJ IDEA时出错: ${error}`);
    }
}
/**
 * 获取当前活动编辑器中的文件路径和行号
 * @returns 文件路径和行号，如果没有活动编辑器则返回null
 */
function getCurrentFileInfo() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('没有打开的文件');
        return null;
    }
    const document = editor.document;
    const selection = editor.selection;
    // 获取当前文件路径
    const filePath = document.uri.fsPath;
    // 获取当前行号 (VSCode行号从0开始，IntelliJ从1开始)
    const lineNumber = selection.active.line + 1;
    return { filePath, lineNumber };
}
/**
 * 当扩展被激活时调用
 */
function activate(context) {
    console.log('扩展 "cursor-intellij-bridge" 已被激活');
    // 注册命令处理函数
    const disposable = vscode.commands.registerCommand('cursorIntellijBridge.jumpToIntelliJ', () => {
        // 获取当前文件和行号
        const fileInfo = getCurrentFileInfo();
        if (fileInfo) {
            const { filePath, lineNumber } = fileInfo;
            // 执行跳转
            jumpToIntelliJ(filePath, lineNumber);
        }
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
/**
 * 当扩展被停用时调用
 */
function deactivate() {
    console.log('扩展 "cursor-intellij-bridge" 已被停用');
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map