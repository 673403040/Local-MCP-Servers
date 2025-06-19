# Moondream MCP Preinstalled Package

## 🚀 入门指南 (Quick Start)

这是一个完整的、预装的Moondream MCP包，包含所有依赖和AI模型。

### 系统要求
- Windows 10/11
- Node.js v18+ (需要单独安装)

### 三步快速开始
1. **启动服务器**: 运行 `start-with-preinstalled.bat`
2. **配置Augment Agent**: 使用下面的服务器路径
3. **测试连接**: 在Augment中输入 `"测试Moondream服务器连接"`

### Augment Agent服务器路径
```
[您的包路径]\moondream-mcp\build\final-index.js
```

### 基础配置方法
1. 打开Augment Agent
2. 点击右上角齿轮图标 ⚙️
3. 进入MCP部分
4. 点击 + 添加新服务器
5. 填入：
   - **名称**: `moondream-preinstalled`
   - **命令**: `node`
   - **参数**: `[您的路径]\moondream-mcp\build\final-index.js`

### 基础使用示例
```
# 测试连接
"测试Moondream服务器连接"

# 分析单张图片
"使用Moondream分析图片 d:/path/to/image.jpg"

# 批量质量评估
"批量分析ComfyUI输出目录中的图片质量"
```

## 📦 包特性概览

### 预装组件
- ✅ **Python依赖**: 所有必需包已全局预装
- ✅ **Moondream模型**: 3.72GB AI模型已预下载缓存
- ✅ **Node.js依赖**: 所有npm包已包含
- ✅ **MCP服务器**: 已编译，开箱即用

### 核心能力
- **单图分析**: 详细的图片内容分析
- **批量处理**: 高效处理多张图片
- **ComfyUI集成**: 专为ComfyUI工作流优化
- **质量评估**: 1-10分评分系统
- **角色一致性**: 批量角色一致性检查

### 性能特点
- **即时启动**: 无需下载，立即可用
- **离线运行**: 完全无需网络连接
- **快速处理**: 本地模型提供快速响应
- **内存优化**: 使用CPU兼容的float32精度

---

## 🔧 进阶指南 (Advanced Guide)

### 可用脚本
- `start-with-preinstalled.bat` - 主启动脚本
- `verify-preinstalled.bat` - 包完整性验证
- `install-dependencies.bat` - 依赖安装记录（已完成）

### 高级Augment Agent配置

#### 方法1: settings.json配置
```json
{
  "augment.advanced": {
    "mcpServers": [
      {
        "name": "moondream-preinstalled",
        "command": "node",
        "args": [
          "[您的路径]\\moondream-mcp\\build\\final-index.js"
        ],
        "env": {
          "MOONDREAM_USE_LOCAL": "true",
          "NODE_ENV": "production"
        }
      }
    ]
  }
}
```

#### 方法2: 环境变量配置
```bash
# 设置本地模型优先
set MOONDREAM_USE_LOCAL=true
set MOONDREAM_CACHE_DIR=./models
```

### 详细使用示例

#### 基础功能测试
```
# 服务器连接测试
"测试Moondream服务器连接"

# 健康检查
"检查Moondream服务器状态"
```

#### 单图片分析
```
# 基础分析
"使用Moondream分析图片 d:/ComfyUI_windows_portable/ComfyUI/input/example.png"

# 质量评估
"分析图片质量并给出1-10分评分: d:/path/to/image.jpg"

# 内容描述
"详细描述这张图片的内容: d:/path/to/image.jpg"
```

#### 批量处理
```
# 批量质量评估
"使用Moondream批量分析ComfyUI输出目录，进行质量评估，最多分析20张图片"

# 批量内容分析
"批量分析目录中的图片内容，生成详细报告"

# 角色一致性检查
"检查批量生成的角色图片是否保持一致的风格和质量"
```

#### ComfyUI专用分析
```
# 使用专用工具
"使用analyze_comfyui_batch工具分析ComfyUI输出目录，类型设为quality，最多15张图片"

# 工作流优化建议
"分析ComfyUI生成的图片并提供工作流优化建议"

# 参数调优建议
"基于图片质量分析，建议ComfyUI参数调整方案"
```

### 技术架构详解

#### 本地模型支持
服务器代码已优化为优先使用本地预下载模型：
```python
# 检查本地预下载模型
if os.path.exists(local_model_path) and os.path.exists(local_model_path + "/config.json"):
    print("Using pre-downloaded local model...")
    model = AutoModelForCausalLM.from_pretrained(
        local_model_path,
        trust_remote_code=True,
        torch_dtype=torch.float32,
        device_map="cpu",
        local_files_only=True  # 强制使用本地文件
    )
```

#### 预装依赖详情
所有Python依赖已安装到系统环境：
- **PyTorch**: 2.7.0+cu128 (CPU版本)
- **Transformers**: 4.50.0
- **Pillow**: 10.4.0
- **Flask**: 3.1.1
- **其他**: requests, flask-cors, numpy, accelerate

#### 模型信息
- **模型ID**: vikhyatk/moondream2
- **版本**: 2024-04-02
- **大小**: 3.72GB
- **格式**: SafeTensors (分片存储)
- **精度**: float32 (CPU优化)

## 📊 包信息与性能

### 包大小详情
- **总大小**: ~4.3GB
- **模型大小**: 3.72GB (vikhyatk/moondream2)
- **Node.js依赖**: ~500MB
- **源代码和配置**: ~50MB
- **依赖状态**: 预装到系统环境

### 性能指标
- **首次启动**: ~30秒 (加载本地模型)
- **后续启动**: ~15秒 (模型已缓存)
- **网络需求**: 无 (完全离线)
- **内存需求**: 8GB+ RAM (推荐)
- **存储需求**: 5GB+ 可用空间

### 系统要求
- **操作系统**: Windows 10/11
- **Node.js**: v18+ (必须预装)
- **Python**: 3.8+ (系统环境，已安装依赖)
- **内存**: 8GB+ RAM (推荐)
- **存储**: 5GB+ 可用空间

## 🔍 故障排除

### 服务器启动问题
1. **Node.js检查**: 确保Node.js v18+已安装
   ```bash
   node --version  # 应显示v18+
   ```
2. **Python依赖检查**: 验证Python包可用性
   ```bash
   python -c "import torch; print('PyTorch:', torch.__version__)"
   python -c "import transformers; print('Transformers:', transformers.__version__)"
   ```
3. **包完整性检查**: 运行验证脚本
   ```bash
   verify-preinstalled.bat
   ```

### Augment集成问题
1. **路径验证**: 确保服务器路径正确
   ```
   [您的实际路径]\moondream-mcp\build\final-index.js
   ```
2. **编辑器重启**: 配置后重启编辑器
3. **语法检查**: 检查settings.json语法正确性
4. **权限检查**: 确保文件访问权限正常

### 模型加载问题
1. **模型文件检查**: 验证模型文件存在
   ```bash
   # 检查模型目录
   dir moondream-mcp\models\moondream2
   # 应看到 complete.txt 和模型文件
   ```
2. **内存检查**: 确保足够RAM (8GB+推荐)
3. **磁盘空间**: 确保足够存储空间
4. **模型完整性**: 检查complete.txt文件存在

### 性能优化建议
1. **内存优化**: 关闭不必要的应用程序
2. **CPU优化**: 确保CPU不被其他进程占用
3. **存储优化**: 使用SSD可提升加载速度
4. **网络隔离**: 完全离线运行，无需网络

## 🎯 高级应用场景

### ComfyUI工作流集成
```
# 工作流质量评估
"分析ComfyUI工作流生成的图片序列，评估整体质量一致性"

# 参数优化建议
"基于生成图片质量，建议ComfyUI采样器和CFG参数调整"

# 风格一致性检查
"检查ComfyUI批量生成的角色图片风格是否保持一致"
```

### 批量内容分析
```
# 大规模质量筛选
"批量分析1000张图片，筛选出质量评分8分以上的图片"

# 内容分类整理
"分析图片内容并按主题自动分类整理"

# 重复内容检测
"检测批量图片中的重复或相似内容"
```

### 专业应用
```
# 艺术作品分析
"从艺术角度分析图片的构图、色彩和风格特点"

# 技术质量评估
"从技术角度评估图片的清晰度、噪点和细节表现"

# 商业用途评估
"评估图片是否适合商业用途，分析潜在版权问题"
```

## 🎉 开始使用

这个包是完全自包含的，开箱即用。无需额外下载或设置！

### 立即开始
1. 运行 `manager.bat` 选择选项1启动服务器
2. 选择选项2生成配置文件
3. 复制配置到Augment Agent settings.json
4. 开始享受AI驱动的图片分析！

**🚀 现在您拥有了一个完整的、即时可用的AI图片分析解决方案！**
