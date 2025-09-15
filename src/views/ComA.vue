<template>
  <div>A</div>
</template>

<script lang="ts" setup>
import axios from 'axios'
import { onBeforeMount, onMounted } from 'vue'

const init = async () => {
  await axios.get('https://jsonplaceholder.typicode.com/posts/1')
}

onMounted(async () => {
  console.log('A mounted')
  // console.log('A before', new Date())
  await init()
  // console.log('A after', new Date())
})

onBeforeMount(() => {
  console.log('A before mount')
})
</script>
