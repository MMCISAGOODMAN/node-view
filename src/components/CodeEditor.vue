<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { EditorView, keymap, lineNumbers, highlightActiveLine, drawSelection } from '@codemirror/view'
import { EditorState, Compartment, Transaction } from '@codemirror/state'
import { json } from '@codemirror/lang-json'
import { yaml } from '@codemirror/legacy-modes/mode/yaml'
import { StreamLanguage } from '@codemirror/language'
import { oneDark } from '@codemirror/theme-one-dark'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search'
import { linter, lintGutter, type Diagnostic } from '@codemirror/lint'
import { useEditorStore } from '@/stores/editorStore'
import { parseText } from '@/utils/parser'
import AppIcon from './AppIcon.vue'

const store = useEditorStore()
const editorContainer = ref<HTMLElement | null>(null)
let editorView: EditorView | null = null

/** 语言配置 compartment，用于动态切换 JSON/YAML */
const languageConf = new Compartment()
const themeConf = new Compartment()

/** YAML 语言支持 */
const yamlLang = StreamLanguage.define(yaml)

/**
 * 创建语法校验 linter
 */
function createLinter() {
  return linter((view): Diagnostic[] => {
    const text = view.state.doc.toString()
    if (!text.trim()) return []

    const { error } = parseText(text, store.format)
    if (!error) return []

    const line = error.line ?? 1
    const column = error.column ?? 1
    const lineInfo = view.state.doc.line(Math.min(line, view.state.doc.lines))

    return [
      {
        from: lineInfo.from + Math.max(0, column - 1),
        to: lineInfo.to,
        severity: 'error',
        message: error.message,
      },
    ]
  })
}

/**
 * 外部更新编辑器内容（树→代码同步）
 */
function updateEditorContent(text: string): void {
  if (!editorView) return
  const current = editorView.state.doc.toString()
  if (current === text) return

  // 程序写入，不加入撤销历史，不触发 code→tree 同步
  editorView.dispatch({
    changes: { from: 0, to: editorView.state.doc.length, insert: text },
    annotations: Transaction.addToHistory.of(false),
  })
}

/**
 * 初始化 CodeMirror 编辑器
 */
function initEditor(): void {
  if (!editorContainer.value) return

  const lightTheme = EditorView.theme({
    '&': { backgroundColor: '#ffffff', color: '#333333' },
    '.cm-content': { caretColor: '#0066bf' },
    '.cm-cursor': { borderLeftColor: '#0066bf' },
    '.cm-activeLine': { backgroundColor: 'rgba(0, 102, 191, 0.05)' },
    '.cm-gutters': { backgroundColor: '#f3f3f3', color: '#999999', border: 'none' },
    '.cm-selectionBackground': { backgroundColor: 'rgba(0, 102, 191, 0.15) !important' },
  })

  const extensions = [
    lineNumbers(),
    highlightActiveLine(),
    drawSelection(),
    history(),
    highlightSelectionMatches(),
    lintGutter(),
    createLinter(),
    keymap.of([...defaultKeymap, ...historyKeymap, ...searchKeymap]),
    languageConf.of(store.format === 'json' ? json() : yamlLang),
    themeConf.of(store.theme === 'dark' ? oneDark : lightTheme),
    EditorView.updateListener.of((update) => {
      // 仅响应用户编辑，忽略程序同步（树→代码）触发的变更
      if (!update.docChanged) return
      const isUserEdit = update.transactions.some(
        (tr) => tr.annotation(Transaction.userEvent) != null
      )
      if (!isUserEdit) return
      store.onCodeChange(update.state.doc.toString())
    }),
    EditorView.theme({
      '&': { height: '100%', fontSize: '14px' },
      '.cm-scroller': { overflow: 'auto', fontFamily: "'JetBrains Mono', 'Fira Code', monospace" },
      '.cm-content': { padding: '8px 0' },
    }),
  ]

  editorView = new EditorView({
    state: EditorState.create({
      doc: store.rawText,
      extensions,
    }),
    parent: editorContainer.value,
  })
}

/**
 * 滚动到指定行
 */
function scrollToLine(line: number): void {
  if (!editorView) return
  const docLine = Math.min(line, editorView.state.doc.lines)
  const lineInfo = editorView.state.doc.line(docLine)
  editorView.dispatch({
    effects: EditorView.scrollIntoView(lineInfo.from, { y: 'center' }),
    selection: { anchor: lineInfo.from },
  })
  store.clearScrollToLine()
}

// 监听 store 中 rawText / editorRevision 变化（树→代码）
watch(
  () => [store.rawText, store.editorRevision] as const,
  ([newText]) => {
    updateEditorContent(newText)
  }
)

onMounted(() => {
  initEditor()
  // 初始化后立即同步一次（解决子组件先于 store.initialize 挂载的时序问题）
  updateEditorContent(store.rawText)
})

// 监听格式切换
watch(
  () => store.format,
  (newFormat) => {
    if (!editorView) return
    editorView.dispatch({
      effects: languageConf.reconfigure(newFormat === 'json' ? json() : yamlLang),
    })
  }
)

// 监听主题切换
watch(
  () => store.theme,
  (newTheme) => {
    if (!editorView) return
    const lightTheme = EditorView.theme({
      '&': { backgroundColor: '#ffffff', color: '#333333' },
      '.cm-content': { caretColor: '#0066bf' },
      '.cm-cursor': { borderLeftColor: '#0066bf' },
      '.cm-activeLine': { backgroundColor: 'rgba(0, 102, 191, 0.05)' },
      '.cm-gutters': { backgroundColor: '#f3f3f3', color: '#999999', border: 'none' },
    })
    editorView.dispatch({
      effects: themeConf.reconfigure(newTheme === 'dark' ? oneDark : lightTheme),
    })
  }
)

// 监听滚动定位
watch(
  () => store.scrollToLine,
  (line) => {
    if (line !== null) scrollToLine(line)
  }
)

onUnmounted(() => {
  editorView?.destroy()
})
</script>

<template>
  <div class="code-editor">
    <div class="panel-header">
      <div class="header-left">
        <AppIcon name="code" :size="13" class="header-icon" />
        <span class="panel-title">编辑器</span>
      </div>
      <span class="format-tag">{{ store.formatLabel }}</span>
    </div>
    <div ref="editorContainer" class="editor-container" />
  </div>
</template>

<style scoped>
.code-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-primary);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 6px;
}

.header-icon {
  color: var(--text-muted);
}

.format-tag {
  font-size: 10px;
  font-weight: 600;
  color: var(--accent);
  background: var(--accent-subtle);
  border: 1px solid rgba(0, 122, 204, 0.2);
  padding: 1px 7px;
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  letter-spacing: 0.04em;
}

.editor-container {
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

.editor-container :deep(.cm-editor) {
  height: 100%;
}

.editor-container :deep(.cm-editor.cm-focused) {
  outline: none;
}

.editor-container :deep(.cm-scroller) {
  font-family: var(--font-mono);
}
</style>
