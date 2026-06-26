import type { NodeValueType, TreeNode } from '@/types'

/** 节点 ID 计数器 */
let nodeIdCounter = 0

/**
 * 重置节点 ID 计数器（重建树时调用）
 */
export function resetNodeIdCounter(): void {
  nodeIdCounter = 0
}

/**
 * 生成唯一节点 ID
 */
function nextNodeId(): string {
  nodeIdCounter += 1
  return `node-${nodeIdCounter}`
}

/**
 * 判断值的类型
 * @param value - 任意值
 */
export function getValueType(value: unknown): NodeValueType {
  if (value === null || value === undefined) return 'null'
  if (Array.isArray(value)) return 'array'
  if (typeof value === 'object') return 'object'
  if (typeof value === 'string') return 'string'
  if (typeof value === 'number') return 'number'
  if (typeof value === 'boolean') return 'boolean'
  return 'string'
}

/**
 * 获取类型对应的徽章标签
 * @param type - 节点类型
 */
export function getTypeBadge(type: NodeValueType): string {
  const badges: Record<NodeValueType, string> = {
    object: '{}',
    array: '[]',
    string: 'str',
    number: 'num',
    boolean: 'bool',
    null: 'null',
  }
  return badges[type]
}

/** @deprecated 使用 getTypeBadge */
export function getTypeIcon(type: NodeValueType): string {
  return getTypeBadge(type)
}

/**
 * 格式化节点值的显示文本
 * @param value - 节点值
 * @param type - 节点类型
 */
export function formatDisplayValue(value: unknown, type: NodeValueType): string {
  if (type === 'object') {
    const keys = Object.keys(value as Record<string, unknown>)
    return `{${keys.length}}`
  }
  if (type === 'array') {
    return `[${(value as unknown[]).length}]`
  }
  if (type === 'string') return `"${String(value)}"`
  if (type === 'null') return 'null'
  return String(value)
}

/**
 * 递归构建树形节点数组
 * @param data - 原始数据
 * @param basePath - 基础 JSONPath，默认 $
 * @param key - 当前字段名
 * @param expandedPaths - 已展开的路径集合
 * @param searchQuery - 搜索关键词
 */
export function buildTree(
  data: unknown,
  basePath = '$',
  key = 'root',
  expandedPaths: Set<string> = new Set(),
  searchQuery = ''
): TreeNode[] {
  resetNodeIdCounter()
  const root = buildNode(data, basePath, key, expandedPaths, searchQuery, 0)
  return root ? [root] : []
}

/**
 * 构建单个树节点
 * @param value - 节点值
 * @param path - JSONPath
 * @param key - 字段名
 * @param expandedPaths - 已展开路径
 * @param searchQuery - 搜索词
 * @param depth - 当前深度
 */
function buildNode(
  value: unknown,
  path: string,
  key: string,
  expandedPaths: Set<string>,
  searchQuery: string,
  depth: number
): TreeNode | null {
  const type = getValueType(value)
  const query = searchQuery.toLowerCase()
  const keyMatch = key.toLowerCase().includes(query)
  const valueMatch =
    query.length > 0 &&
    (type === 'string' || type === 'number' || type === 'boolean') &&
    String(value).toLowerCase().includes(query)

  const node: TreeNode = {
    id: nextNodeId(),
    key,
    value,
    type,
    path,
    isExpanded: expandedPaths.has(path) || depth < 2,
    isHighlighted: keyMatch || valueMatch,
    children: undefined,
  }

  if (type === 'object' && value !== null) {
    const obj = value as Record<string, unknown>
    node.children = Object.entries(obj)
      .map(([childKey, childValue]) => {
        const childPath = `${path}.${childKey}`
        return buildNode(childValue, childPath, childKey, expandedPaths, searchQuery, depth + 1)
      })
      .filter((n): n is TreeNode => n !== null)

    // 父节点匹配：任一子节点高亮则父节点也高亮
    if (node.children.some((c) => c.isHighlighted)) {
      node.isHighlighted = true
    }
  } else if (type === 'array') {
    const arr = value as unknown[]
    node.children = arr
      .map((childValue, index) => {
        const childPath = `${path}[${index}]`
        return buildNode(childValue, childPath, String(index), expandedPaths, searchQuery, depth + 1)
      })
      .filter((n): n is TreeNode => n !== null)

    if (node.children.some((c) => c.isHighlighted)) {
      node.isHighlighted = true
    }
  }

  // 搜索模式下：无匹配且非根节点则隐藏
  if (searchQuery && !node.isHighlighted && depth > 0) {
    return null
  }

  return node
}

/**
 * 收集所有节点的展开路径
 * @param nodes - 树节点数组
 */
export function collectExpandedPaths(nodes: TreeNode[]): Set<string> {
  const paths = new Set<string>()

  function walk(nodeList: TreeNode[]): void {
    for (const node of nodeList) {
      if (node.isExpanded) {
        paths.add(node.path)
      }
      if (node.children) {
        walk(node.children)
      }
    }
  }

  walk(nodes)
  return paths
}

/**
 * 在树中查找指定路径的节点
 * @param nodes - 树节点数组
 * @param path - JSONPath
 */
export function findNodeByPath(nodes: TreeNode[], path: string): TreeNode | null {
  for (const node of nodes) {
    if (node.path === path) return node
    if (node.children) {
      const found = findNodeByPath(node.children, path)
      if (found) return found
    }
  }
  return null
}

/**
 * 扁平化可见树节点（用于虚拟滚动）
 * @param nodes - 树节点数组
 */
export function flattenVisibleNodes(nodes: TreeNode[]): TreeNode[] {
  const result: TreeNode[] = []

  function walk(nodeList: TreeNode[]): void {
    for (const node of nodeList) {
      result.push(node)
      if (node.isExpanded && node.children) {
        walk(node.children)
      }
    }
  }

  walk(nodes)
  return result
}
