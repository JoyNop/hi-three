<template>
  <div class="three-page">
    <!-- 顶部功能按钮 -->
    <div class="three-header">
      <NButton @click="handleMove">移动</NButton>
      <NButton @click="handleAddCircle">添加圆形</NButton>
      <NButton @click="handleAddBox">方形</NButton>
      <NButton @click="showCuboidModal = true">添加长立方体</NButton>
      <NButton @click="clearObjects" type="error">清空</NButton>
    </div>

    <!-- Three.js 渲染容器 -->
    <div class="three-container" ref="threeContainerRef">
      <canvas ref="threeRef"></canvas>
    </div>

    <!-- 添加长立方体的弹窗 -->
    <NModal v-model:show="showCuboidModal" preset="dialog" title="添加长立方体">
      <div style="margin-bottom: 16px">
        <span>长立方体长度：</span>
        <NInputNumber v-model:value="cuboidLength" :min="0.1" :max="50" />
      </div>
      <template #action>
        <NButton @click="handleAddCuboid">确定</NButton>
      </template>
    </NModal>
  </div>
</template>

<script lang="ts" setup>
import { NButton, NModal, NInputNumber } from 'naive-ui'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { onMounted, onUnmounted, ref } from 'vue'

// ------------------- 基础变量 -------------------
const threeRef = ref<HTMLCanvasElement>() // canvas 引用
const threeContainerRef = ref<HTMLDivElement>() // 容器引用

let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let controls: OrbitControls

// 保存几何体
const objects: THREE.Mesh[] = []

// ------------------- 弹窗控制 -------------------
const showCuboidModal = ref(false) // 控制弹窗显示
const cuboidLength = ref(5) // 默认立方体长度

// ------------------- 初始化辅助工具 -------------------
const setThreeTools = () => {
  const axesHelper = new THREE.AxesHelper(5)
  scene.add(axesHelper)

  const gridHelper = new THREE.GridHelper(10, 10)
  scene.add(gridHelper)
}

// 设置 OrbitControls 控制器参数
const setControls = () => {
  controls.target = new THREE.Vector3(0, 0, 0)
  controls.enableDamping = true
  controls.dampingFactor = 0.04
  controls.enableRotate = true
  controls.enableZoom = true
  controls.minDistance = 1
  controls.maxDistance = 100
  controls.enablePan = true
}

// ------------------- 渲染与循环 -------------------
const render = async () => {
  const canvas = threeRef.value
  const container = threeContainerRef.value
  if (!canvas || !container) return

  // 1. 创建场景
  scene = new THREE.Scene()

  // 2. 创建相机
  camera = new THREE.PerspectiveCamera(
    50,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  )
  camera.position.set(0, 2, 6)
  scene.add(camera)

  // 3. 光源
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
  scene.add(ambientLight)
  const pointLight = new THREE.PointLight(0xffffff, 0.8)
  pointLight.position.set(10, 10, 10)
  scene.add(pointLight)

  // 4. 渲染器
  renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    precision: 'highp'
  })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.setClearColor(0xf4f8fc, 1)

  // 5. 控制器
  controls = new OrbitControls(camera, canvas)
  setControls()
}

// 动画循环
const animate = () => {
  requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)
}

// ------------------- 页面自适应 -------------------
const onWindowResize = () => {
  if (threeContainerRef.value) {
    const width = threeContainerRef.value.clientWidth
    const height = threeContainerRef.value.clientHeight
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height)
  }
}
window.addEventListener('resize', onWindowResize, false)

// ------------------- 按钮功能 -------------------
// 移动模式（OrbitControls）
const handleMove = () => {
  controls.enabled = true
}

// 添加圆形
const handleAddCircle = () => {
  const geometry = new THREE.CircleGeometry(1, 32)
  const material = new THREE.MeshStandardMaterial({ color: 0x00aaff })
  const circle = new THREE.Mesh(geometry, material)

  circle.position.set((Math.random() - 0.5) * 4, 0, (Math.random() - 0.5) * 4)
  scene.add(circle)
  objects.push(circle)
}

// 添加方形
const handleAddBox = () => {
  const geometry = new THREE.BoxGeometry(1, 1, 1)
  const material = new THREE.MeshStandardMaterial({ color: 0xff5533 })
  const box = new THREE.Mesh(geometry, material)

  box.position.set((Math.random() - 0.5) * 4, 0.5, (Math.random() - 0.5) * 4)
  scene.add(box)
  objects.push(box)
}

// 添加长立方体
const handleAddCuboid = () => {
  const length = cuboidLength.value
  const width = 1
  const height = 1

  const geometry = new THREE.BoxGeometry(length, height, width)
  const material = new THREE.MeshStandardMaterial({ color: 0x44aa88 })
  const cuboid = new THREE.Mesh(geometry, material)

  // 躺在地面上 (沿 X 轴放置即可，不需要额外旋转)
  cuboid.position.set((Math.random() - 0.5) * 4, 0.5, (Math.random() - 0.5) * 4)

  scene.add(cuboid)
  objects.push(cuboid)

  // 关闭弹窗
  showCuboidModal.value = false
}

// 清空所有对象并回收内存
const clearObjects = () => {
  objects.forEach((obj) => {
    scene.remove(obj)
    // 回收资源
    if (obj.geometry) obj.geometry.dispose()
    if (Array.isArray(obj.material)) {
      obj.material.forEach((m) => m.dispose && m.dispose())
    } else {
      obj.material.dispose && obj.material.dispose()
    }
  })
  objects.length = 0
}

// ------------------- 生命周期 -------------------
onMounted(() => {
  render()
  animate()
  setThreeTools()
})

// 组件卸载时清理资源
onUnmounted(() => {
  window.removeEventListener('resize', onWindowResize)

  clearObjects()

  renderer.dispose()
  controls.dispose()
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
  height: 90vh;
  background-color: rgb(205, 218, 237);
}
.three-header {
  width: 100%;
  height: 40px;
  display: flex;
  gap: 10px;
  align-items: center;
  padding-left: 10px;
  background-color: rgb(185, 243, 207);
}
</style>
