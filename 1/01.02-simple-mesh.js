const THREE = require('three')
let scene, camera, renderer
const width = window.innerWidth, height = window.innerHeight

function init () {
    scene = new THREE.Scene()

    camera = new THREE.PerspectiveCamera(50, width / height, .1, 1000)
    // position and point the camera to the center of the scene
    camera.position.x = 15;
    camera.position.y = 16;
    camera.position.z = 13;
    camera.lookAt(scene.position)

    // initialize renderer size, color, and allow shadow map
    renderer = new THREE.WebGLRenderer()
    renderer.setSize(width, height)
    renderer.setClearColor(0x000000)
    renderer.shadowMap.enabled = true

    // create and add cube
    const cubeGeometry = new THREE.BoxBufferGeometry(6, 4, 6)
    const cubeMaterial = new THREE.MeshLambertMaterial({ color: 'red' })
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial)
    cube.castShadow = true
    scene.add(cube)

    // create and add ground plan
    const planeGeometry = new THREE.PlaneBufferGeometry(20, 20)
    const planeMaterial = new THREE.MeshLambertMaterial({ color: 0xcccccc })
    const plane = new THREE.Mesh(planeGeometry, planeMaterial)
    plane.receiveShadow = true
    plane.rotateX(Math.PI * -.5)
    plane.position.y = -2
    scene.add(plane)

    // create and add spot light
    const spotLight = new THREE.SpotLight(0xffffff, 1)
    spotLight.position.set(10, 20, 20)
    spotLight.castShadow = true
    spotLight.shadow.mapSize.width = 1024
    spotLight.shadow.mapSize.height = 1024
    spotLight.shadow.camera.near = 20
    spotLight.shadow.camera.far = 50
    scene.add(spotLight)

    document.body.appendChild(renderer.domElement)
    renderer.domElement.style.display = 'block'
    document.body.style.margin = '0'
    render()
}

function render () {
    requestAnimationFrame(render)
    renderer.render(scene, camera)
}

function handleResize () {
    width = window.innerHeight
    height = window.innerWidth
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height)

}

window.onload = init
window.addEventListener('resize', handleResize)
