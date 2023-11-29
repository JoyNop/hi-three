<template>
  <div class="three-page">
    <div class="three-header">
      <NButton>test</NButton>
    </div>

    <div class="three-container" ref="threeContainerRef">
      <div ref="statsRef">statsRef</div>
      <canvas ref="threeRef"> </canvas>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { NButton } from 'naive-ui'
//  import three and use it to draw a box
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Stats from 'three/examples/jsm/libs/stats.module.js'

import { onMounted, ref } from 'vue'

const statsRef = ref<HTMLDivElement>()
const threeRef = ref<HTMLCanvasElement>()
const threeContainerRef = ref<HTMLDivElement>()
let scene = new THREE.Scene()
let camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000)
let renderer = new THREE.WebGLRenderer({
  alpha: true, //渲染器透明
  antialias: true, //抗锯齿
  precision: 'highp' //着色器开启高精度
})
let controls = new OrbitControls(camera, renderer.domElement)
const stats = new Stats()

const clock = new THREE.Clock()

const drawTestBox = () => {
  //draw a box
  let geometry = new THREE.BoxGeometry(100, 100, 100)
  let material = new THREE.MeshLambertMaterial({ color: 0xffffff })
  let cube = new THREE.Mesh(geometry, material)
  scene.add(cube)
  // cube.position.set(0, 0, 0)
}
const setThreeTools = () => {
  //add stats
  statsRef.value?.appendChild(stats.dom)

  //添加坐标轴
  const axesHelper = new THREE.AxesHelper(1000)
  scene.add(axesHelper)
  // 添加网格
  const gridHelper = new THREE.GridHelper(1000, 100)
  // scene.add(gridHelper)
  // 添加相机辅助线

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  const helper = new THREE.CameraHelper(camera)
  // scene.add(helper)
  // 极坐标格辅助对象
  const polarGridHelper = new THREE.PolarGridHelper(100, 10, 8, 64, 0x0000ff, 0x808080)
  // scene.add(polarGridHelper)
}

const setControls = () => {
  controls.target = new THREE.Vector3(0, 0, 0)
  // 使动画循环使用时阻尼或自转 意思是否有惯性
  controls.enableDamping = true
  // 动态阻尼系数 就是鼠标拖拽旋转灵敏度
  controls.dampingFactor = 0.04
  // 是否可以旋转
  controls.enableRotate = true
  // 是否可以缩放与速度
  controls.enableZoom = true
  // 设置相机距离原点的最远距离
  controls.minDistance = 1
  // 设置相机距离原点的最远距离
  controls.maxDistance = 2000
  // 是否开启右键拖拽
  controls.enablePan = true
  // 鼠标滚轮缩放
  controls.enableZoom = true
  // 鼠标滚轮缩放速度
  controls.zoomSpeed = 1.2
  // controls.update()
  // 设置相机自动旋转
  // controls.autoRotate = true
}

const render = async () => {
  const canvas = threeRef.value
  const container = threeContainerRef.value
  if (!canvas || !container) return

  //1.创建场景
  scene = new THREE.Scene()

  console.log('clientWidth', canvas.clientWidth)
  console.log('clientHeight', canvas.clientHeight)
  console.log('w/h', canvas.clientWidth / canvas.clientHeight)
  //2.创建相机
  camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 8000)
  //3.设置相机位置
  camera.position.set(200, 200, 200)
  scene.add(camera)

  //设置环境光，要不然模型没有颜色
  let ambientLight = new THREE.AmbientLight(0xffffff, 10000) //设置环境光
  scene.add(ambientLight) //将环境光添加到场景中
  let pointLight = new THREE.PointLight(0xff0000, 2)
  pointLight.intensity = 9000
  pointLight.decay = 0.0
  pointLight.position.set(120, 120, 120) //设置点光源位置
  // scene.add(pointLight) //将点光源添加至场景

  //可视化点光源
  // const pHelper = new THREE.PointLightHelper(pointLight, 10)
  // scene.add(pHelper)

  //添加一个平行光
  // const directionalLight = new THREE.DirectionalLight(0xffff00, 0.1)
  // directionalLight.position.set(150, -100, 150)
  // directionalLight.position.set(150, 10, 150)
  // directionalLight.target.position.set(150, -120, 500)

  // const endMesh = new THREE.Mesh(
  //   new THREE.SphereGeometry(1, 1, 1),
  //   new THREE.MeshLambertMaterial({ color: 0xff0000 })
  // )
  // endMesh.position.set(150, 0, 150)
  // directionalLight.target = endMesh
  // scene.add(directionalLight)
  //可视化平行光
  // const dHelper = new THREE.DirectionalLightHelper(directionalLight, 10)
  // scene.add(dHelper)

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
  // renderer.setSize(container.scrollWidth, container.scrollHeight)
  //设置渲染器尺寸大小
  // renderer.setClearColor(0xf4f8fc, 1)
  renderer.setClearColor(0x000000, 1)
  renderer.setSize(container.clientWidth, container.clientHeight)
  //将webgl渲染的canvas内容添加到div

  //使用渲染器 通过相机将场景渲染出来
  renderer.render(scene, camera)
  controls = new OrbitControls(camera, canvas)
  controls.update()
}

const meshRotate = () => {
  //旋转
  camera.rotation.x += 0.01
  camera.rotation.y += 0.01
  camera.rotation.z += 0.01

  // const spt = clock.getDelta() * 1000
  // console.log('spt', spt)
  //渲染帧率
  // console.log('fps', 1000 / spt)
}

const animate = () => {
  // cylinderAnimate()
  // meshRotate()
  requestAnimationFrame(animate)
  controls.update()
  stats.update()
  renderer.clear() // 清除画布
  renderer.render(scene, camera)
}

// 设置页面自适应
const onWindowResize = () => {
  console.log('onWindowResize')

  if (threeContainerRef.value) {
    const width = threeContainerRef.value.clientWidth
    const height = threeContainerRef.value.clientHeight
    // const height = width * 0.6

    console.log('width', width, 'height', height)

    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height)
  }
}
window.addEventListener('resize', onWindowResize, false)

onMounted(() => {
  render()
  animate()

  setThreeTools()
  setControls()
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
  height: 90vh;
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
