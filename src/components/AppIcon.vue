<script setup lang="ts">
defineProps<{
  name: string
  size?: number
}>()
</script>

<template>
  <!-- 打开文件 -->
  <svg
    v-if="name === 'folder-open'"
    :width="size ?? 16"
    :height="size ?? 16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M1.5 3.5A1 1 0 0 1 2.5 2.5H6l1.5 1.5H13.5A1 1 0 0 1 14.5 5v7.5a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1V3.5Z"
      stroke="currentColor"
      stroke-width="1.2"
      stroke-linejoin="round"
    />
  </svg>

  <!-- 保存 -->
  <svg
    v-else-if="name === 'save'"
    :width="size ?? 16"
    :height="size ?? 16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M3 2.5h7.5L13 5v8.5a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1Z"
      stroke="currentColor"
      stroke-width="1.2"
    />
    <path d="M5.5 2.5V6h5V2.5" stroke="currentColor" stroke-width="1.2" />
    <path d="M5 9.5h6" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
  </svg>

  <!-- 格式转换 -->
  <svg
    v-else-if="name === 'swap'"
    :width="size ?? 16"
    :height="size ?? 16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path d="M11 3.5 13.5 6 11 8.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M2.5 6h11" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
    <path d="M5 12.5 2.5 10 5 7.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M13.5 10H2.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
  </svg>

  <!-- 格式化 -->
  <svg
    v-else-if="name === 'format'"
    :width="size ?? 16"
    :height="size ?? 16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path d="M3 4h10M3 8h7M3 12h4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
  </svg>

  <!-- 压缩 -->
  <svg
    v-else-if="name === 'compress'"
    :width="size ?? 16"
    :height="size ?? 16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path d="M5 6.5 3 8.5l2 2M11 6.5l2 2-2 2M3 8.5h10" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
  </svg>

  <!-- 暗色主题 -->
  <svg
    v-else-if="name === 'moon'"
    :width="size ?? 16"
    :height="size ?? 16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M12.5 9.5a5 5 0 0 1-7-7 5.5 5.5 0 1 0 7 7Z"
      stroke="currentColor"
      stroke-width="1.2"
      stroke-linejoin="round"
    />
  </svg>

  <!-- 亮色主题 -->
  <svg
    v-else-if="name === 'sun'"
    :width="size ?? 16"
    :height="size ?? 16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <circle cx="8" cy="8" r="3" stroke="currentColor" stroke-width="1.2" />
    <path d="M8 2v1.5M8 12.5V14M2 8h1.5M12.5 8H14M3.8 3.8l1 1M11.2 11.2l1 1M3.8 12.2l1-1M11.2 4.8l1-1" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
  </svg>

  <!-- 清空 -->
  <svg
    v-else-if="name === 'trash'"
    :width="size ?? 16"
    :height="size ?? 16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path d="M3.5 4.5h9M6 4.5V3.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
    <path d="M5 4.5v8a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-8" stroke="currentColor" stroke-width="1.2" />
    <path d="M6.5 7v4M9.5 7v4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
  </svg>

  <!-- 搜索 -->
  <svg
    v-else-if="name === 'search'"
    :width="size ?? 16"
    :height="size ?? 16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <circle cx="7" cy="7" r="4" stroke="currentColor" stroke-width="1.2" />
    <path d="M10 10l3.5 3.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
  </svg>

  <!-- 关闭 -->
  <svg
    v-else-if="name === 'close'"
    :width="size ?? 16"
    :height="size ?? 16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
  </svg>

  <!-- 复制 -->
  <svg
    v-else-if="name === 'copy'"
    :width="size ?? 16"
    :height="size ?? 16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <rect x="5.5" y="5.5" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.2" />
    <path d="M4.5 10.5H3.5a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1H9.5a1 1 0 0 1 1 1v1" stroke="currentColor" stroke-width="1.2" />
  </svg>

  <!-- 展开箭头 -->
  <svg
    v-else-if="name === 'chevron'"
    :width="size ?? 16"
    :height="size ?? 16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
  </svg>

  <!-- 树形结构 -->
  <svg
    v-else-if="name === 'tree'"
    :width="size ?? 16"
    :height="size ?? 16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path d="M8 2.5v4M8 6.5H4.5v3H8v4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
    <circle cx="8" cy="2.5" r="1.5" fill="currentColor" />
    <circle cx="4.5" cy="9.5" r="1.5" fill="currentColor" />
    <circle cx="8" cy="13.5" r="1.5" fill="currentColor" />
  </svg>

  <!-- 代码 -->
  <svg
    v-else-if="name === 'code'"
    :width="size ?? 16"
    :height="size ?? 16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path d="M5 4.5 2.5 8 5 11.5M11 4.5 13.5 8 11 11.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
</template>
