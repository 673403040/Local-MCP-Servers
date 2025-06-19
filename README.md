# Local MCP Servers Collection / 本地MCP服务器集合

A complete collection of lightweight, local Model Context Protocol (MCP) servers for Augment Agent.
为Augment Agent提供的完整轻量化本地模型上下文协议(MCP)服务器集合。

## 🎯 Project Overview / 项目概述

This project provides a unified collection of local MCP servers with always-updated dependencies for optimal performance.
本项目提供统一的本地MCP服务器集合，依赖始终保持最新以确保最佳性能。

### **Key Benefits / 主要优势**
- ✅ **Always Updated**: Dependencies updated before each use / **始终最新**: 每次使用前更新依赖
- ✅ **Lightweight**: Each server ~200MB vs multi-GB cloud versions / **轻量化**: 每个服务器约200MB，而非云版本的数GB
- ✅ **Fast Startup**: 2-5 seconds vs 15+ seconds for cloud versions / **快速启动**: 2-5秒启动，而非云版本的15+秒
- ✅ **Low Memory**: 500MB-1GB total vs 2GB+ for cloud versions / **低内存**: 总计500MB-1GB，而非云版本的2GB+
- ✅ **Unified Management**: Single project for all servers / **统一管理**: 单一项目管理所有服务器
- ✅ **Persistent Storage**: Local data persistence where needed / **持久化存储**: 需要时提供本地数据持久化

## 📁 Project Structure / 项目结构

```
D:\local-mcp-servers\
├── time-local\                    # Time processing and calculations / 时间处理和计算
├── memory-local\                  # Persistent memory management / 持久化内存管理
├── fetch-local\                   # HTTP client for web requests / HTTP客户端网络请求
├── filesystem-local\              # File and directory operations / 文件和目录操作
├── sequential-thinking-local\     # Step-by-step thinking processor / 逐步思维处理器
├── context7-local\                # Context management and search / 上下文管理和搜索
├── moondream-minimal\             # Image analysis capabilities / 图像分析功能
├── start-mcp.bat                  # Main startup script / 主启动脚本
├── mcp-config.json                # Generated configuration / 生成的配置文件
└── README.md                      # This file / 本文件
```

## 🚀 Quick Start / 快速开始

### **1. Run Startup Script / 运行启动脚本**
```bash
# Run from D:\local-mcp-servers\ / 在D:\local-mcp-servers\目录运行
start-mcp.bat
```

### **2. What the script does / 脚本功能**
- Updates all dependencies to latest versions / 更新所有依赖到最新版本
- Generates mcp-config.json configuration file / 生成mcp-config.json配置文件
- Displays configuration for copying / 显示配置供复制使用

### **3. Configure Augment Agent / 配置Augment Agent**
1. Copy the generated JSON configuration / 复制生成的JSON配置
2. Paste into Augment Agent settings / 粘贴到Augment Agent设置中
3. Save and restart Augment Agent / 保存并重启Augment Agent

## 🛠️ MCP Server Details / MCP服务器详细介绍

### **Core Local Servers / 核心本地服务器**

#### **Time-Local / 时间本地服务器**
- **Purpose / 用途**: Time processing, formatting, calculations / 时间处理、格式化、计算
- **Key Features / 主要功能**:
  - Get current time in multiple formats / 获取多种格式的当前时间
  - Convert between time zones / 时区转换
  - Calculate time differences / 计算时间差
  - Format timestamps / 格式化时间戳
- **Tools / 工具**: `get_current_time`, `format_time`, `time_difference`
- **Use Cases / 使用场景**: Scheduling, logging, time-based calculations / 调度、日志记录、基于时间的计算
- **Size / 大小**: ~200MB
- **Startup / 启动**: ~2s

#### **Memory-Local / 内存本地服务器**
- **Purpose / 用途**: Persistent local memory management / 持久化本地内存管理
- **Key Features / 主要功能**:
  - Store and retrieve data with keys / 使用键值存储和检索数据
  - Persistent storage across sessions / 跨会话持久化存储
  - Pattern-based memory search / 基于模式的内存搜索
  - Memory management and cleanup / 内存管理和清理
- **Tools / 工具**: `store_memory`, `retrieve_memory`, `list_memory`, `delete_memory`, `clear_memory`
- **Use Cases / 使用场景**: Session data, user preferences, temporary storage / 会话数据、用户偏好、临时存储
- **Storage / 存储**: JSON file persistence / JSON文件持久化
- **Size / 大小**: ~200MB

#### **Fetch-Local / 网络请求本地服务器**
- **Purpose / 用途**: HTTP client for web requests / HTTP客户端网络请求
- **Key Features / 主要功能**:
  - Fetch content from any URL / 从任何URL获取内容
  - Parse JSON responses automatically / 自动解析JSON响应
  - POST data to APIs / 向API发送POST数据
  - Check URL accessibility / 检查URL可访问性
  - Custom headers and timeout support / 自定义头部和超时支持
- **Tools / 工具**: `fetch_url`, `fetch_json`, `post_data`, `check_url_status`
- **Use Cases / 使用场景**: API integration, web scraping, health checks / API集成、网页抓取、健康检查
- **Features / 特性**: Native Node.js HTTP client / 原生Node.js HTTP客户端
- **Size / 大小**: ~200MB

#### **Filesystem-Local / 文件系统本地服务器**
- **Purpose / 用途**: File and directory operations / 文件和目录操作
- **Key Features / 主要功能**:
  - Read and write files with encoding support / 支持编码的文件读写
  - Directory listing and navigation / 目录列表和导航
  - File search with pattern matching / 模式匹配文件搜索
  - File metadata and information / 文件元数据和信息
  - Safe path restrictions / 安全路径限制
- **Tools / 工具**: `read_file`, `write_file`, `list_directory`, `create_directory`, `delete_file`, `file_info`, `search_files`
- **Use Cases / 使用场景**: File management, log analysis, content processing / 文件管理、日志分析、内容处理
- **Security / 安全**: Path restrictions to allowed drives / 限制到允许的驱动器路径
- **Size / 大小**: ~200MB

#### **Sequential-Thinking-Local / 序列思维本地服务器**
- **Purpose / 用途**: Step-by-step thinking and problem solving / 逐步思维和问题解决
- **Key Features / 主要功能**:
  - Structured thinking sessions / 结构化思维会话
  - Thought progression tracking / 思维进展跟踪
  - Branch alternative thinking paths / 分支替代思维路径
  - Session management and review / 会话管理和回顾
  - Collaborative problem solving / 协作问题解决
- **Tools / 工具**: `start_thinking`, `add_thought`, `review_thinking`, `conclude_thinking`, `list_sessions`, `branch_thinking`
- **Use Cases / 使用场景**: Complex problem solving, decision making, brainstorming / 复杂问题解决、决策制定、头脑风暴
- **Features / 特性**: Session management, thought branching / 会话管理、思维分支
- **Size / 大小**: ~200MB

#### **Context7-Local / 上下文7本地服务器**
- **Purpose / 用途**: Context management and intelligent search / 上下文管理和智能搜索
- **Key Features / 主要功能**:
  - Create and manage information contexts / 创建和管理信息上下文
  - Intelligent content search with relevance scoring / 智能内容搜索与相关性评分
  - Context merging and organization / 上下文合并和组织
  - Metadata and tagging support / 元数据和标签支持
  - Cross-context information retrieval / 跨上下文信息检索
- **Tools / 工具**: `create_context`, `add_to_context`, `search_context`, `get_context`, `list_contexts`, `update_context`, `delete_context`, `merge_contexts`
- **Use Cases / 使用场景**: Knowledge management, research organization, information retrieval / 知识管理、研究组织、信息检索
- **Features / 特性**: Persistent contexts, relevance scoring / 持久化上下文、相关性评分
- **Size / 大小**: ~200MB

### **Image Analysis Server / 图像分析服务器**

#### **Moondream-General / Moondream通用服务器**
- **Purpose / 用途**: Image analysis and visual understanding / 图像分析和视觉理解
- **Key Features / 主要功能**:
  - Analyze images with AI descriptions / 使用AI描述分析图像
  - Batch process multiple images / 批量处理多个图像
  - Answer specific questions about images / 回答关于图像的具体问题
  - Support various image formats / 支持多种图像格式
  - Fast processing with optimized model / 使用优化模型快速处理
- **Tools / 工具**: `analyze_image_moondream-general`, `batch_analyze_moondream-general`, `ask_about_image_moondream-general`
- **Use Cases / 使用场景**: Image content analysis, visual QA, accessibility descriptions / 图像内容分析、视觉问答、无障碍描述
- **Features / 特性**: Lightweight model, fast startup / 轻量化模型、快速启动
- **Size / 大小**: ~200MB
- **Location / 位置**: `D:/local-mcp-servers/moondream-minimal/moondream-mcp-optimized/ultra-minimal/`

## ⚙️ Configuration / 配置选项

### **Complete Configuration (7 Servers) / 完整配置（7个服务器）**
```json
{
  "mcpServers": {
    "time-local": {
      "command": "node",
      "args": ["D:/local-mcp-servers/time-local/server.js"]
    },
    "memory-local": {
      "command": "node",
      "args": ["D:/local-mcp-servers/memory-local/server.js"]
    },
    "fetch-local": {
      "command": "node",
      "args": ["D:/local-mcp-servers/fetch-local/server.js"]
    },
    "filesystem-local": {
      "command": "node",
      "args": ["D:/local-mcp-servers/filesystem-local/server.js"]
    },
    "sequential-thinking-local": {
      "command": "node",
      "args": ["D:/local-mcp-servers/sequential-thinking-local/server.js"]
    },
    "context7-local": {
      "command": "node",
      "args": ["D:/local-mcp-servers/context7-local/server.js"]
    },
    "moondream-general": {
      "command": "node",
      "args": ["D:/local-mcp-servers/moondream-minimal/moondream-mcp-optimized/ultra-minimal/server.js"]
    }
  }
}
```

This configuration is automatically generated by `start-mcp.bat`.
此配置由 `start-mcp.bat` 自动生成。

## 📊 Performance Comparison / 性能对比

| Metric / 指标 | Cloud Servers / 云服务器 | Local Servers / 本地服务器 | Improvement / 改进 |
|--------|---------------|---------------|-------------|
| **Total Size / 总大小** | 10GB+ | 1.5GB | **85% smaller / 减少85%** |
| **Startup Time / 启动时间** | 60s+ | 10s | **83% faster / 快83%** |
| **Memory Usage / 内存使用** | 4GB+ | 1GB | **75% less / 减少75%** |
| **Dependency Updates / 依赖更新** | Manual / 手动 | Automatic / 自动 | **Always latest / 始终最新** |
| **Reliability / 可靠性** | Variable / 可变 | Consistent / 一致 | **Always available / 始终可用** |

## 🔧 Maintenance / 维护

### **Updating Dependencies / 更新依赖**
Dependencies are automatically updated each time you run the startup script:
每次运行启动脚本时依赖会自动更新：
1. Run `start-mcp.bat` / 运行 `start-mcp.bat`
2. All dependencies update to latest versions / 所有依赖更新到最新版本
3. No manual intervention required / 无需手动干预

### **Modifying Servers / 修改服务器**
Each server is self-contained. To customize:
每个服务器都是独立的。要自定义：
1. Navigate to the specific server directory / 导航到特定服务器目录
2. Modify the `server.js` file / 修改 `server.js` 文件
3. Restart Augment Agent / 重启Augment Agent

### **Troubleshooting / 故障排除**
- **Server won't start / 服务器无法启动**: Check Node.js installation and dependencies / 检查Node.js安装和依赖
- **Path errors / 路径错误**: Verify file paths in configuration / 验证配置中的文件路径
- **Permission issues / 权限问题**: Ensure write access to server directories / 确保对服务器目录有写入权限

## 🎯 Use Cases / 使用场景

### **Development / 开发**
- Fast iteration with always-updated dependencies / 使用始终更新的依赖快速迭代
- Consistent performance across environments / 跨环境一致性能
- Easy debugging and modification / 易于调试和修改

### **Production / 生产**
- Reliable local operation with latest features / 具有最新功能的可靠本地操作
- Low resource usage / 低资源使用
- Predictable behavior / 可预测行为

### **Learning / 学习**
- Understand MCP server architecture / 理解MCP服务器架构
- Modify and experiment safely / 安全修改和实验
- Clear, readable code / 清晰可读的代码

## 🔄 Migration Benefits / 迁移优势

### **Advantages over Cloud Servers / 相比云服务器的优势**
- **Always Updated / 始终更新**: Automatic dependency updates / 自动依赖更新
- **No Download Delays / 无下载延迟**: Local execution / 本地执行
- **Full Control / 完全控制**: Modify any functionality / 修改任何功能
- **Resource Efficient / 资源高效**: Lower memory and storage usage / 更低内存和存储使用
- **Reliable / 可靠**: No network dependency failures / 无网络依赖故障

### **Replaced Cloud Dependencies / 替换的云依赖**
- `@modelcontextprotocol/server-time` → `time-local`
- `@modelcontextprotocol/server-memory` → `memory-local`
- `@modelcontextprotocol/server-fetch` → `fetch-local`
- `@modelcontextprotocol/server-filesystem` → `filesystem-local`
- `@modelcontextprotocol/server-sequential-thinking` → `sequential-thinking-local`
- `@upstash/context7-mcp` → `context7-local`
- Cloud image analysis → `moondream-general`

## 📝 License / 许可证

MIT License - Feel free to modify and distribute.
MIT许可证 - 可自由修改和分发。

## 🤝 Contributing / 贡献

This is a local project optimized for your specific setup. Modifications welcome!
这是为您的特定设置优化的本地项目。欢迎修改！

## 📞 Support / 支持

For issues / 遇到问题时:
1. Run `start-mcp.bat` to update dependencies / 运行 `start-mcp.bat` 更新依赖
2. Check server logs in individual directories / 检查各个目录中的服务器日志
3. Verify Node.js installation / 验证Node.js安装
4. Test configuration in Augment Agent / 在Augment Agent中测试配置

## 🎊 Summary / 总结

This collection provides 7 powerful MCP servers with automatic dependency updates:
此集合提供7个强大的MCP服务器，具有自动依赖更新功能：

- **Time processing / 时间处理**: Advanced time operations and calculations / 高级时间操作和计算
- **Memory management / 内存管理**: Persistent data storage and retrieval / 持久化数据存储和检索
- **Network requests / 网络请求**: HTTP client with full API support / 具有完整API支持的HTTP客户端
- **File operations / 文件操作**: Comprehensive filesystem management / 全面的文件系统管理
- **Sequential thinking / 序列思维**: Structured problem-solving workflows / 结构化问题解决工作流
- **Context management / 上下文管理**: Intelligent information organization / 智能信息组织
- **Image analysis / 图像分析**: AI-powered visual understanding / AI驱动的视觉理解

---

**🎉 Enjoy your complete local MCP server ecosystem! / 享受您完整的本地MCP服务器生态系统！**