<script setup lang="ts">
import { computed } from 'vue'
import { useEditorStore } from '@/stores/editorStore'
import TreeNodeItem from './TreeNodeItem.vue'
import AppIcon from './AppIcon.vue'
import { flattenVisibleNodes } from '@/utils/treeBuilder'

const store = useEditorStore()
const visibleNodes = computed(() => flattenVisibleNodes(store.treeNodes))
</script>

<template>
  <div class="tree-view">
    <div class="panel-header">
      <div class="header-left">
        <AppIcon name="tree" :size="13" class="header-icon" />
        <span class="panel-title">结构</span>
      </div>
      <span class="panel-badge">{{ visibleNodes.length }}</span>
    </div>
    <div class="tree-body">
      <div v-if="store.treeNodes.length === 0" class="tree-empty">
        <p v-if="store.parseError" class="empty-error">{{ store.parseError.message }}</p>
        <p v-else class="empty-hint">暂无数据</p>
      </div>
      <TreeNodeItem
        v-for="node in store.treeNodes"
        :key="`${node.path}-${JSON.stringify(node.value)}`"
        :node="node"
        :depth="0"
      />
    </div>
  </div>
</template>

<style scoped>
.tree-view {
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

.tree-body {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 4px 0 8px;
  font-family: var(--font-mono);
}

.tree-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 24px;
}

.empty-hint {
  font-size: 12px;
  color: var(--text-muted);
}

.empty-error {
  font-size: 12px;
  color: var(--color-error);
  text-align: center;
  line-height: 1.5;
}
</style>
