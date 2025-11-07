// Variables de ejemplo (simulación)
let temperatura = 25.3;
let humedad = 60.4;
let presion = 1013.2;
let altitud = 225;
let gas = 180;
let humedadSuelo = 45;

// Mostrar valores en pantalla
function actualizarPanel() {
    document.getElementById("temp").innerText = temperatura.toFixed(1) + " °C";
    document.getElementById("hum").innerText = humedad.toFixed(1) + " %";
    document.getElementById("presion").innerText = presion.toFixed(1) + " hPa";
    document.getElementById("altitud").innerText = altitud.toFixed(0) + " m";
    document.getElementById("gas").innerText = gas.toFixed(0) + " ppm";
    document.getElementById("suelo").innerText = humedadSuelo.toFixed(0) + " %";
}

// Simular cambios de datos cada 5 segundos
setInterval(() => {
    temperatura += (Math.random() - 0.5);
    humedad += (Math.random() - 0.5) * 2;
    gas += (Math.random() - 0.5) * 5;
    humedadSuelo += (Math.random() - 0.5) * 3;
    actualizarPanel();
    agregarDatos();
}, 5000);

actualizarPanel();

// Gráficas con Chart.js
const ctxTemp = document.getElementById("graficaTemp").getContext("2d");
const ctxHum = document.getElementById("graficaHum").getContext("2d");

const graficaTemp = new Chart(ctxTemp, {
    type: "line",
    data: {
        labels: [],
        datasets: [{
            label: "Temperatura (°C)",
            data: [],
            borderColor: "#ff4500",
            fill: false
        }]
    },
    options: { responsive: true, scales: { y: { beginAtZero: false } } }
});

const graficaHum = new Chart(ctxHum, {
    type: "line",
    data: {
        labels: [],
        datasets: [{
            label: "Humedad (%)",
            data: [],
            borderColor: "#0078d7",
            fill: false
        }]
    },
    options: { responsive: true, scales: { y: { beginAtZero: true, max: 100 } } }
});

// Agregar puntos nuevos a las gráficas
function agregarDatos() {
    const tiempo = new Date().toLocaleTimeString();
    graficaTemp.data.labels.push(tiempo);
    graficaHum.data.labels.push(tiempo);

    graficaTemp.data.datasets[0].data.push(temperatura.toFixed(1));
    graficaHum.data.datasets[0].data.push(humedad.toFixed(1));

    if (graficaTemp.data.labels.length > 10) {
        graficaTemp.data.labels.shift();
        graficaTemp.data.datasets[0].data.shift();
        graficaHum.data.labels.shift();
        graficaHum.data.datasets[0].data.shift();
    }

    graficaTemp.update();
    graficaHum.update();
}
