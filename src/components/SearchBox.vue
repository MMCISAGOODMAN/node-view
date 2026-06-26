<script setup lang="ts">
import { ref } from 'vue'
import { useEditorStore } from '@/stores/editorStore'
import AppIcon from './AppIcon.vue'

const store = useEditorStore()
const inputRef = ref<HTMLInputElement | null>(null)

/**
 * 暴露 focus 方法供 App.vue 快捷键调用
 */
function focus(): void {
  inputRef.value?.focus()
}

defineExpose({ focus })
</script>

<template>
  <div class="search-bar">
    <AppIcon name="search" :size="14" class="search-icon" />
    <input
      ref="inputRef"
      v-model="store.searchQuery"
      class="search-input"
      type="text"
      placeholder="搜索节点…"
      spellcheck="false"
      @input="store.setSearchQuery(store.searchQuery)"
    />
    <kbd class="search-kbd">⌘F</kbd>
    <button
      v-if="store.searchQuery"
      class="clear-btn"
      title="清除搜索"
      @click="store.setSearchQuery('')"
    >
      <AppIcon name="close" :size="12" />
    </button>
  </div>
</template>

<style scoped>
.search-bar {
  display: flex;
  align-items: center;
  height: 32px;
  padding: 0 10px;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border);
  gap: 8px;
  flex-shrink: 0;
}

.search-icon {
  color: var(--text-muted);
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  color: var(--text-primary);
  font-size: 12px;
  font-family: var(--font-ui);
  outline: none;
  min-width: 0;
}

.search-input::placeholder {
  color: var(--text-muted);
}

.search-kbd {
  font-size: 10px;
  font-family: var(--font-ui);
  color: var(--text-muted);
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: 3px;
  padding: 1px 5px;
  flex-shrink: 0;
}

.clear-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}

.clear-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}
</style>
