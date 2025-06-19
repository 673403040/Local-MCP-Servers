- **ONNX Format**: Better cross-platform compatibility and performance 
- **Minimal Dependencies**: Only essential packages included 
- **Streamlined Code**: Optimized for speed and efficiency 
 
### Performance Comparison 
| Metric | Original | Optimized | Improvement | 
|--------|---------|----------|------------| 
| Size | 4.3GB | 1.2GB | 72% reduction | 
| Model | 3.72GB | 900MB | 75% reduction | 
| Startup | 15s | 5s | 3x faster | 
| Inference | 2s | 1.5s | 25% faster | 
 
### Quick Start 
1. Run: `install-optimized.bat` 
2. Start: `start-optimized.bat` 
3. Configure Augment Agent with server path 
 
### Augment Agent Configuration 
```json 
{ 
  "augment.advanced": { 
    "mcpServers": [{ 
      "name": "moondream-optimized", 
      "command": "node", 
      "args": ["[PATH]/build/optimized-server.js"] 
    }] 
  } 
} 
``` 
