# 🔗 Augment Agent集成指南

## 📁 项目路径结构

```
moondream-mcp-windows-augment/
├── 🚀 start-moondream-server.bat          # 主启动脚本
├── 🔧 setup-augment-integration.bat       # Augment集成设置
└── moondream-mcp/                         # MCP服务器核心
    ├── build/final-index.js               # MCP服务器 (相对路径)
    ├── configs/                           # 配置文件
    │   ├── augment-settings.json          # settings.json配置
    │   ├── augment-panel-config.txt       # 设置面板配置
    │   └── INTEGRATION-GUIDE.md           # 本文件
    └── [其他文件夹...]
```

## 🚀 快速集成步骤

### 1. 启动服务器测试
```bash
# 在项目根目录运行
start-moondream-server.bat
```

### 2. 运行集成设置
```bash
# 在项目根目录运行
setup-augment-integration.bat
```

### 3. 配置Augment Agent

#### 方法A: 使用设置面板 (推荐)
1. 打开Augment Agent
2. 点击右上角齿轮图标⚙️
3. 找到MCP部分，点击`+`添加服务器
4. 填入以下信息：
   ```
   Name: moondream-vision
   Command: node
   Args: [您的完整路径]\moondream-mcp-windows-augment\moondream-mcp\build\final-index.js
   ```

#### 方法B: 编辑settings.json
1. 在Augment Agent中按`Ctrl+Shift+P`
2. 选择"Edit Settings" → "Advanced" → "Edit in settings.json"
3. 复制 `configs/augment-settings.json` 的内容
4. 粘贴到您的settings.json中

### 4. 重启编辑器并测试
重启VS Code或您的编辑器，然后在Augment Agent中输入：
```
测试Moondream服务器连接
```

## 🎯 使用示例

### 基础功能测试
```
"测试Moondream服务器连接"
```

### 单图片分析
```
"使用Moondream分析图片 d:/path/to/image.jpg"
```

### 批量质量评估
```
"使用Moondream批量分析ComfyUI输出目录，进行质量评估，最多分析20张图片"
```

### ComfyUI专用分析
```
"使用Moondream检查ComfyUI输出目录中角色的一致性，分析类型设为character_consistency"
```

## 🔧 配置文件说明

### augment-settings.json
完整的settings.json配置，包含MCP服务器设置。

### augment-panel-config.txt
设置面板的配置信息，包含详细的填写说明。

## 🔍 故障排除

### 问题1: 服务器路径错误
确保使用正确的绝对路径：
```
[您的路径]\moondream-mcp-windows-augment\moondream-mcp\build\final-index.js
```

### 问题2: Node.js未找到
确保Node.js已安装并在PATH中：
```bash
node --version
```

### 问题3: 服务器未构建
运行构建命令：
```bash
cd moondream-mcp
npx tsc src/final-index.ts --outDir build
```

## 📊 可用工具

集成成功后，以下工具将在Augment Agent中可用：

1. **test** - 测试服务器连接
2. **analyze_image** - 单图片分析
3. **batch_analyze_images** - 批量图片分析
4. **analyze_comfyui_batch** - ComfyUI专用批量分析

## 🎉 集成完成

集成成功后，您可以在Augment Agent中直接使用自然语言调用Moondream的图片分析功能！
