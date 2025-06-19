# 🎯 Moondream MCP 使用示例

## 📁 项目路径
```
相对路径: moondream-mcp-windows-augment/moondream-mcp/
绝对路径: d:\ComfyUI_windows_portable\moondream-mcp-windows-augment\moondream-mcp\
```

## 🚀 启动服务器

### 从项目根目录启动
```bash
# 在 moondream-mcp-windows-augment 目录中运行
start-moondream-server.bat
```

### 直接启动服务器
```bash
# 在 moondream-mcp 目录中运行
node build\final-index.js
```

## 🎯 Augment Agent使用示例

### 基础测试
```
"测试Moondream服务器连接"
```

### 单图片分析
```
"使用Moondream分析图片 d:/ComfyUI_windows_portable/ComfyUI/input/example.png"
```

### 批量质量评估
```
"使用Moondream批量分析ComfyUI输出目录，进行质量评估，最多分析20张图片"
```

### 角色一致性检查
```
"使用Moondream检查ComfyUI输出目录中角色的一致性，分析类型设为character_consistency"
```

### ComfyUI专用分析
```
"使用analyze_comfyui_batch工具分析 d:/ComfyUI_windows_portable/ComfyUI/output 目录，类型设为quality，最多15张图片"
```

### 自定义分析
```
"使用Moondream分析 d:/ComfyUI_windows_portable/ComfyUI/output 目录中的图片，重点关注3D角色的设计质量和视觉吸引力"
```

## 🔧 工具调用示例

### 1. test工具
```json
{
  "name": "test",
  "arguments": {
    "message": "测试新的文件夹结构"
  }
}
```

### 2. analyze_image工具
```json
{
  "name": "analyze_image",
  "arguments": {
    "image_path": "d:/ComfyUI_windows_portable/ComfyUI/output/character_001.png",
    "prompt": "评估这个3D角色的质量，包括建模、纹理和整体视觉效果"
  }
}
```

### 3. batch_analyze_images工具
```json
{
  "name": "batch_analyze_images",
  "arguments": {
    "directory_path": "d:/ComfyUI_windows_portable/ComfyUI/output",
    "prompt": "分析每张图片的艺术风格和技术质量",
    "max_images": 10
  }
}
```

### 4. analyze_comfyui_batch工具
```json
{
  "name": "analyze_comfyui_batch",
  "arguments": {
    "output_directory": "d:/ComfyUI_windows_portable/ComfyUI/output",
    "analysis_type": "quality",
    "max_images": 25
  }
}
```

## 📊 分析类型说明

### quality - 质量评估
- 技术质量评分(1-10)
- 清晰度和细节分析
- 视觉吸引力评估
- 生成质量报告

### content - 内容分析
- 详细内容描述
- 对象和场景识别
- 艺术风格分析
- 构图评估

### character_consistency - 角色一致性
- 角色特征一致性检查
- 比例和风格统一性
- 设计连贯性分析
- 不一致问题识别

## 🎨 ComfyUI工作流集成

### 3D角色生成质量检查
```
"分析最新生成的3D角色图片，评估建模质量、纹理细节和整体视觉效果，给出改进建议"
```

### 批量输出验证
```
"检查ComfyUI输出目录中的所有图片，确保质量达标，标记需要重新生成的图片"
```

### 风格一致性验证
```
"验证批量生成的角色图片是否保持一致的艺术风格和质量标准"
```

## 🔍 故障排除

### 路径问题
确保使用正确的绝对路径：
```
d:/ComfyUI_windows_portable/ComfyUI/output/image.png
```

### 服务器连接问题
检查服务器是否正在运行：
```bash
# 测试服务器状态
node build\final-index.js
```

### 权限问题
确保有读取图片文件的权限，使用管理员权限运行如果需要。

## 📈 性能优化建议

1. **批量处理**: 设置合适的max_images数量(建议10-20)
2. **内存管理**: 大批量处理时分批进行
3. **路径优化**: 使用SSD存储提高读取速度
4. **定期重启**: 长时间使用后重启服务器释放内存

---

🎉 **现在您可以在新的文件夹结构中高效使用Moondream MCP服务器了！**
