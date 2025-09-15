<template>
  <div class="three-page">
    <div class="three-header">
      <NButton>test</NButton>
    </div>

    <div class="three-container" ref="threeContainerRef" style="z-index: 9999">
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
//import dat.gui
import GUI from 'three/examples/jsm/libs/lil-gui.module.min.js'

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

const gui = new GUI()

const clock = new THREE.Clock()

// 定义一个函数来绘制网格
const drawMesh = () => {
  //生成数据，随机100个数据
  const numPoints = 100
  const points = []
  for (let i = 0; i < numPoints; i++) {
    // 生成随机坐标
    const x = (Math.random() - 0.5) * 10
    const y = (Math.random() - 0.5) * 10
    const z = (Math.random() - 0.5) * 10
    points.push(new THREE.Vector3(x, y, z))
  }
  // 创建一个新的BufferGeometry对象来存储网格的顶点数据
  const geometry = new THREE.BufferGeometry()

  // 用于存储索引数据的数组，用于定义网格的三角形
  const indices = []

  // 用于存储顶点坐标、法线方向和颜色信息的数组
  const vertices = []
  const normals = []
  const colors = []

  // 定义网格的总大小和分割段数
  const size = 20
  const segments = 10

  // 计算网格的一半大小（用于中心对齐）和每个段的大小
  const halfSize = size / 2
  const segmentSize = size / segments

  // 创建一个新的Color对象，用于设置颜色
  const _color = new THREE.Color()

  // 生成网格的顶点、法线和颜色数据
  for (let i = 0; i <= segments; i++) {
    // 遍历网格的垂直段
    const y = i * segmentSize - halfSize // 计算y坐标

    for (let j = 0; j <= segments; j++) {
      // 遍历网格的水平段
      const x = j * segmentSize - halfSize // 计算x坐标

      // 将顶点坐标添加到vertices数组中
      vertices.push(x, -y, 0) // 注意：y取负值是为了使网格在y轴方向上是向上的

      // 网格的法线方向设置为面向z轴正方向
      normals.push(0, 0, 1)

      // 根据x和y坐标计算颜色值
      const r = x / size + 0.5
      const g = y / size + 0.5

      // 设置颜色，并转换为sRGB颜色空间
      _color.setRGB(r, g, 1, THREE.SRGBColorSpace)

      // 将颜色的r、g、b分量添加到colors数组中
      colors.push(_color.r, _color.g, _color.b)
    }
  }

  // 生成索引数据，用于定义网格的三角形面
  for (let i = 0; i < segments; i++) {
    // 遍历垂直段的内部边界（不包括最后一个）
    for (let j = 0; j < segments; j++) {
      // 遍历水平段的内部边界（不包括最后一个）
      // 计算当前网格块的四个顶点的索引
      const a = i * (segments + 1) + (j + 1)
      const b = i * (segments + 1) + j
      const c = (i + 1) * (segments + 1) + j
      const d = (i + 1) * (segments + 1) + (j + 1)

      // 为每个网格块生成两个三角形面
      indices.push(a, b, d) // 第一个面
      indices.push(b, c, d) // 第二个面
    }
  }

  // 在控制台输出顶点、法线和颜色数组（用于调试）
  console.log(vertices, normals, colors)

  // 将索引数据设置为BufferGeometry的索引
  geometry.setIndex(new THREE.Uint16BufferAttribute(indices, 1)) // 注意：通常使用Uint16BufferAttribute

  // 将顶点坐标、法线、颜色设置为BufferGeometry的属性
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))

  // 创建一个新的Phong材质，启用双面渲染和顶点颜色
  const material = new THREE.MeshPhongMaterial({
    side: THREE.DoubleSide, // 双面渲染
    vertexColors: true // 使用顶点颜色
  })

  // 创建一个新的网格对象，并将其添加到场景中
  const mesh = new THREE.Mesh(geometry, material)
  scene.add(mesh)
  gui.add(material, 'wireframe')
}

const drawTunnel = () => {
  //画一个隧道模型，隧道长度为100m,隧道的形状是个半椭圆，大半径为10m，小半径为5m
  //隧道方向水平朝向屏幕
  const tunnelLength = 100
  const tunnelWidth = 10
  const tunnelHeight = 5
  const curve = new THREE.EllipseCurve(
    0,
    0, // ax, aY
    20,
    10, // xRadius, yRadius
    0,
    2 * Math.PI, // aStartAngle, aEndAngle
    false, // aClockwise
    0 // aRotation
  )

  let points = [
    [10, 89, 0],
    [50, 88, 10],
    [76, 139, 20],
    [126, 141, 12],
    [150, 112, 8],
    [157, 73, 0],
    [180, 44, 5],
    [207, 35, 10],
    [232, 36, 0]
  ]
  points = [
    [0, 0, 0],
    [0, 500, 0]
  ]
  const pathVertices = []
  //points转化为 vertices
  for (var i = 0; i < points.length; i++) {
    var x = points[i][0]
    var y = points[i][2]
    var z = points[i][1]
    //这里做了一个特殊处理，并没有按照threejs三维坐标来做，而是采用xyz的坐标系来做
    //这里x轴代表x轴，y轴代表z轴，z轴代表y轴
    pathVertices[i] = new THREE.Vector3(x, y, z)
  }
  //根据路径点创建自定义曲线
  const path = new THREE.CatmullRomCurve3(pathVertices)
  const pointsX = curve.getPoints(50)
  //创建TubeGeometry
  var geometry = new THREE.TubeGeometry(path, 300, 100, 4, false)

  const material = new THREE.LineBasicMaterial({ color: 0xff0000 })

  // Create the final object to add to the scene
  const ellipse = new THREE.Line(geometry, material)
  // scene.add(ellipse)

  const shape = new THREE.Shape()

  // 近似上半部分椭圆的顶部
  shape.moveTo(0, 0)
  shape.lineTo(1, 1)
  shape.lineTo(2, 0.5)
  shape.lineTo(0, 0)

  // 使用ExtrudeGeometry需要将Shape转换为Geometry
  const extrudeSettings = {
    steps: 1, // 因为我们是模拟管道截面，只需要一步拉伸
    depth: 1, // 拉伸深度，这里是占位值，实际应用中可能不需要
    bevelEnabled: false // 不需要倒角
  }
  const geometrycc = new THREE.ExtrudeGeometry(shape, extrudeSettings)
  const mesh33 = new THREE.Mesh(geometrycc, new THREE.MeshPhongMaterial())
  // scene.add(mesh33)asdf
}
const setThreeTools = () => {
  //add stats
  statsRef.value?.replaceChildren(stats.dom)

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

  // const obj = {
  //   x: 30
  // }

  // gui.add(obj, 'x', 0, 100)
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
  let ambientLight = new THREE.AmbientLight(0xffffff) //设置环境光
  scene.add(ambientLight) //将环境光添加到场景中
  // let pointLight = new THREE.PointLight(0xff0000)
  // pointLight.intensity = 9000
  // pointLight.decay = 0.0
  // pointLight.position.set(120, 120, 120) //设置点光源位置
  // scene.add(pointLight) //将点光源添加至场景
  // const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  // directionalLight.position.set(100, 900, 300)
  // scene.add(directionalLight)

  // const ambient = new THREE.AmbientLight(0xffffff, 0.4)
  // scene.add(ambient)

  // gui.add(directionalLight, 'intensity', 0, 10)
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

  //添加stats
  document.body.appendChild(stats.dom)
  console.log(window.devicePixelRatio)

  //开启HiDPI设置
  renderer.setPixelRatio(window.devicePixelRatio)
  // renderer.setSize(container.scrollWidth, container.scrollHeight)
  //设置渲染器尺寸大小
  renderer.setClearColor(0xcddaed, 1)
  // renderer.setClearColor(0x000000, 1)
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
  // drawTestBox()

  drawTunnel()
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
