const THREE = require('three')
const OrbitControls = require('three-orbit-controls')(THREE)
const dat = require('dat.gui')
const Stats = require('stats.js')

let scene, camera, renderer, stats
let width = window.innerWidth, height = window.innerHeight

function init () {
    // scene
    scene = new THREE.Scene()

    //camera
    camera = new THREE.PerspectiveCamera(50, width / height, .1, 1000)
    camera.position.x = 35
    camera.position.y = 36
    camera.position.z = 33
    camera.lookAt(scene.position)

    // orbit controls
    const controls = new OrbitControls(camera)

    // earth
    const sphereGeometry = new THREE.SphereGeometry(15, 32, 32)
    const sphereMaterial = new THREE.MeshNormalMaterial()
    const earthMesh = new THREE.Mesh(sphereGeometry, sphereMaterial)
    earthMesh.name = 'earth'
    scene.add(earthMesh)


    // stats
    stats = new Stats()
    document.body.appendChild(stats.dom)

    // renderer
    renderer = new THREE.WebGLRenderer()
    renderer.setSize(width, height)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setClearColor(0x000000)
    renderer.domElement.style.display = 'block'
    document.body.style.margin = '0'
    document.body.appendChild(renderer.domElement)

    render()
}

function render () {
    stats.begin()

    renderer.render(scene, camera)

    requestAnimationFrame(render)

    stats.end()
}

function handleResize () {
    width = window.innerWidth
    height = window.innerHeight
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height)
}

window.onload = init
window.addEventListener('resize', handleResize)

