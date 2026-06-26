/**
 * 根据 JSONPath 从数据对象中获取值
 * 支持格式：$.name、$.users[0]、$.users[0].name
 * @param data - 数据对象
 * @param path - JSONPath 路径
 */
export function getValueByPath(data: unknown, path: string): unknown {
  if (!path || path === '$') return data

  const segments = parsePath(path)
  let current: unknown = data

  for (const segment of segments) {
    if (current === null || current === undefined) return undefined

    if (segment.type === 'property') {
      if (typeof current !== 'object' || Array.isArray(current)) return undefined
      current = (current as Record<string, unknown>)[segment.key]
    } else {
      if (!Array.isArray(current)) return undefined
      current = current[segment.index]
    }
  }

  return current
}

/**
 * 根据 JSONPath 设置数据对象中的值
 * @param data - 数据对象（会被修改）
 * @param path - JSONPath 路径
 * @param value - 新值
 */
export function setValueByPath(data: unknown, path: string, value: unknown): void {
  if (!path || path === '$') return

  const segments = parsePath(path)
  let current: unknown = data

  for (let i = 0; i < segments.length - 1; i++) {
    const segment = segments[i]
    if (segment.type === 'property') {
      current = (current as Record<string, unknown>)[segment.key]
    } else {
      current = (current as unknown[])[segment.index]
    }
  }

  const last = segments[segments.length - 1]
  if (last.type === 'property') {
    ;(current as Record<string, unknown>)[last.key] = value
  } else {
    ;(current as unknown[])[last.index] = value
  }
}

/** 路径段：属性访问或数组索引 */
type PathSegment =
  | { type: 'property'; key: string }
  | { type: 'index'; index: number }

/**
 * 解析 JSONPath 为路径段数组
 * @param path - 如 $.config.theme 或 $.users[0].name
 */
function parsePath(path: string): PathSegment[] {
  const normalized = path.startsWith('$.') ? path.slice(2) : path.startsWith('$') ? path.slice(1) : path
  if (!normalized) return []

  const segments: PathSegment[] = []
  const regex = /([^.\[\]]+)|\[(\d+)\]/g
  let match: RegExpExecArray | null

  while ((match = regex.exec(normalized)) !== null) {
    if (match[1] !== undefined) {
      segments.push({ type: 'property', key: match[1] })
    } else if (match[2] !== undefined) {
      segments.push({ type: 'index', index: Number(match[2]) })
    }
  }

  return segments
}

/**
 * 将路径段重新组合为 JSONPath 字符串
 * @param segments - 路径段数组
 */
export function buildPath(segments: PathSegment[]): string {
  if (segments.length === 0) return '$'

  let path = '$'
  for (const seg of segments) {
    if (seg.type === 'property') {
      path += `.${seg.key}`
    } else {
      path += `[${seg.index}]`
    }
  }
  return path
}

/**
 * 复制 JSONPath 到剪贴板
 * @param path - JSONPath
 */
export async function copyPathToClipboard(path: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(path)
    return true
  } catch {
    return false
  }
}

/**
 * 根据 JSONPath 在序列化文本中查找大致行号
 * @param text - 序列化后的文本
 * @param path - JSONPath
 * @param key - 节点字段名
 */
export function findLineForPath(text: string, path: string, key: string): number {
  const lines = text.split('\n')
  const pathParts = path.replace(/^\$\.?/, '').split(/[\.\[\]]+/).filter(Boolean)
  const searchKey = pathParts[pathParts.length - 1] ?? key

  // 优先精确匹配 "key": 或 key: 格式
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (
      line.includes(`"${searchKey}"`) ||
      line.match(new RegExp(`^\\s*${escapeRegex(searchKey)}\\s*:`))
    ) {
      return i + 1
    }
  }

  return 1
}

/**
 * 转义正则特殊字符
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
