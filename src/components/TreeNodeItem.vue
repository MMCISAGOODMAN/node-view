<script setup lang="ts">
import { ref, computed } from 'vue'
import type { TreeNode } from '@/types'
import { useEditorStore } from '@/stores/editorStore'
import { getTypeBadge, formatDisplayValue } from '@/utils/treeBuilder'
import AppIcon from './AppIcon.vue'
import TreeNodeItem from './TreeNodeItem.vue'

const props = defineProps<{
  node: TreeNode
  depth: number
}>()

const store = useEditorStore()
const isEditing = ref(false)
const editValue = ref('')
const isHovered = ref(false)

const hasChildren = computed(
  () => props.node.type === 'object' || props.node.type === 'array'
)

const isLeaf = computed(
  () => !hasChildren.value && props.node.type !== 'null'
)

const isSelected = computed(() => store.selectedPath === props.node.path)

const indentStyle = computed(() => ({
  paddingLeft: `${props.depth * 16 + 6}px`,
}))

function handleClick(): void {
  store.selectNode(props.node.path, props.node.key)
}

function handleDblClick(): void {
  if (!isLeaf.value) return
  editValue.value = String(props.node.value ?? '')
  isEditing.value = true
}

function confirmEdit(): void {
  store.editNodeValue(props.node.path, editValue.value)
  isEditing.value = false
}

function cancelEdit(): void {
  isEditing.value = false
}

function toggleExpand(e: Event): void {
  e.stopPropagation()
  store.toggleExpand(props.node.path)
}

function copyPath(e: Event): void {
  e.stopPropagation()
  store.copyJsonPath(props.node.path)
}

function handleContextMenu(e: Event): void {
  e.preventDefault()
  if (isLeaf.value) handleDblClick()
}
</script>

<template>
  <div class="tree-node-wrapper">
    <div
      class="tree-node"
      :class="{ selected: isSelected, highlighted: node.isHighlighted }"
      :style="indentStyle"
      @click="handleClick"
      @dblclick="handleDblClick"
      @contextmenu="handleContextMenu"
      @mouseenter="isHovered = true"
      @mouseleave="isHovered = false"
    >
      <button
        v-if="hasChildren"
        class="expand-btn"
        :class="{ expanded: node.isExpanded }"
        @click="toggleExpand"
      >
        <AppIcon name="chevron" :size="12" />
      </button>
      <span v-else class="expand-placeholder" />

      <span class="type-badge" :class="`type-${node.type}`">
        {{ getTypeBadge(node.type) }}
      </span>

      <span class="node-key mono">{{ node.key === 'root' ? '$' : node.key }}</span>

      <template v-if="isEditing">
        <input
          v-model="editValue"
          class="edit-input mono"
          autofocus
          @keydown.enter="confirmEdit"
          @keydown.esc="cancelEdit"
          @blur="confirmEdit"
          @click.stop
        />
      </template>
      <span v-else class="node-value mono" :class="`val-${node.type}`">
        {{ formatDisplayValue(node.value, node.type) }}
      </span>

      <button
        v-if="isHovered && node.path !== '$'"
        class="copy-btn"
        title="复制 JSONPath"
        @click="copyPath"
      >
        <AppIcon name="copy" :size="12" />
      </button>
    </div>

    <template v-if="node.isExpanded && node.children">
      <TreeNodeItem
        v-for="child in node.children"
        :key="`${child.path}-${child.key}`"
        :node="child"
        :depth="depth + 1"
      />
    </template>
  </div>
</template>

<style scoped>
.tree-node {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 1px 24px 1px 0;
  cursor: default;
  font-size: 12px;
  border-radius: var(--radius-sm);
  margin: 0 4px;
  position: relative;
  min-height: 24px;
  transition: background 0.1s;
}

.tree-node:hover {
  background: var(--bg-hover);
}

.tree-node.selected {
  background: var(--accent-subtle);
  outline: 1px solid rgba(0, 122, 204, 0.25);
}

.tree-node.highlighted {
  background: rgba(204, 167, 0, 0.08);
}

.expand-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  border-radius: 2px;
  flex-shrink: 0;
  padding: 0;
  transition: transform 0.15s, color 0.1s;
}

.expand-btn:hover {
  color: var(--text-primary);
  background: var(--bg-active);
}

.expand-btn.expanded {
  transform: rotate(90deg);
}

.expand-placeholder {
  width: 16px;
  flex-shrink: 0;
}

.node-key {
  color: var(--color-key);
  flex-shrink: 0;
}

.node-value {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.node-value.val-string {
  color: var(--color-string);
}

.node-value.val-number {
  color: var(--color-number);
}

.node-value.val-boolean {
  color: var(--color-boolean);
}

.node-value.val-null {
  color: var(--text-muted);
  font-style: italic;
}

.node-value.val-object,
.node-value.val-array {
  color: var(--text-muted);
}

.edit-input {
  flex: 1;
  min-width: 0;
  background: var(--bg-primary);
  border: 1px solid var(--accent);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: 12px;
  padding: 1px 6px;
  outline: none;
  box-shadow: 0 0 0 2px var(--accent-subtle);
}

.copy-btn {
  position: absolute;
  right: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: none;
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  cursor: pointer;
  padding: 0;
}

.copy-btn:hover {
  color: var(--text-primary);
  border-color: var(--border);
}
</style>
