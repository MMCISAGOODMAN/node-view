/** 数据格式类型 */
export type DataFormat = 'json' | 'yaml'

/** 主题类型 */
export type ThemeMode = 'dark' | 'light'

/** 节点值类型 */
export type NodeValueType = 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null'

/** 树形节点结构 */
export interface TreeNode {
  /** 字段名或数组索引 */
  key: string
  /** 原始值 */
  value: unknown
  /** 值类型 */
  type: NodeValueType
  /** JSONPath 路径，如 $.config.theme */
  path: string
  /** 子节点 */
  children?: TreeNode[]
  /** 是否展开 */
  isExpanded: boolean
  /** 搜索高亮标记 */
  isHighlighted: boolean
  /** 节点唯一 ID（用于 Vue key） */
  id: string
}

/** 解析错误信息 */
export interface ParseError {
  /** 错误消息 */
  message: string
  /** 错误行号（从 1 开始） */
  line?: number
  /** 错误列号（从 1 开始） */
  column?: number
}

/** 统计信息 */
export interface DataStats {
  /** 节点总数 */
  nodeCount: number
  /** 最大层级深度 */
  maxDepth: number
  /** 数据大小（字节） */
  sizeBytes: number
}

/** Electron API 类型声明 */
export interface OpenFilePayload {
  filePath: string
  content: string
  format: DataFormat
}

export interface ElectronAPI {
  openFile: () => Promise<OpenFilePayload | null>
  saveFile: (filePath: string, content: string) => Promise<{ success: boolean; filePath: string }>
  saveFileAs: (
    content: string,
    format: DataFormat
  ) => Promise<{ success: boolean; filePath: string } | null>
  onMenuAction: (callback: (action: 'save' | 'save-as') => void) => () => void
  onFileOpened: (callback: (result: OpenFilePayload) => void) => () => void
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}

export {}
