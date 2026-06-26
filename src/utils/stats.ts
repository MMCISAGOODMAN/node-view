import type { DataStats, NodeValueType } from '@/types'

/**
 * 计算数据统计信息：节点总数、最大层级、数据大小
 * @param data - 数据对象
 * @param textSize - 文本字节大小
 */
export function computeStats(data: unknown, textSize: number): DataStats {
  let nodeCount = 0
  let maxDepth = 0

  function walk(value: unknown, depth: number): void {
    nodeCount += 1
    maxDepth = Math.max(maxDepth, depth)

    const type = getType(value)
    if (type === 'object' && value !== null) {
      for (const v of Object.values(value as Record<string, unknown>)) {
        walk(v, depth + 1)
      }
    } else if (type === 'array') {
      for (const v of value as unknown[]) {
        walk(v, depth + 1)
      }
    }
  }

  if (data !== null && data !== undefined) {
    walk(data, 1)
  }

  return {
    nodeCount,
    maxDepth,
    sizeBytes: textSize,
  }
}

/**
 * 获取值的类型
 */
function getType(value: unknown): NodeValueType {
  if (value === null || value === undefined) return 'null'
  if (Array.isArray(value)) return 'array'
  if (typeof value === 'object') return 'object'
  if (typeof value === 'string') return 'string'
  if (typeof value === 'number') return 'number'
  if (typeof value === 'boolean') return 'boolean'
  return 'string'
}

/**
 * 格式化字节大小为人类可读字符串
 * @param bytes - 字节数
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * 防抖函数（支持 cancel 取消待执行的回调）
 * @param fn - 要防抖的函数
 * @param delay - 延迟毫秒数
 */
export function debounce<T extends (...args: Parameters<T>) => void>(
  fn: T,
  delay: number
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
  let timer: ReturnType<typeof setTimeout> | null = null

  const debounced = (...args: Parameters<T>): void => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn(...args)
      timer = null
    }, delay)
  }

  debounced.cancel = (): void => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  return debounced
}

/** localStorage 自动保存的 key */
export const AUTOSAVE_KEY = 'nodeview-autosave'

/**
 * 保存到 localStorage
 * @param content - 文本内容
 * @param format - 数据格式
 */
export function saveToLocalStorage(content: string, format: string): void {
  try {
    localStorage.setItem(
      AUTOSAVE_KEY,
      JSON.stringify({ content, format, timestamp: Date.now() })
    )
  } catch {
    // localStorage 不可用时静默失败
  }
}

/**
 * 从 localStorage 恢复
 */
export function loadFromLocalStorage(): { content: string; format: string } | null {
  try {
    const raw = localStorage.getItem(AUTOSAVE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { content: string; format: string }
    return parsed
  } catch {
    return null
  }
}

/**
 * 解析用户输入的值为对应类型
 * @param input - 用户输入字符串
 * @param originalType - 原始类型
 */
export function parseInputValue(input: string, originalType: NodeValueType): unknown {
  if (originalType === 'number') {
    const num = Number(input)
    return Number.isNaN(num) ? 0 : num
  }
  if (originalType === 'boolean') {
    return input.toLowerCase() === 'true'
  }
  if (originalType === 'null') {
    return null
  }
  return input
}
