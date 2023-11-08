<template>
  <div class="three-page">
    <div class="three-header">
      <NButton>test</NButton>
    </div>

    <div class="three-container" ref="threeContainerRef">
      <canvas ref="threeRef">three-canvas</canvas>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { NButton } from 'naive-ui'
//  import three and use it to draw a box
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

import { onMounted, ref } from 'vue'

const threeRef = ref<HTMLCanvasElement>()
const threeContainerRef = ref<HTMLDivElement>()
let scene = new THREE.Scene()
let camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000)
let renderer = new THREE.WebGLRenderer()
let controls: OrbitControls

const drawTestBox = () => {
  //draw a box
  let geometry = new THREE.BoxGeometry(1, 1, 1)
  let material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
  let cube = new THREE.Mesh(geometry, material)
  scene.add(cube)
  cube.position.set(0, 0, 0)
}

const render = async () => {
  const canvas = threeRef.value
  const container = threeContainerRef.value
  if (!canvas || !container) return

  //1.创建场景
  scene = new THREE.Scene()

  //2.创建相机
  camera = new THREE.PerspectiveCamera(
    105,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  )
  //3.设置相机位置
  camera.position.set(0, 0, 4)
  scene.add(camera)

  //设置环境光，要不然模型没有颜色
  let ambientLight = new THREE.AmbientLight() //设置环境光
  scene.add(ambientLight) //将环境光添加到场景中
  let pointLight = new THREE.PointLight()
  pointLight.position.set(200, 200, 200) //设置点光源位置
  scene.add(pointLight) //将点光源添加至场景

  //7.初始化渲染器
  //渲染器透明
  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true, //渲染器透明
    antialias: true, //抗锯齿
    precision: 'highp' //着色器开启高精度
  })

  //开启HiDPI设置
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(container.clientWidth, container.clientHeight)
  //设置渲染器尺寸大小
  renderer.setClearColor(0xf4f8fc, 1)
  renderer.setSize(container.clientWidth, container.clientHeight)
  //将webgl渲染的canvas内容添加到div

  //使用渲染器 通过相机将场景渲染出来
  renderer.render(scene, camera)
  controls = new OrbitControls(camera, canvas)
  controls.update()
}

const animate = () => {
  // cylinderAnimate()
  requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)
}

onMounted(() => {
  render()
  animate()
  drawTestBox()
  // threeTextClick()
  // aperture()
})
</script>
<style scoped>
.three-page {
  width: 100%;
  height: 100vh;
  background-color: rgb(218, 230, 218);
}
.three-container {
  width: 100%;
  height: calc(100% - 40px);
  background-color: rgb(205, 218, 237);
}
.three-header {
  width: 100%;
  height: 40px;
  background-color: rgb(185, 243, 207);
}
.three-canvas {
  width: 100%;
  height: 100%;

  top: 0;
  left: 0;
}
</style>
