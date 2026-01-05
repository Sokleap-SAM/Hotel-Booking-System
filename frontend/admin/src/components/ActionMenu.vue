<template>
  <div>
    <div class="menu-backdrop" @click.stop="$emit('close')"></div>

    <div class="menu-box">
      <button v-for="option in options" :key="option.label" class="menu-item"
        @click.stop="$emit('action', option.value)">
        {{ option.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  options: Array<{ label: string; value: string }>;
}>();

defineEmits(['close', 'action']);
</script>

<style scoped>
.menu-backdrop {
  position: fixed;
  inset: 0;
  z-index: 99;
  background: transparent;
}

.menu-box {
  position: absolute;
  top: 15px;
  right: 60px;
  width: 150px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px #00000059;
  z-index: 100;
  padding: 5px;
}

.menu-item {
  display: block;
  width: 100%;
  padding: 10px;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
}

.menu-item:hover {
  background: #f0f0f0;
}
</style>