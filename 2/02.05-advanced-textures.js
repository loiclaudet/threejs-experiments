const THREE = require('three')
const OrbitControls = require('three-orbit-controls')(THREE)
const dat = require('dat.gui')
const Stats = require('stats.js')

let scene, sceneBG, camera, cameraBG, composer, renderer, stats
let width = window.innerWidth, height = window.innerHeight

function init () {
    // scene background
    const sceneBG = new THREE.Scene()

    // scene
    const scene = new THREE.Scene()

    // camera background
    cameraBG = new THREE.OrthographicCamera( -width, width, height, -height, -10000, 10000 );
    cameraBG.position.z = 50

    //camera
    camera = new THREE.PerspectiveCamera(50, width / height, .1, 1000)
    camera.position.x = 35
    camera.position.y = 20
    camera.position.z = 33
    camera.lookAt(scene.position)

    // renderer
    renderer = new THREE.WebGLRenderer()
    renderer.setSize(width, height)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setClearColor(0x000000)
    renderer.domElement.style.display = 'block'

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
            loader.load(
                '../assets/textures/planets/earth_normalmap_flat4k.jpg',
                (normalMap) => {
                    earthMaterial.normalMap = normalMap
                    earthMaterial.normalScale = new THREE.Vector2(.5, .7)
                    loader.load(
                        '../assets/textures/planets/earthspec4k.jpg',
                        (specularMap) => {
                            earthMaterial.specularMap = specularMap
                            earthMaterial.specular = new THREE.Color(0x262626)
                            const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial)
                            earthMesh.name = 'earth'
                            scene.add(earthMesh)
                        },
                        undefined,
                        (err) => console.error('error when loading earthspec4k.jpg')
                    )
                },
                undefined,
                (err) => console.error('error when loading earth_normalmap_flat4k.jpg')
            )
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

    // background place
    const bgPlaneGeometry = new THREE.PlaneGeometry(1, 1)
    loader.load(
        '../assets/textures/planets/starry_background.jpg',
        (texture) => {
            const bgPlaneMaterial = new THREE.MeshBasicMaterial({ map: texture })
            const bgPlaneMesh = new THREE.Mesh(bgPlaneGeometry, bgPlaneMaterial)
            // We moved it to the back of our planet and then scaled it to fill the complete screen
            bgPlaneMesh.position.z = -100
            bgPlaneMesh.scale.x = width * 2
            bgPlaneMesh.scale.y = width * 2
            sceneBG.add(bgPlaneMesh)

        },
        undefined, // onProgress callback not supported from r84
        (err) => console.error('error when loading starry_background.jpg')
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

    document.body.style.margin = '0'
    document.body.appendChild(renderer.domElement)

    render()
}

function render () {
    stats.begin()

    // const earth = scene.getObjectByName('earth')
    // const clouds = scene.getObjectByName('clouds')
    // if (earth && clouds) {
    //     earth.rotation.y -= .0004
    //     clouds.rotation.y -= .0005
    // }
    renderer.render( sceneBG, cameraBG );
    renderer.clearDepth();
    renderer.render( scene, camera );
    // Avoid to only see the result from the latest THREE.RenderPass object
    renderer.autoClear = false

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

