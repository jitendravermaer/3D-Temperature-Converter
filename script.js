// DOM Elements
const temperatureInput = document.getElementById("temperature")
const scaleLabel = document.getElementById("scale-label")
const resetBtn = document.getElementById("reset-btn")
const tabTriggers = document.querySelectorAll(".tab-trigger")
const celsiusValue = document.getElementById("celsius-value")
const fahrenheitValue = document.getElementById("fahrenheit-value")
const kelvinValue = document.getElementById("kelvin-value")
const toggleRotationBtn = document.getElementById("toggle-rotation")

// State
let temperature = 25
let scale = "celsius"
let convertedValues = {
  celsius: 25,
  fahrenheit: 77,
  kelvin: 298.15,
}

// Assuming these are defined elsewhere, possibly in a separate file
// For example, if using Three.js:
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
// and updateThermometers is a function defined in another file
// import { updateThermometers } from './thermometer-utils';

// Declare controls and updateThermometers
let controls
let updateThermometers

// Event Listeners
temperatureInput.addEventListener("input", handleTemperatureChange)
resetBtn.addEventListener("click", resetTemperature)
toggleRotationBtn.addEventListener("click", handleToggleRotation)

// Set up tab triggers
tabTriggers.forEach((trigger) => {
  trigger.addEventListener("click", () => {
    // Update active tab
    tabTriggers.forEach((t) => t.classList.remove("active"))
    trigger.classList.add("active")

    // Update scale
    scale = trigger.dataset.scale
    scaleLabel.textContent = scale

    // Update temperature based on current value in the active scale
    updateTemperature(Number.parseFloat(temperatureInput.value))
  })
})

// Functions
function handleTemperatureChange(e) {
  const value = Number.parseFloat(e.target.value)
  if (!isNaN(value)) {
    updateTemperature(value)
  } else {
    updateTemperature(0)
  }
}

function updateTemperature(value) {
  temperature = value

  // Convert the temperature to all scales
  let celsius = 0
  let fahrenheit = 0
  let kelvin = 0

  switch (scale) {
    case "celsius":
      celsius = temperature
      fahrenheit = (temperature * 9) / 5 + 32
      kelvin = temperature + 273.15
      break
    case "fahrenheit":
      celsius = ((temperature - 32) * 5) / 9
      fahrenheit = temperature
      kelvin = ((temperature - 32) * 5) / 9 + 273.15
      break
    case "kelvin":
      celsius = temperature - 273.15
      fahrenheit = ((temperature - 273.15) * 9) / 5 + 32
      kelvin = temperature
      break
  }

  // Update state
  convertedValues = {
    celsius: Number.parseFloat(celsius.toFixed(2)),
    fahrenheit: Number.parseFloat(fahrenheit.toFixed(2)),
    kelvin: Number.parseFloat(kelvin.toFixed(2)),
  }

  // Update UI
  celsiusValue.textContent = `${convertedValues.celsius}°C`
  fahrenheitValue.textContent = `${convertedValues.fahrenheit}°F`
  kelvinValue.textContent = `${convertedValues.kelvin}K`

  // Update 3D scene
  if (window.updateThermometers) {
    window.updateThermometers(convertedValues)
  }
}

function resetTemperature() {
  temperatureInput.value = 0
  updateTemperature(0)
}

function handleToggleRotation() {
  if (window.toggleRotation) {
    const isRotating = window.toggleRotation()
    toggleRotationBtn.textContent = isRotating ? "Stop Rotation" : "Start Rotation"
    toggleRotationBtn.classList.toggle("active", isRotating)
  }
}

// Initialize
updateTemperature(temperature)

