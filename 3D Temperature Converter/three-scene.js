import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

// Three.js variables
let scene, camera, renderer, controls
let thermometerGroup
let thermometerCelsius, thermometerFahrenheit, thermometerKelvin
let liquidCelsius, liquidFahrenheit, liquidKelvin
let backgroundSphere
const scale = "celsius" // Default scale
let isAutoRotating = true // Track rotation state

// Make updateThermometers available globally
window.updateThermometers = (values) => {
  // Update colors based on temperature
  const celsiusColor = getTemperatureColor(values.celsius, "celsius")
  const fahrenheitColor = getTemperatureColor(values.fahrenheit, "fahrenheit")
  const kelvinColor = getTemperatureColor(values.kelvin, "kelvin")

  // Update Celsius thermometer
  updateThermometer(liquidCelsius, values.celsius, "celsius", celsiusColor)

  // Update Fahrenheit thermometer
  updateThermometer(liquidFahrenheit, values.fahrenheit, "fahrenheit", fahrenheitColor)

  // Update Kelvin thermometer
  updateThermometer(liquidKelvin, values.kelvin, "kelvin", kelvinColor)

  // Update background sphere color based on active scale
  let activeColor
  switch (scale) {
    case "celsius":
      activeColor = celsiusColor
      break
    case "fahrenheit":
      activeColor = fahrenheitColor
      break
    case "kelvin":
      activeColor = kelvinColor
      break
  }

  backgroundSphere.material.color.setRGB(activeColor[0], activeColor[1], activeColor[2])
  backgroundSphere.material.emissive.setRGB(activeColor[0], activeColor[1], activeColor[2])
}

// Make toggleRotation available globally
window.toggleRotation = () => {
  isAutoRotating = !isAutoRotating
  controls.autoRotate = isAutoRotating
  return isAutoRotating
}

// Initialize the 3D scene
initScene()
animate()

// Function to initialize the Three.js scene
function initScene() {
  // Create scene
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x0a0a0a)

  // Create camera
  camera = new THREE.PerspectiveCamera(
    75,
    document.getElementById("temperature-scene").clientWidth /
      document.getElementById("temperature-scene").clientHeight,
    0.1,
    1000,
  )
  camera.position.z = 10

  // Create renderer
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(
    document.getElementById("temperature-scene").clientWidth,
    document.getElementById("temperature-scene").clientHeight,
  )
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  document.getElementById("temperature-scene").appendChild(renderer.domElement)

  // Add orbit controls
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.autoRotate = isAutoRotating
  controls.autoRotateSpeed = 0.5

  // Add lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
  scene.add(ambientLight)

  const pointLight = new THREE.PointLight(0xffffff, 1, 100)
  pointLight.position.set(10, 10, 10)
  pointLight.castShadow = true
  scene.add(pointLight)

  // Add a spotlight for dramatic effect
  const spotLight = new THREE.SpotLight(0xffffff, 1)
  spotLight.position.set(0, 15, 0)
  spotLight.angle = Math.PI / 6
  spotLight.penumbra = 0.3
  spotLight.castShadow = true
  scene.add(spotLight)

  // Create thermometer group
  thermometerGroup = new THREE.Group()
  scene.add(thermometerGroup)

  // Create thermometers
  createThermometers()

  // Create background sphere
  createBackgroundSphere()

  // Add text labels
  addTextLabels()

  // Add particles for a more dynamic background
  createParticles()

  // Add a platform/base for thermometers
  createPlatform()

  // Handle window resize
  window.addEventListener("resize", onWindowResize)
}

// Function to create particles for background effect
function createParticles() {
  const particleGeometry = new THREE.BufferGeometry()
  const particleCount = 1000

  const positions = new Float32Array(particleCount * 3)
  const colors = new Float32Array(particleCount * 3)

  for (let i = 0; i < particleCount * 3; i += 3) {
    // Position particles in a sphere around the scene
    const radius = 20 + Math.random() * 10
    const theta = Math.random() * Math.PI * 2
    const phi = Math.random() * Math.PI

    positions[i] = radius * Math.sin(phi) * Math.cos(theta)
    positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta)
    positions[i + 2] = radius * Math.cos(phi)

    // Give particles a blue/purple color scheme
    colors[i] = 0.5 + Math.random() * 0.5 // R
    colors[i + 1] = 0.2 + Math.random() * 0.3 // G
    colors[i + 2] = 0.8 + Math.random() * 0.2 // B
  }

  particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
  particleGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3))

  const particleMaterial = new THREE.PointsMaterial({
    size: 0.1,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
  })

  const particles = new THREE.Points(particleGeometry, particleMaterial)
  scene.add(particles)
}

// Function to create a platform for thermometers
function createPlatform() {
  const platformGeometry = new THREE.CylinderGeometry(8, 8, 0.5, 32)
  const platformMaterial = new THREE.MeshStandardMaterial({
    color: 0x333344,
    metalness: 0.7,
    roughness: 0.2,
  })
  const platform = new THREE.Mesh(platformGeometry, platformMaterial)
  platform.position.y = -5
  platform.receiveShadow = true
  scene.add(platform)

  // Add a ring around the platform
  const ringGeometry = new THREE.TorusGeometry(8, 0.2, 16, 100)
  const ringMaterial = new THREE.MeshStandardMaterial({
    color: 0x4466aa,
    metalness: 0.8,
    roughness: 0.2,
    emissive: 0x112244,
  })
  const ring = new THREE.Mesh(ringGeometry, ringMaterial)
  ring.position.y = -4.75
  ring.rotation.x = Math.PI / 2
  scene.add(ring)
}

// Function to create the thermometers
function createThermometers() {
  // Create Celsius thermometer
  thermometerCelsius = createThermometer(-4, 0, 0)
  thermometerGroup.add(thermometerCelsius)

  // Create Fahrenheit thermometer
  thermometerFahrenheit = createThermometer(0, 0, 0)
  thermometerGroup.add(thermometerFahrenheit)

  // Create Kelvin thermometer
  thermometerKelvin = createThermometer(4, 0, 0)
  thermometerGroup.add(thermometerKelvin)

  // Get liquid references
  liquidCelsius = thermometerCelsius.getObjectByName("liquid")
  liquidFahrenheit = thermometerFahrenheit.getObjectByName("liquid")
  liquidKelvin = thermometerKelvin.getObjectByName("liquid")
}

// Function to create a single thermometer
function createThermometer(x, y, z) {
  const thermometer = new THREE.Group()
  thermometer.position.set(x, y, z)

  // Thermometer tube
  const tubeGeometry = new THREE.CylinderGeometry(0.2, 0.2, 5, 32)
  const tubeMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.3,
    roughness: 0.1,
    transmission: 0.9,
    thickness: 0.5,
  })
  const tube = new THREE.Mesh(tubeGeometry, tubeMaterial)
  tube.castShadow = true
  thermometer.add(tube)

  // Thermometer bulb
  const bulbGeometry = new THREE.SphereGeometry(0.5, 32, 32)
  const bulbMaterial = new THREE.MeshStandardMaterial({
    color: 0xff0000,
    metalness: 0.1,
    roughness: 0.2,
    emissive: 0x330000,
    emissiveIntensity: 0.5,
  })
  const bulb = new THREE.Mesh(bulbGeometry, bulbMaterial)
  bulb.position.y = -3
  bulb.castShadow = true
  thermometer.add(bulb)

  // Liquid
  const liquidGeometry = new THREE.CylinderGeometry(0.15, 0.15, 1, 32)
  const liquidMaterial = new THREE.MeshStandardMaterial({
    color: 0xff0000,
    metalness: 0.1,
    roughness: 0.2,
    emissive: 0x330000,
    emissiveIntensity: 0.5,
  })
  const liquid = new THREE.Mesh(liquidGeometry, liquidMaterial)
  liquid.position.y = -2
  liquid.name = "liquid"
  thermometer.add(liquid)

  // Scale markings
  for (let i = -2; i <= 2; i++) {
    const markGeometry = new THREE.BoxGeometry(0.2, 0.05, 0.05)
    const markMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.5,
      roughness: 0.2,
    })
    const mark = new THREE.Mesh(markGeometry, markMaterial)
    mark.position.set(0.3, i, 0)
    thermometer.add(mark)
  }

  // Add a base for the thermometer
  const baseGeometry = new THREE.CylinderGeometry(0.6, 0.8, 0.4, 32)
  const baseMaterial = new THREE.MeshStandardMaterial({
    color: 0x444444,
    metalness: 0.7,
    roughness: 0.2,
  })
  const base = new THREE.Mesh(baseGeometry, baseMaterial)
  base.position.y = -4
  base.castShadow = true
  base.receiveShadow = true
  thermometer.add(base)

  return thermometer
}

// Function to create background sphere
function createBackgroundSphere() {
  const geometry = new THREE.SphereGeometry(3, 32, 32)
  const material = new THREE.MeshStandardMaterial({
    color: 0xff0000,
    emissive: 0xff0000,
    emissiveIntensity: 0.5,
    metalness: 0.2,
    roughness: 0.7,
  })
  backgroundSphere = new THREE.Mesh(geometry, material)
  backgroundSphere.position.z = -5
  scene.add(backgroundSphere)
}

// Function to add text labels (simplified without TextGeometry)
function addTextLabels() {
  // In a real implementation, you would use TextGeometry
  // For simplicity, we'll use simple planes with materials as placeholders
  createSimpleTextLabel(-4, 3, 0, "Celsius")
  createSimpleTextLabel(0, 3, 0, "Fahrenheit")
  createSimpleTextLabel(4, 3, 0, "Kelvin")
}

// Simple placeholder for text labels
function createSimpleTextLabel(x, y, z, text) {
  const geometry = new THREE.PlaneGeometry(2, 0.5)
  const material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.8,
  })
  const label = new THREE.Mesh(geometry, material)
  label.position.set(x, y, z)
  scene.add(label)
}

// Function to update a single thermometer
function updateThermometer(liquid, temp, scaleType, color) {
  // Calculate liquid height based on temperature
  let liquidHeight = 0

  if (scaleType === "celsius") {
    // Map -50°C to 50°C to 0-4 units
    liquidHeight = ((temp + 50) / 100) * 4
  } else if (scaleType === "fahrenheit") {
    // Map -58°F to 122°F to 0-4 units
    liquidHeight = ((temp + 58) / 180) * 4
  } else if (scaleType === "kelvin") {
    // Map 223K to 323K to 0-4 units
    liquidHeight = ((temp - 223) / 100) * 4
  }

  // Clamp between 0 and 4
  liquidHeight = Math.max(0, Math.min(4, liquidHeight))

  // Update liquid height
  liquid.scale.y = liquidHeight
  liquid.position.y = -2 + liquidHeight / 2

  // Update liquid color
  liquid.material.color.setRGB(color[0], color[1], color[2])
  liquid.material.emissive.setRGB(color[0] * 0.3, color[1] * 0.3, color[2] * 0.3)

  // Update bulb color (parent's previous sibling)
  const bulb = liquid.parent.children[1]
  bulb.material.color.setRGB(color[0], color[1], color[2])
  bulb.material.emissive.setRGB(color[0] * 0.3, color[1] * 0.3, color[2] * 0.3)
}

// Function to get temperature color
function getTemperatureColor(temp, scaleType) {
  let normalizedTemp = 0

  // Normalize temperature to a 0-1 scale for color mapping
  if (scaleType === "celsius") {
    // Map -50°C to 50°C to 0-1
    normalizedTemp = (temp + 50) / 100
  } else if (scaleType === "fahrenheit") {
    // Map -58°F to 122°F to 0-1
    normalizedTemp = (temp + 58) / 180
  } else if (scaleType === "kelvin") {
    // Map 223K to 323K to 0-1
    normalizedTemp = (temp - 223) / 100
  }

  // Clamp between 0 and 1
  normalizedTemp = Math.max(0, Math.min(1, normalizedTemp))

  // Blue (cold) to red (hot)
  const r = normalizedTemp
  const g = 0.2
  const b = 1 - normalizedTemp

  return [r, g, b]
}

// Function to handle window resize
function onWindowResize() {
  camera.aspect =
    document.getElementById("temperature-scene").clientWidth / document.getElementById("temperature-scene").clientHeight
  camera.updateProjectionMatrix()
  renderer.setSize(
    document.getElementById("temperature-scene").clientWidth,
    document.getElementById("temperature-scene").clientHeight,
  )
}

// Animation loop
function animate() {
  requestAnimationFrame(animate)

  // Rotate thermometer group slightly for a more dynamic scene
  thermometerGroup.rotation.y += 0.001

  controls.update()
  renderer.render(scene, camera)
}

