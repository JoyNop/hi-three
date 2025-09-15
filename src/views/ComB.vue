<template>
  <div>B</div>
</template>

<script lang="ts" setup>
import axios from 'axios'
import { onBeforeMount, onMounted } from 'vue'

const init = async () => {
  await axios.get('https://jsonplaceholder.typicode.com/posts/2')
}

onMounted(async () => {
  console.log('B mounted')
  await init()
})

onBeforeMount(() => {
  console.log('B before mount')
})
</script>
