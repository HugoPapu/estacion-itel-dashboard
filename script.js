// === CONFIGURACIÓN ===
const BOT_TOKEN = "8417526642:AAFL-KaDSyhPVGWo7lKIUm4YGUvUHlR1fko";
const API_URL = `https://api.telegram.org/bot${BOT_TOKEN}/getUpdates`;

// === ELEMENTOS HTML ===
const tempEl = document.getElementById("temp");
const humEl = document.getElementById("hum");
const presEl = document.getElementById("pres");
const uvEl = document.getElementById("uv");
const lluviaEl = document.getElementById("lluvia");
const estadoEl = document.getElementById("estado");

// === CHART.JS CONFIGURACIÓN ===
const ctx = document.getElementById("chart").getContext("2d");
const chart = new Chart(ctx, {
  type: "line",
  data: {
    labels: [],
    datasets: [
      {
        label: "Temperatura (°C)",
        data: [],
        borderColor: "rgba(255, 99, 132, 1)",
        fill: false,
      },
      {
        label: "Humedad (%)",
        data: [],
        borderColor: "rgba(54, 162, 235, 1)",
        fill: false,
      },
      {
        label: "Presión (hPa)",
        data: [],
        borderColor: "rgba(255, 206, 86, 1)",
        fill: false,
      },
    ],
  },
  options: {
    responsive: true,
    scales: {
      y: {
        beginAtZero: false,
      },
    },
  },
});

// === FUNCIÓN PRINCIPAL ===
async function obtenerDatos() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    if (!data.ok) throw new Error("Error en la API de Telegram");

    // Buscar el último mensaje con los datos meteorológicos
    const mensajes = data.result.reverse();
    let mensajeDatos = null;

    for (let msg of mensajes) {
      const texto = msg.channel_post?.text || msg.message?.text;
      if (texto && texto.includes("Reporte Meteorológico ITEL")) {
        mensajeDatos = texto;
        break;
      }
    }

    if (!mensajeDatos) {
      console.warn("⚠️ No se encontraron datos meteorológicos recientes");
      return;
    }

    // === EXTRAER DATOS CON REGEX ===
    const temp = parseFloat(mensajeDatos.match(/Temperatura:\s*([\d.]+)/)?.[1]) || 0;
    const hum = parseFloat(mensajeDatos.match(/Humedad:\s*([\d.]+)/)?.[1]) || 0;
    const pres = parseFloat(mensajeDatos.match(/Presi[óo]n:\s*([\d.]+)/)?.[1]) || 0;
    const uv = parseFloat(mensajeDatos.match(/UV:\s*([\d.]+)/)?.[1]) || 0;
    const probLluvia = parseFloat(mensajeDatos.match(/Prob.*lluvia:\s*([\d.]+)/)?.[1]) || 0;
    const estadoLluvia = mensajeDatos.match(/🌧\s*(.*)/)?.[1] || "N/A";

    // === ACTUALIZAR ELEMENTOS HTML ===
    tempEl.textContent = `${temp} °C`;
    humEl.textContent = `${hum} %`;
    presEl.textContent = `${pres} hPa`;
    uvEl.textContent = `${uv}`;
    lluviaEl.textContent = `${probLluvia} %`;
    estadoEl.textContent = estadoLluvia;

    // === ACTUALIZAR GRÁFICA ===
    const ahora = new Date().toLocaleTimeString();
    chart.data.labels.push(ahora);
    chart.data.datasets[0].data.push(temp);
    chart.data.datasets[1].data.push(hum);
    chart.data.datasets[2].data.push(pres);

    // Mantener solo los últimos 10 puntos
    if (chart.data.labels.length > 10) {
      chart.data.labels.shift();
      chart.data.datasets.forEach(d => d.data.shift());
    }

    chart.update();

    console.log("✅ Datos actualizados:", { temp, hum, pres, uv, probLluvia, estadoLluvia });
  } catch (error) {
    console.error("Error al obtener datos:", error);
  }
}

// === ACTUALIZACIÓN AUTOMÁTICA ===
setInterval(obtenerDatos, 10000); // cada 10 segundos
obtenerDatos();
