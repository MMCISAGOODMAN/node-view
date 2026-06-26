<script setup lang="ts">
import { useEditorStore } from '@/stores/editorStore'
import AppIcon from './AppIcon.vue'

const store = useEditorStore()
</script>

<template>
  <header class="toolbar">
    <div class="toolbar-brand">
      <AppIcon name="code" :size="18" />
      <span class="brand-name">NodeView</span>
    </div>

    <div class="toolbar-divider" />

    <div class="toolbar-group">
      <button class="toolbar-btn" title="打开文件 (Ctrl+O)" @click="store.openFile()">
        <AppIcon name="folder-open" :size="15" />
        <span>打开</span>
      </button>
      <button class="toolbar-btn" title="保存 (Ctrl+S)" @click="store.saveFile()">
        <AppIcon name="save" :size="15" />
        <span>保存</span>
      </button>
    </div>

    <div class="toolbar-divider" />

    <div class="toolbar-group">
      <button
        class="toolbar-btn format-btn"
        :title="`切换为 ${store.format === 'json' ? 'YAML' : 'JSON'}`"
        @click="store.toggleFormat()"
      >
        <AppIcon name="swap" :size="15" />
        <span>{{ store.formatLabel }}</span>
      </button>
      <button class="toolbar-btn" title="格式化（2空格缩进）" @click="store.formatText()">
        <AppIcon name="format" :size="15" />
        <span>格式化</span>
      </button>
      <button class="toolbar-btn" title="压缩为单行" @click="store.compactText()">
        <AppIcon name="compress" :size="15" />
        <span>压缩</span>
      </button>
    </div>

    <div class="toolbar-divider" />

    <div class="toolbar-group">
      <button
        class="toolbar-btn icon-only"
        :title="store.theme === 'dark' ? '切换亮色主题' : '切换暗色主题'"
        @click="store.toggleTheme()"
      >
        <AppIcon :name="store.theme === 'dark' ? 'sun' : 'moon'" :size="15" />
      </button>
      <button class="toolbar-btn danger" title="清空内容" @click="store.clearContent()">
        <AppIcon name="trash" :size="15" />
        <span>清空</span>
      </button>
    </div>

    <div class="toolbar-spacer" />

    <div v-if="store.filePath" class="file-path" :title="store.filePath">
      <AppIcon name="folder-open" :size="13" />
      <span>{{ store.filePath.split('/').pop() }}</span>
    </div>
  </header>
</template>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  height: 40px;
  padding: 0 10px;
  background: var(--bg-panel);
  border-bottom: 1px solid var(--border);
  gap: 2px;
  flex-shrink: 0;
}

.toolbar-brand {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 0 6px;
  color: var(--text-primary);
  user-select: none;
}

.brand-name {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 1px;
}

.toolbar-divider {
  width: 1px;
  height: 20px;
  background: var(--border);
  margin: 0 6px;
  flex-shrink: 0;
}

.toolbar-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 28px;
  padding: 0 8px;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.12s, color 0.12s;
  white-space: nowrap;
}

.toolbar-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.toolbar-btn:active {
  background: var(--bg-active);
}

.toolbar-btn.icon-only {
  padding: 0 7px;
}

.toolbar-btn.danger:hover {
  background: rgba(241, 76, 76, 0.12);
  color: var(--color-error);
}

.format-btn {
  min-width: 64px;
}

.toolbar-spacer {
  flex: 1;
}

.file-path {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: var(--text-muted);
  max-width: 220px;
  overflow: hidden;
  padding: 0 6px;
}

.file-path span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: var(--font-mono);
}
</style>
