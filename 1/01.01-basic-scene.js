const THREE = require('three')

let scene, camera, renderer, mesh
let width = window.innerWidth, height = window.innerHeight;

function init () {
    scene = new THREE.Scene()

    camera = new THREE.PerspectiveCamera(50, width / height, .1, 1000)
    camera.position.z = 40

    renderer = new THREE.WebGLRenderer()
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height)
    renderer.setClearColor(0x000000)

    const geometry = new THREE.TorusGeometry(8, 2, 3, 3)
    geometry.rotateZ(Math.PI/6)

    const material = new THREE.MeshStandardMaterial({ color: 0x2194ce })
    material.roughness = .5
    material.metalness = .5

    mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    const ambiantLight = new THREE.AmbientLight(0xffffff, .5)
    scene.add(ambiantLight)

    const spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(10, 20, 40);
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;
    spotLight.shadow.camera.near = 20;
    spotLight.shadow.camera.far = 50;
    spotLight.shadow.camera.fov = 30;
    scene.add(spotLight);


    renderer.domElement.style.display = 'block'
    document.body.style.margin = '0'
    document.body.appendChild(renderer.domElement)
    render()
}

function render () {
    mesh.rotation.y += .005
    requestAnimationFrame(render)
    renderer.render(scene, camera)
}

function handleResize() {
    width = window.innerWidth;
    height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}


window.onload = init

window.addEventListener('resize', handleResize, false);
