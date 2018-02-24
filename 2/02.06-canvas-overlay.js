const THREE = require('three')
const OrbitControls = require('three-orbit-controls')(THREE)
const dat = require('dat.gui')
const Stats = require('stats.js')
const fetch = require('node-fetch')
const csvjson = require('csvjson')

let camera, cameraBG, renderer
let width = window.innerWidth,
height = window.innerHeight

function init() {
    const canvas = document.createElement('canvas')
    canvas.width = 4096
    canvas.height = 2048
    const context = canvas.getContext('2d')

    // scene background
    const sceneBG = new THREE.Scene()

    // scene
    const scene = new THREE.Scene()

    // camera background
    cameraBG = new THREE.OrthographicCamera(
        -width,
        width,
        height,
        -height,
        -10000,
        10000
    )
    cameraBG.position.z = 50

    //camera
    camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000)
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

    // ports data source path
    const portsSRC = '../assets/data/wpi.csv'

    // textures
    const texturesBasePath = '../assets/textures/planets/'
    const texturesSRC = [
        'earthmap4K.jpg',
        'earth_normalmap_flat4k.jpg',
        'earthspec4k.jpg',
        'fair_clouds_4k.png',
        'starry_background.jpg'
    ].map(texture => texturesBasePath + texture)

    Promise.all([...getTextures(texturesSRC), getPorts(portsSRC)])
    .then(assets => {
        const [
            earthMapTexture,
            earthNormalMapTexture,
            earthSpecularMapTexture,
            cloudsTexture,
            starryBackgroundTexture,
            portsData,
        ] = assets

        const ports = parsePortsData(portsData)
        drawPorts(ports)

        // earth
        const earthGeometry = new THREE.SphereGeometry(15, 32, 32)
        const earthMaterial = new THREE.MeshPhongMaterial({
            map: earthMapTexture
        })
        earthMaterial.normalMap = earthNormalMapTexture
        earthMaterial.normalScale = new THREE.Vector2(0.5, 0.7)
        earthMaterial.specularMap = earthSpecularMapTexture
        earthMaterial.specular = new THREE.Color(0x262626)
        const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial)
        earthMesh.name = 'earth'
        scene.add(earthMesh)

        // clouds
        const cloudGeometry = new THREE.SphereGeometry(
            earthGeometry.parameters.radius * 1.01,
            earthGeometry.parameters.widthSegments,
            earthGeometry.parameters.heightSegments
        )
        const cloudMaterial = new THREE.MeshBasicMaterial({
            map: cloudsTexture,
            transparent: true
        })
        const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial)
        cloudMesh.name = 'clouds'
        scene.add(cloudMesh)

        // ports
        const portsGeometry = new THREE.SphereGeometry(
            earthGeometry.parameters.radius * 1.01,
            earthGeometry.parameters.widthSegments,
            earthGeometry.parameters.heightSegments,
        )
        const portsMaterial = new THREE.MeshPhongMaterial()
        portsMaterial.map = new THREE.Texture(canvas)
        portsMaterial.map.needsUpdate = true
        portsMaterial.transparent = true
        portsMaterial.opacity = .6
        const portsMesh = new THREE.Mesh(portsGeometry, portsMaterial)
        portsMesh.name = 'ports'
        scene.add(portsMesh)

        // background plane
        const bgPlaneGeometry = new THREE.PlaneGeometry(1, 1)
        const bgPlaneMaterial = new THREE.MeshBasicMaterial({
            map: starryBackgroundTexture
        })
        const bgPlaneMesh = new THREE.Mesh(bgPlaneGeometry, bgPlaneMaterial)
        // We moved it to the back of our planet and then scaled it to fill the complete screen
        bgPlaneMesh.position.z = -100
        bgPlaneMesh.scale.x = width * 2
        bgPlaneMesh.scale.y = width * 2
        sceneBG.add(bgPlaneMesh)

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
        function render() {
            stats.begin()

            cloudMesh.rotation.y += 0.0005
            earthMesh.rotation.y += 0.0004
            portsMesh.rotation.y += 0.0004

            renderer.render(sceneBG, cameraBG)
            renderer.clearDepth()
            renderer.render(scene, camera)
            // Avoid to only see the result from the latest THREE.RenderPass object
            renderer.autoClear = false

            requestAnimationFrame(render)

            stats.end()
        }
    })
    .catch(err => console.error(err))

    /**
     *
     * @param {Array} texturesSources - List of Strings that represent texture sources
     * @returns {Array} Array containing a Promise for each source
     */
    function getTextures (texturesSources) {
        const loader = new THREE.TextureLoader()
        return texturesSources.map(textureSource => {
            return new Promise((resolve, reject) => {
                loader.load(
                textureSource,
                texture => resolve(texture),
                undefined, // onProgress callback not supported from r84
                err => reject(err)
            )
        })
    })
    }

    /**
     *
     * @param {String} portsSource - String that represents CSV sources path
     * @returns {Promise}
     */
    function getPorts(portsSource) {
        return fetch(portsSource).then(res => res.text())
    }

    /**
     *
     * @param {String} portsData - Stringified CSV file
     * @returns {Object} Object containing the name and x and y coordinates for each port
     */
    function parsePortsData(portsData) {
        // Convert the CSV file to a list of arrays
        return csvjson.toArray(portsData)
            .map(port => port[0].split(';'))
            .filter(port => port[25] === 'L') // keep only large ports
            .map(port => {
                const portName = port[2]
                const south = 'S'
                let posY = parseFloat(port[4] + '.' + port[5])
                if(port[6] === south) posY *= -1

                const west = 'W'
                let posX = parseFloat(port[7] + '.' + port[8])
                if(port[9] === west) posX *= -1

                const x = ((4096 / 360.0) * (180 + posX))
                const y = ((2048 / 180.0) * (90 - posY))

                return {
                    name: portName,
                    x,
                    y,
                }
            })
    }

    /**
     *
     * @param {Array} ports - List of Objects containing the name and
     * x and y coordinates for each port
     */
    function drawPorts(ports) {
        ports.forEach(port => {
            const { x, y } = port
            context.beginPath();
            context.arc(x, y, 4, 0, 2 * Math.PI);
            context.fillStyle = 'red';
            context.fill();
            context.lineWidth = 2;
            context.strokeStyle = '#003300';
            context.stroke();
        })
    }

}

function handleResize() {
    width = window.innerWidth
    height = window.innerHeight
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    cameraBG.aspect = width / height
    cameraBG.updateProjectionMatrix()
    renderer.setSize(width, height)
}

window.onload = init
window.addEventListener('resize', handleResize)
