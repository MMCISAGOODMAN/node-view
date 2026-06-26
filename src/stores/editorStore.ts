import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { DataFormat, DataStats, OpenFilePayload, ParseError, ThemeMode, TreeNode } from '@/types'
import { parseText, serializeData, convertFormat } from '@/utils/parser'
import { buildTree, collectExpandedPaths, findNodeByPath } from '@/utils/treeBuilder'
import { setValueByPath, copyPathToClipboard, findLineForPath } from '@/utils/jsonPath'
import {
  computeStats,
  debounce,
  saveToLocalStorage,
  loadFromLocalStorage,
  parseInputValue,
} from '@/utils/stats'
/** 默认示例数据 */
const DEFAULT_SAMPLE = {
  name: 'JSON/YAML 编辑器',
  version: '1.0.0',
  description: '一款支持双向联动的可视化编辑器',
  features: ['树形编辑', '双向联动', 'JSON/YAML互转', 'JSONPath复制'],
  config: {
    theme: 'dark',
    fontSize: 14,
    autoSave: true,
  },
  作者: {
    name: 'Your Name',
    email: 'your@email.com',
  },
}

/** 更新来源标记，防止双向联动循环 */
type UpdateSource = 'code' | 'tree' | 'external' | null

export const useEditorStore = defineStore('editor', () => {
  // ---- 状态 ----
  const rawText = ref('')
  const format = ref<DataFormat>('json')
  const theme = ref<ThemeMode>('dark')
  const parsedData = ref<unknown>(DEFAULT_SAMPLE)
  const parseError = ref<ParseError | null>(null)
  const treeNodes = ref<TreeNode[]>([])
  const filePath = ref<string | null>(null)
  const isDirty = ref(false)
  const searchQuery = ref('')
  const selectedPath = ref<string | null>(null)
  const leftPanelPercent = ref(45)
  const scrollToLine = ref<number | null>(null)
  const copyMessage = ref<string | null>(null)
  const updateSource = ref<UpdateSource>(null)
  /** 编辑器同步版本号（树→代码时递增，强制 CodeMirror 刷新） */
  const editorRevision = ref(0)

  // 展开路径缓存
  let expandedPaths = new Set<string>()

  // ---- 计算属性 ----
  const stats = computed<DataStats>(() =>
    computeStats(parsedData.value, new Blob([rawText.value]).size)
  )

  const statusText = computed(() => {
    if (parseError.value) return parseError.value.message
    if (isDirty.value) return '已修改'
    return '就绪'
  })

  // ---- 内部方法 ----

  /**
   * 重建树形结构
   */
  function rebuildTree(): void {
    if (parsedData.value === null && parseError.value) {
      treeNodes.value = []
      return
    }
    // 重建前保留当前展开状态，避免刷新后折叠
    if (treeNodes.value.length > 0) {
      expandedPaths = collectExpandedPaths(treeNodes.value)
    }
    treeNodes.value = buildTree(
      parsedData.value,
      '$',
      'root',
      expandedPaths,
      searchQuery.value
    )
  }

  /**
   * 将文本推送到代码编辑器（树→代码 / 外部同步）
   */
  function pushTextToEditor(text: string): void {
    debouncedCodeSync.cancel()
    rawText.value = text
    editorRevision.value += 1
  }

  /**
   * 从 parsedData 同步到 rawText 和树
   */
  function syncFromData(): void {
    parseError.value = null
    pushTextToEditor(serializeData(parsedData.value, format.value))
    rebuildTree()
    isDirty.value = true
    debouncedAutoSave()
  }

  /**
   * 从 rawText 解析并同步
   */
  function syncFromText(text: string): void {
    const { data, error } = parseText(text, format.value)
    rawText.value = text
    parseError.value = error

    if (!error) {
      parsedData.value = data
      rebuildTree()
      isDirty.value = true
      debouncedAutoSave()
    }
  }

  /** 防抖自动保存 */
  const debouncedAutoSave = debounce(() => {
    saveToLocalStorage(rawText.value, format.value)
  }, 500)

  /** 防抖代码→树同步（300ms） */
  const debouncedCodeSync = debounce((text: string) => {
    syncFromText(text)
  }, 300)

  // ---- 公开 Actions ----

  /**
   * 初始化编辑器（加载自动保存或示例数据）
   */
  function initialize(): void {
    const saved = loadFromLocalStorage()
    if (saved) {
      format.value = saved.format as DataFormat
      pushTextToEditor(saved.content)
      const { data, error } = parseText(saved.content, format.value)
      parseError.value = error
      if (!error) parsedData.value = data
    } else {
      pushTextToEditor(serializeData(DEFAULT_SAMPLE, 'json'))
      parsedData.value = DEFAULT_SAMPLE
    }
    rebuildTree()
  }

  /**
   * 代码编辑器内容变化
   */
  function onCodeChange(text: string): void {
    debouncedCodeSync(text)
  }

  /**
   * 格式化文本
   */
  function formatText(): void {
    const { data, error } = parseText(rawText.value, format.value)
    if (error) return
    updateSource.value = 'external'
    parsedData.value = data
    pushTextToEditor(serializeData(data, format.value, false))
    rebuildTree()
    isDirty.value = true
    updateSource.value = null
  }

  /**
   * 压缩为单行
   */
  function compactText(): void {
    const { data, error } = parseText(rawText.value, format.value)
    if (error) return
    updateSource.value = 'external'
    parsedData.value = data
    pushTextToEditor(serializeData(data, format.value, true))
    rebuildTree()
    isDirty.value = true
    updateSource.value = null
  }

  /**
   * 切换 JSON/YAML 格式
   */
  function toggleFormat(): void {
    const newFormat: DataFormat = format.value === 'json' ? 'yaml' : 'json'
    const { text, error } = convertFormat(rawText.value, format.value, newFormat)
    if (error) return
    format.value = newFormat
    updateSource.value = 'external'
    pushTextToEditor(text)
    const { data, error: parseErr } = parseText(text, newFormat)
    parseError.value = parseErr
    if (!parseErr) parsedData.value = data
    rebuildTree()
    isDirty.value = true
    updateSource.value = null
  }

  /**
   * 切换主题
   */
  function toggleTheme(): void {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', theme.value)
  }

  /**
   * 清空内容
   */
  function clearContent(): void {
    rawText.value = ''
    parsedData.value = null
    parseError.value = null
    treeNodes.value = []
    filePath.value = null
    isDirty.value = false
    expandedPaths = new Set()
  }

  /**
   * 应用已打开的文件内容（工具栏 / 菜单共用）
   */
  function applyOpenedFile(result: OpenFilePayload): void {
    format.value = result.format
    filePath.value = result.filePath
    updateSource.value = 'external'
    pushTextToEditor(result.content)
    const { data, error } = parseText(result.content, result.format)
    parseError.value = error
    if (!error) parsedData.value = data
    rebuildTree()
    isDirty.value = false
    updateSource.value = null
  }

  /**
   * 打开文件
   */
  async function openFile(): Promise<void> {
    if (!window.electronAPI) return
    const result = await window.electronAPI.openFile()
    if (!result) return
    applyOpenedFile(result)
  }

  /**
   * 保存文件
   */
  async function saveFile(): Promise<void> {
    if (!window.electronAPI) return
    if (filePath.value) {
      await window.electronAPI.saveFile(filePath.value, rawText.value)
      isDirty.value = false
    } else {
      await saveFileAs()
    }
  }

  /**
   * 另存为
   */
  async function saveFileAs(): Promise<void> {
    if (!window.electronAPI) return
    const result = await window.electronAPI.saveFileAs(rawText.value, format.value)
    if (result) {
      filePath.value = result.filePath
      isDirty.value = false
    }
  }

  /**
   * 切换节点展开/折叠
   */
  function toggleExpand(path: string): void {
    const node = findNodeByPath(treeNodes.value, path)
    if (!node) return

    if (expandedPaths.has(path)) {
      expandedPaths.delete(path)
      node.isExpanded = false
    } else {
      expandedPaths.add(path)
      node.isExpanded = true
    }
  }

  /**
   * 选中节点并定位到代码行
   */
  function selectNode(path: string, key: string): void {
    selectedPath.value = path
    const line = findLineForPath(rawText.value, path, key)
    scrollToLine.value = line
  }

  /**
   * 编辑树节点值（叶子节点双击）
   */
  function editNodeValue(path: string, newValue: string): void {
    const node = findNodeByPath(treeNodes.value, path)
    if (!node) return

    const typedValue = parseInputValue(newValue, node.type)
    updateSource.value = 'tree'

    // 深拷贝数据以避免直接修改
    const dataCopy = structuredClone(parsedData.value)
    setValueByPath(dataCopy, path, typedValue)
    parsedData.value = dataCopy
    syncFromData()

    updateSource.value = null
  }

  /**
   * 复制 JSONPath 到剪贴板
   */
  async function copyJsonPath(path: string): Promise<void> {
    const success = await copyPathToClipboard(path)
    copyMessage.value = success ? `已复制: ${path}` : '复制失败'
    setTimeout(() => {
      copyMessage.value = null
    }, 2000)
  }

  /**
   * 搜索
   */
  function setSearchQuery(query: string): void {
    searchQuery.value = query
    rebuildTree()
  }

  /**
   * 设置左侧面板宽度百分比
   */
  function setLeftPanelPercent(percent: number): void {
    leftPanelPercent.value = Math.min(70, Math.max(20, percent))
  }

  /**
   * 重置 scrollToLine（编辑器滚动完成后调用）
   */
  function clearScrollToLine(): void {
    scrollToLine.value = null
  }

  /**
   * 获取当前格式标签
   */
  const formatLabel = computed(() => (format.value === 'json' ? 'JSON' : 'YAML'))

  return {
    rawText,
    format,
    theme,
    parsedData,
    parseError,
    treeNodes,
    filePath,
    isDirty,
    searchQuery,
    selectedPath,
    leftPanelPercent,
    scrollToLine,
    copyMessage,
    updateSource,
    editorRevision,
    stats,
    statusText,
    formatLabel,
    initialize,
    onCodeChange,
    formatText,
    compactText,
    toggleFormat,
    toggleTheme,
    clearContent,
    applyOpenedFile,
    openFile,
    saveFile,
    saveFileAs,
    toggleExpand,
    selectNode,
    editNodeValue,
    copyJsonPath,
    setSearchQuery,
    setLeftPanelPercent,
    clearScrollToLine,
  }
})
