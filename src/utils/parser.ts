import JSON5 from 'json5'
import yaml from 'js-yaml'
import type { DataFormat, ParseError } from '@/types'

/** 解析结果 */
export interface ParseResult {
  data: unknown
  error: ParseError | null
}

/**
 * 解析文本内容为 JavaScript 对象
 * JSON 使用 JSON5 支持注释和尾逗号，YAML 使用 js-yaml
 * @param text - 原始文本
 * @param format - 数据格式
 */
export function parseText(text: string, format: DataFormat): ParseResult {
  const trimmed = text.trim()

  if (!trimmed) {
    return { data: null, error: null }
  }

  try {
    if (format === 'yaml') {
      const data = yaml.load(trimmed)
      return { data, error: null }
    }

    const data = JSON5.parse(trimmed)
    return { data, error: null }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    const location = extractErrorLocation(message, text)
    return {
      data: null,
      error: { message, ...location },
    }
  }
}

/**
 * 从错误消息和文本中提取行号列号
 * @param message - 错误消息
 * @param text - 原始文本
 */
function extractErrorLocation(
  message: string,
  text: string
): { line?: number; column?: number } {
  // JSON5 错误格式: at line X column Y
  const jsonMatch = message.match(/line\s+(\d+)\s+column\s+(\d+)/i)
  if (jsonMatch) {
    return { line: Number(jsonMatch[1]), column: Number(jsonMatch[2]) }
  }

  // YAML 错误格式: at line X, column Y
  const yamlMatch = message.match(/line\s+(\d+)(?:,\s*column\s+(\d+))?/i)
  if (yamlMatch) {
    return {
      line: Number(yamlMatch[1]),
      column: yamlMatch[2] ? Number(yamlMatch[2]) : undefined,
    }
  }

  // 尝试从 position 信息推算
  const posMatch = message.match(/position\s+(\d+)/i)
  if (posMatch) {
    const pos = Number(posMatch[1])
    const before = text.slice(0, pos)
    const lines = before.split('\n')
    return { line: lines.length, column: lines[lines.length - 1].length + 1 }
  }

  return {}
}

/**
 * 将数据序列化为格式化文本
 * @param data - 数据对象
 * @param format - 目标格式
 * @param compact - 是否压缩为单行
 */
export function serializeData(
  data: unknown,
  format: DataFormat,
  compact = false
): string {
  if (data === null || data === undefined) {
    return format === 'yaml' ? 'null\n' : 'null'
  }

  if (format === 'yaml') {
    return yaml.dump(data, {
      indent: 2,
      lineWidth: compact ? -1 : 80,
      noRefs: true,
      sortKeys: false,
    })
  }

  if (compact) {
    return JSON.stringify(data)
  }

  return JSON.stringify(data, null, 2)
}

/**
 * 在 JSON 和 YAML 格式之间转换文本
 * @param text - 原始文本
 * @param fromFormat - 源格式
 * @param toFormat - 目标格式
 */
export function convertFormat(
  text: string,
  fromFormat: DataFormat,
  toFormat: DataFormat
): { text: string; error: ParseError | null } {
  if (fromFormat === toFormat) {
    return { text, error: null }
  }

  const { data, error } = parseText(text, fromFormat)
  if (error || data === undefined) {
    return { text, error }
  }

  return { text: serializeData(data, toFormat), error: null }
}
