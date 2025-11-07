// Variables simuladas
let temperatura = 25.0;
let humedad = 55.0;
let presion = 1013.0;
let probLluvia = 30;
let estadoSuelo = "Seco";

// Actualizar panel
function actualizarPanel() {
    document.getElementById("temp").innerText = temperatura.toFixed(1) + " °C";
    document.getElementById("hum").innerText = humedad.toFixed(1) + " %";
    document.getElementById("presion").innerText = presion.toFixed(1) + " hPa";
    document.getElementById("estadoSuelo").innerText = estadoSuelo;
    document.getElementById("lluvia").innerText = probLluvia.toFixed(0) + " %";
}

// Generar estado del suelo
function determinarEstadoSuelo(humedad) {
    if (humedad < 40) return "Seco";
    if (humedad < 70) return "Húmedo";
    return "Mojado";
}

// Simular cambios de datos
setInterval(() => {
    temperatura += (Math.random() - 0.5) * 2;
    humedad += (Math.random() - 0.5) * 4;
    presion += (Math.random() - 0.5) * 1.5;
    probLluvia = Math.max(0, Math.min(100, humedad - 20 + Math.random() * 10));

    estadoSuelo = determinarEstadoSuelo(humedad);

    actualizarPanel();
    agregarDatos();
}, 4000);

actualizarPanel();

// Gráficas
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

// Añadir nuevos puntos
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
