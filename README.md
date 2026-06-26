# NodeView

跨平台桌面端 **JSON / YAML 可视化编辑器**。左侧树形结构 + 右侧 CodeMirror 代码编辑器，**双向实时联动**。

[![CI](https://github.com/MMCISAGOODMAN/node-view/actions/workflows/ci.yml/badge.svg)](https://github.com/MMCISAGOODMAN/node-view/actions/workflows/ci.yml)
[![Release](https://github.com/MMCISAGOODMAN/node-view/actions/workflows/release.yml/badge.svg)](https://github.com/MMCISAGOODMAN/node-view/actions/workflows/release.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## 下载安装

前往 [Releases](https://github.com/MMCISAGOODMAN/node-view/releases) 页面下载对应系统的安装包：

| 系统 | 安装包 |
|------|--------|
| macOS | `NodeView-x.x.x.dmg` / `.zip` |
| Windows | `NodeView Setup x.x.x.exe`（安装版）/ `.exe`（便携版） |
| Linux | `.AppImage` / `.deb` |

> 推送 `v*` 标签后，GitHub Actions 会自动构建并发布各平台安装包。

## 功能特性

- **双栏布局** — 树形视图与代码编辑器并排，中间可拖拽调整宽度
- **双向联动** — 修改任意一侧，另一侧自动同步（300ms 防抖）
- **格式互转** — JSON ↔ YAML 无损转换
- **语法校验** — 实时错误提示，红色波浪线标注
- **格式化 / 压缩** — 2 空格缩进美化，或压缩为单行
- **文件操作** — 打开 / 保存 / 另存为（`.json` `.yaml` `.yml`）
- **树节点操作** — 展开折叠、选中定位、双击编辑、JSONPath 复制
- **搜索** — 关键词高亮匹配节点
- **主题** — 暗色 / 亮色，默认 VS Code 风格暗色
- **自动保存** — 编辑内容自动写入 localStorage

## 界面预览

```
┌─────────────────────────────────────────────────────────┐
│  NodeView  │  打开  保存  │  JSON  格式化  压缩  │  主题  │
├─────────────────────────────────────────────────────────┤
│  搜索节点…                                          ⌘F  │
├──────────────────┬──────────────────────────────────────┤
│  结构            │  编辑器                               │
│  ├─ $            │  {                                    │
│  │  ├─ name      │    "name": "...",                     │
│  │  └─ config   │    "config": { ... }                  │
├──────────────────┴──────────────────────────────────────┤
│  ● 就绪  │  $.config.theme  │  12 节点 │ 深度 3 │ JSON  │
└─────────────────────────────────────────────────────────┘
```

## 快速开始（开发）

### 环境要求

- Node.js >= 20
- npm >= 10

### 安装与运行

```bash
git clone https://github.com/MMCISAGOODMAN/node-view.git
cd node-view
npm install
npm run dev
```

### 常用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发模式（Vite + Electron） |
| `npm run typecheck` | TypeScript 类型检查 |
| `npm run build:app` | 编译前端与 Electron 主进程 |
| `npm run build:pack` | 打包当前平台的安装包 |
| `npm run build` | 完整构建（编译 + 打包） |

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl/Cmd + O` | 打开文件 |
| `Ctrl/Cmd + S` | 保存文件 |
| `Ctrl/Cmd + Shift + S` | 另存为 |
| `Ctrl/Cmd + F` | 聚焦搜索框 |
| 双击叶子节点 | 编辑节点值 |
| 右键叶子节点 | 编辑节点值 |

完整说明见 [用户使用手册](docs/USER_MANUAL.md)。

## 技术栈

| 类别 | 技术 |
|------|------|
| 桌面框架 | Electron 34 |
| 前端 | Vue 3 + TypeScript + Vite 6 |
| 状态管理 | Pinia |
| 代码编辑器 | CodeMirror 6 |
| JSON 解析 | JSON5（支持注释、尾逗号） |
| YAML 解析 | js-yaml |
| 打包 | electron-builder |

## 项目结构

```
node-view/
├── .github/workflows/   # CI / Release 自动化
├── electron/            # Electron 主进程 & 预加载
├── src/
│   ├── components/      # Vue 组件
│   ├── stores/          # Pinia 状态
│   ├── utils/           # 解析、树构建、JSONPath
│   ├── types/           # TypeScript 类型
│   └── styles/          # 全局样式
├── docs/                # 用户手册
├── CHANGELOG.md
└── package.json
```

## 架构

```
┌─────────────────────────────────────────────┐
│                  Toolbar                     │
├──────────────┬──────────────────────────────┤
│   TreeView   │        CodeEditor             │
│  (Pinia ←→)  │     (CodeMirror 6)            │
├──────────────┴──────────────────────────────┤
│                  StatusBar                   │
└─────────────────────────────────────────────┘
         ↕ IPC (dialog, fs)
    Electron Main Process
```

**数据流：**

1. **代码 → 树**：CodeMirror 变更 → 防抖 300ms → JSON5/js-yaml 解析 → 重建树
2. **树 → 代码**：节点编辑 → `setValueByPath` → 序列化 → 更新 CodeMirror
3. **文件操作**：渲染进程 IPC → 主进程 `dialog` + `fs`

## 发布流程

```bash
# 1. 更新版本号（package.json）和 CHANGELOG.md
# 2. 提交并推送
git add .
git commit -m "chore: release v1.0.0"
git push origin master

# 3. 打标签触发 GitHub Actions 构建各平台安装包
git tag v1.0.0
git push origin v1.0.0
```

推送 `v*` 标签后，[Release Workflow](https://github.com/MMCISAGOODMAN/node-view/actions/workflows/release.yml) 会在 macOS / Windows / Linux 上并行构建，并自动创建 GitHub Release。

## 贡献

欢迎提交 Issue 和 Pull Request。

## 许可证

[MIT](LICENSE) © 2026 [mamingcong](https://github.com/MMCISAGOODMAN)
