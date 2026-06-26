<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  leftPercent: number
}>()

const emit = defineEmits<{
  resize: [percent: number]
}>()

const containerRef = ref<HTMLElement | null>(null)
const isDragging = ref(false)

function startDrag(e: MouseEvent): void {
  isDragging.value = true
  e.preventDefault()
}

function onMouseMove(e: MouseEvent): void {
  if (!isDragging.value || !containerRef.value) return
  const rect = containerRef.value.getBoundingClientRect()
  const percent = ((e.clientX - rect.left) / rect.width) * 100
  emit('resize', percent)
}

function onMouseUp(): void {
  isDragging.value = false
}

onMounted(() => {
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
})

onUnmounted(() => {
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseup', onMouseUp)
})
</script>

<template>
  <div ref="containerRef" class="split-pane" :class="{ dragging: isDragging }">
    <div class="pane-left" :style="{ width: `${props.leftPercent}%` }">
      <slot name="left" />
    </div>
    <div class="splitter" @mousedown="startDrag">
      <div class="splitter-handle" />
    </div>
    <div class="pane-right" :style="{ width: `${100 - props.leftPercent}%` }">
      <slot name="right" />
    </div>
  </div>
</template>

<style scoped>
.split-pane {
  display: flex;
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

.split-pane.dragging {
  cursor: col-resize;
  user-select: none;
}

.pane-left,
.pane-right {
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.splitter {
  width: 5px;
  cursor: col-resize;
  background: var(--border-subtle);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 10;
  transition: background 0.15s;
}

.splitter:hover,
.split-pane.dragging .splitter {
  background: var(--border);
}

.splitter-handle {
  width: 1px;
  height: 32px;
  background: var(--text-muted);
  border-radius: 1px;
  opacity: 0;
  transition: opacity 0.15s;
}

.splitter:hover .splitter-handle,
.split-pane.dragging .splitter-handle {
  opacity: 0.6;
}
</style>
