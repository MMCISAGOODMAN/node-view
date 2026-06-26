<script setup lang="ts">
import { computed } from 'vue'
import { useEditorStore } from '@/stores/editorStore'
import { formatBytes } from '@/utils/stats'

const store = useEditorStore()

const statusKind = computed(() => {
  if (store.parseError) return 'error'
  if (store.isDirty) return 'dirty'
  return 'ready'
})
</script>

<template>
  <footer class="status-bar">
    <div class="status-left">
      <span class="status-dot" :class="statusKind" />
      <span class="status-item" :class="{ error: store.parseError }">
        {{ store.statusText }}
      </span>
    </div>

    <div class="status-center">
      <span v-if="store.selectedPath" class="status-item path mono">
        {{ store.selectedPath }}
      </span>
    </div>

    <div class="status-right">
      <span class="stat">{{ store.stats.nodeCount }} 节点</span>
      <span class="stat-sep" />
      <span class="stat">深度 {{ store.stats.maxDepth }}</span>
      <span class="stat-sep" />
      <span class="stat">{{ formatBytes(store.stats.sizeBytes) }}</span>
      <span class="stat-sep" />
      <span class="format-tag">{{ store.formatLabel }}</span>
    </div>
  </footer>
</template>

<style scoped>
.status-bar {
  display: flex;
  align-items: center;
  height: 24px;
  padding: 0 10px;
  background: var(--accent);
  font-size: 11px;
  color: rgba(255, 255, 255, 0.85);
  flex-shrink: 0;
  gap: 8px;
}

[data-theme='light'] .status-bar {
  background: var(--accent);
  color: rgba(255, 255, 255, 0.9);
}

.status-left {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  min-width: 0;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.5);
}

.status-dot.ready {
  background: var(--color-success);
}

.status-dot.dirty {
  background: var(--color-warning);
}

.status-dot.error {
  background: #ff6b6b;
}

.status-center {
  flex: 2;
  text-align: center;
  min-width: 0;
}

.status-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0;
  min-width: 0;
}

.status-item {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-item.error {
  color: #ffcccc;
}

.status-item.path {
  opacity: 0.85;
  font-size: 10px;
}

.stat {
  opacity: 0.85;
  white-space: nowrap;
}

.stat-sep {
  width: 1px;
  height: 10px;
  background: rgba(255, 255, 255, 0.25);
  margin: 0 8px;
  flex-shrink: 0;
}

.format-tag {
  font-weight: 600;
  letter-spacing: 0.04em;
  opacity: 1;
}
</style>
