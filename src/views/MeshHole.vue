<template>
  <div class="three-page">
    <div class="three-header">
      <NButton @click="handleWata">test</NButton>
      <NButton @click="showModal = true">添加一个洞</NButton>
      <NModal v-model:show="showModal">
        <NCard
          style="width: 600px"
          title="添加一个吧"
          :bordered="false"
          size="huge"
          role="dialog"
          aria-modal="true"
        >
          <template #header-extra> 噢！ </template>
          <div class="input-container">
            <div>开始点</div>
            <NInputNumber v-model:value="input.s_x" :show-button="false" style="width: 100px">
              <template #prefix> x </template>
            </NInputNumber>
            <NInputNumber v-model:value="input.s_y" :show-button="false" style="width: 100px">
              <template #prefix> y </template>
            </NInputNumber>
            <NInputNumber v-model:value="input.s_z" :show-button="false" style="width: 100px">
              <template #prefix> z </template>
            </NInputNumber>
          </div>
          <div class="input-container">
            <div>结束点</div>
            <NInputNumber v-model:value="input.e_x" :show-button="false" style="width: 100px">
              <template #prefix> x </template>
            </NInputNumber>
            <NInputNumber v-model:value="input.e_y" :show-button="false" style="width: 100px">
              <template #prefix> y </template>
            </NInputNumber>
            <NInputNumber v-model:value="input.e_z" :show-button="false" style="width: 100px">
              <template #prefix> z </template>
            </NInputNumber>
          </div>
          <template #footer>
            <NButton @click="handleWata">挖他！</NButton>
          </template>
        </NCard>
      </NModal>
    </div>

    <div class="three-container" ref="threeContainerRef">
      <canvas ref="threeRef"> </canvas>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { NButton, NModal, NCard, NInputNumber } from 'naive-ui'
//  import three and use it to draw a box
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Stats from 'three/examples/jsm/libs/stats.module.js'
import { acceleratedRaycast, computeBoundsTree, disposeBoundsTree } from 'three-mesh-bvh'
import { CSG } from 'three-csg-ts'

import { onMounted, reactive, ref } from 'vue'

const showModal = ref(false)

const input = reactive({
  s_x: 0,
  s_y: 0,
  s_z: 0,
  e_x: 0,
  e_y: 0,
  e_z: 0
})
//创建stats对象
const stats = new Stats()
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

const handleWata = () => {
  console.log(input)
  // const shape = new THREE.Shape()

  // // // Shape内孔轮廓
  // const path1 = new THREE.Path() // 圆孔1
  // //画一个半径为15的圆
  // path1.absarc(0, 20, 5, 0, Math.PI * 2, false)

  // shape.holes.push(
  //   path1
  //   // path2,
  //   // path3
  // )
  // const geometry = new THREE.ExtrudeGeometry(shape, {
  //   depth: 40, //拉伸长度
  //   bevelEnabled: false, //禁止倒角
  //   curveSegments: 50
  // })
  // const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })

  // const mesh = new THREE.Mesh(geometry, material)
  // mesh.position.z = -20
  // scene.add(mesh)

  // Create a shape with a hole
  const shape1 = new THREE.Shape()
  shape1.moveTo(0, 0)
  shape1.lineTo(4, 0)
  shape1.lineTo(4, 4)
  shape1.lineTo(0, 4)
  shape1.lineTo(0, 0)

  const hole = new THREE.Path()
  hole.moveTo(1, 1)
  hole.lineTo(3, 1)
  hole.lineTo(3, 3)
  hole.lineTo(1, 3)
  hole.lineTo(1, 1)
  shape1.holes.push(hole)

  const extrudeSettings = { depth: 2, bevelEnabled: false }
  const shapeGeometry = new THREE.ExtrudeGeometry(shape1, extrudeSettings)
  const shapeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
  const shapeMesh = new THREE.Mesh(shapeGeometry, shapeMaterial)

  // Create a cube
  const cubeGeometry = new THREE.BoxGeometry(4, 4, 4)
  const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true })
  const cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial)

  // Position the shape so it intersects with the cube
  shapeMesh.position.set(-2, -2, -1)

  // Add the shape and cube to the scene
  scene.add(cubeMesh)
  scene.add(shapeMesh)
}
const drawTestBox = () => {
  const boxList = [
    {
      index: 1,
      color: 'red'
    },
    {
      index: 2,
      color: 'yellow'
    },
    {
      index: 3,
      color: 'blue'
    },
    {
      index: 4,
      color: 'pink'
    }
  ]

  const meshGroup = new THREE.Group()
  //根据boxList 渲染四个摞在一起的正方体，且有黑色边框
  boxList.forEach((item) => {
    const geometry = new THREE.BoxGeometry(20, 20, 20)
    const edges = new THREE.EdgesGeometry(geometry)
    const material = new THREE.MeshBasicMaterial({
      color: item.color,
      side: THREE.DoubleSide

      // wireframe: true //是否显示线框
    })
    const cube = new THREE.Mesh(geometry, material)
    cube.position.y = item.index * 20
    const lineCube = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x000000 }))
    lineCube.position.y = item.index * 20

    meshGroup.add(cube, lineCube)
  })

  // scene.add(meshGroup)
}

const drawThreeCsgTs = () => {
  // 创建一个盒子
  const boxGeometry = new THREE.BoxGeometry(2, 2, 2)
  const boxMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 })
  const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial)

  // 创建一个圆柱
  const cylinderGeometry = new THREE.CylinderGeometry(0.5, 0.1, 10, 32)
  const cylinderMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 })
  const cylinderMesh = new THREE.Mesh(cylinderGeometry, cylinderMaterial)
  // cylinderMesh.rotation.z = Math.PI / 2
  cylinderMesh.position.x = -0.5 // 调整位置使其在左半边
  // 更新圆柱的变换矩阵
  cylinderMesh.updateMatrix()
  // 执行 CSG 操作
  const boxCSG = CSG.fromMesh(boxMesh)
  const cylinderCSG = CSG.fromMesh(cylinderMesh)

  const subtractedCSG = boxCSG.union(cylinderCSG)
  // 转换回 Three.js 网格
  const resultMesh = CSG.toMesh(subtractedCSG, boxMesh.matrix)
  resultMesh.material = boxMaterial // 应用相同的材质

  // scene.add(cylinderMesh)
  scene.add(resultMesh)
  // 添加光源
  const light = new THREE.DirectionalLight(0xffffff, 1)
  light.position.set(5, 5, 5).normalize()
  scene.add(light)

  camera.position.z = 5
}
const setThreeTools = () => {
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
  camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 1000)
  //3.设置相机位置
  camera.position.set(0, 100, 100)
  scene.add(camera)

  //设置环境光，要不然模型没有颜色
  let ambientLight = new THREE.AmbientLight() //设置环境光
  scene.add(ambientLight) //将环境光添加到场景中
  let pointLight = new THREE.PointLight()
  pointLight.position.set(200, 200, 200) //设置点光源位置
  scene.add(pointLight) //将点光源添加至场景
  container.appendChild(stats.dom)
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
  stats.update()
  controls.update()

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
  // drawTestBox()
  drawThreeCsgTs()
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
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
.three-canvas {
  width: 100%;
  height: 100%;

  top: 0;
  left: 0;
}

.input-container {
  display: flex;
  align-items: center;
}
</style>
