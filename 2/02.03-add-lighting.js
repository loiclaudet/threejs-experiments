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

    // set a texture loader
    const loader = new THREE.TextureLoader()

    // earth
    const earthGeometry = new THREE.SphereGeometry(15, 32, 32)
    loader.load(
        '../assets/textures/planets/earthmap4K.jpg',
        (texture) => {
            const earthMaterial = new THREE.MeshPhongMaterial({ map: texture })
            const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial)
            earthMesh.name = 'earth'
            scene.add(earthMesh)
        },
        undefined, // onProgress callback not supported from r84
        (err) => console.error('error when loading earthmap4K.jpg')
    )

    // clouds
    const cloudGeometry = new THREE.SphereGeometry(
        earthGeometry.parameters.radius * 1.01,
        earthGeometry.parameters.widthSegments,
        earthGeometry.parameters.heightSegments,
    )
    loader.load(
        '../assets/textures/planets/fair_clouds_4k.png',
        (texture) => {
            const cloudMaterial = new THREE.MeshBasicMaterial({ map: texture , transparent: true})
            const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial)
            cloudMesh.name = 'clouds'
            scene.add(cloudMesh)
        },
        undefined, // onProgress callback not supported from r84
        (err) => console.error('error when loading fair_clouds_4k.jpg')
    )

    // directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    directionalLight.position.x = 150
    directionalLight.position.y = 10
    directionalLight.position.z = -50
    scene.add(directionalLight)

    //ambiant light
    const ambiantLight = new THREE.AmbientLight(0x111111)
    scene.add(ambiantLight)

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

