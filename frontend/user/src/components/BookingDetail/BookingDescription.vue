<template>
    <link
    href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap"
    rel="stylesheet"
  />
  <section class="description-section">
    <h2 class="headline">
      {{ descriptionData.title }}
    </h2>

    <div class="body-text">
      <p v-for="(paragraph, index) in descriptionData.paragraphs" :key="index">
        {{ paragraph }}
      </p>

      <p class="highlight" v-if="descriptionData.highlight">
        {{ descriptionData.highlight }}
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
// Defining Props makes it easy to replace mock data with Backend data later
interface DescriptionData {
  title: string;
  paragraphs: string[];
  highlight: string;
}

defineProps<{
  descriptionData: DescriptionData
}>();
</script>

<style scoped>
.description-section {
  font-family: 'Lato', sans-serif;
  margin-top: 30px;
  max-width: 100%;
}

.headline {
  font-size: 36px;
  font-weight: 800;
  line-height: 1.3;
  margin-bottom: 20px;
  color: #1a1a1a;
}

.body-text p {
  font-size: 32px;
  line-height: 1.7;
  color: #4a4a4a;
  margin-bottom: 15px;
  text-align: justify;
}

.highlight {
  font-weight: 700px;
  color: #4a4a4a;
  /* color: #1a1a1a !important; */
}
</style>
