<script setup lang="ts"></script>

<template>
  <router-view />
</template>

<style>
/* This must be GLOBAL (not scoped) */
* {
  box-sizing: border-box; /* Makes sure padding doesn't increase element size */
}

html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow-x: hidden; /* Fixes horizontal scroll */
}
</style>
