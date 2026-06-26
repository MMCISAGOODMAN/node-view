<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useEditorStore } from '@/stores/editorStore'
import Toolbar from '@/components/Toolbar.vue'
import SearchBox from '@/components/SearchBox.vue'
import SplitPane from '@/components/SplitPane.vue'
import TreeView from '@/components/TreeView.vue'
import CodeEditor from '@/components/CodeEditor.vue'
import StatusBar from '@/components/StatusBar.vue'

const store = useEditorStore()
const searchInputRef = ref<InstanceType<typeof SearchBox> | null>(null)

/** 清理 Electron 菜单监听器 */
let cleanupMenuListener: (() => void) | null = null
let cleanupFileListener: (() => void) | null = null

/**
 * 全局快捷键处理
 */
function handleKeydown(e: KeyboardEvent): void {
  const isMod = e.metaKey || e.ctrlKey

  if (isMod && e.key === 's') {
    e.preventDefault()
    store.saveFile()
  }

  if (isMod && e.key === 'o') {
    e.preventDefault()
    void store.openFile()
  }

  if (isMod && e.key === 'f') {
    e.preventDefault()
    searchInputRef.value?.focus()
  }
}

/**
 * 注册 Electron 菜单栏事件
 */
function setupElectronMenu(): void {
  if (!window.electronAPI) return

  cleanupMenuListener = window.electronAPI.onMenuAction((action) => {
    if (action === 'save') void store.saveFile()
    if (action === 'save-as') void store.saveFileAs()
  })

  cleanupFileListener = window.electronAPI.onFileOpened((result) => {
    store.applyOpenedFile(result)
  })
}

onMounted(() => {
  document.documentElement.setAttribute('data-theme', store.theme)
  store.initialize()
  setupElectronMenu()
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  cleanupMenuListener?.()
  cleanupFileListener?.()
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="app-layout">
    <Toolbar />
    <SearchBox ref="searchInputRef" />
    <SplitPane
      :left-percent="store.leftPanelPercent"
      @resize="store.setLeftPanelPercent"
    >
      <template #left>
        <TreeView />
      </template>
      <template #right>
        <CodeEditor />
      </template>
    </SplitPane>
    <StatusBar />

    <!-- 复制路径提示 -->
    <Transition name="toast">
      <div v-if="store.copyMessage" class="toast">{{ store.copyMessage }}</div>
    </Transition>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background: var(--bg-primary);
}

.toast {
  position: fixed;
  bottom: 36px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  color: var(--text-primary);
  padding: 8px 14px;
  border-radius: var(--radius-md);
  font-size: 12px;
  z-index: 1000;
  box-shadow: var(--shadow-md);
  font-family: var(--font-mono);
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(8px);
}
</style>
