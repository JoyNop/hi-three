<template>
  <div>
    <ComA />
    <ComB />
  </div>
</template>

<script setup lang="ts">
import { onBeforeMount, onMounted } from 'vue'
import ComA from './ComA.vue'
import ComB from './ComB.vue'

onMounted(async () => {
  console.log('home mounted')
})

onBeforeMount(() => {
  console.log('home before mount')
})
</script>
