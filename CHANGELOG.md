# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2026-06-26

### Fixed

- 修复 Linux `.deb` 打包失败（补充 author email、maintainer 等元数据）
- 修复 Release workflow：单个平台失败时仍发布其他平台安装包

## [1.0.0] - 2026-06-26

### Added

- 双栏布局：左侧树形结构 + 右侧 CodeMirror 代码编辑器，可拖拽调整比例
- 双向实时联动：树节点编辑 ↔ 代码编辑（300ms 防抖）
- JSON / YAML 格式互转、格式化、压缩
- 实时语法校验（JSON5 / js-yaml）
- 文件打开、保存、另存为（`.json` / `.yaml` / `.yml`）
- 树节点展开/折叠、选中定位、双击/右键编辑叶子节点
- JSONPath 一键复制
- 节点搜索与高亮
- 状态栏统计（节点数、层级、数据大小）
- localStorage 自动保存
- 暗色 / 亮色主题切换
- macOS / Windows / Linux 安装包（GitHub Actions 自动构建）

### Changed

- VS Code 风格 UI，SVG 图标替代 emoji
- 完善 README 与用户手册

[1.0.1]: https://github.com/MMCISAGOODMAN/node-view/releases/tag/v1.0.1
[1.0.0]: https://github.com/MMCISAGOODMAN/node-view/releases/tag/v1.0.0
