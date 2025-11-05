const BOT_TOKEN = "8417526642:AAFL-KaDSyhPVGWo7lKIUm4YGUvUHlR1fko";
const API_URL = `https://api.telegram.org/bot${BOT_TOKEN}/getUpdates`;

const tempEl = document.getElementById("temp");
const humEl = document.getElementById("hum");
const presEl = document.getElementById("pres");
const uvEl = document.getElementById("uv");
const lluviaEl = document.getElementById("lluvia");
const estadoEl = document.getElementById("estado");

const ctx = document.getElementById("chart").getContext("2d");
const chart = new Chart(ctx, {
  type: "line",
  data: {
    labels: [],
    datasets: [
      { label: "Temperatura (°C)", data: [], borderColor: "red", fill: false },
      { label: "Humedad (%)", data: [], borderColor: "blue", fill: false },
      { label: "Presión (hPa)", data: [], borderColor: "green", fill: false },
    ],
  },
  options: {
    responsive: true,
    scales: { y: { beginAtZero: false } },
  },
});

async function obtenerDatos() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    if (!data.ok) throw new Error("Error en la API de Telegram");

    const mensajes = data.result.reverse();
    let mensajeDatos = null;

    for (let msg of mensajes) {
      const texto = msg.channel_post?.text || msg.message?.text;
      if (!texto) continue;

      // Normaliza texto eliminando acentos y minúsculas
      const textoNormalizado = texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

      if (textoNormalizado.includes("reporte meteorologico itel")) {
        mensajeDatos = texto;
        break;
      }
    }

    if (!mensajeDatos) {
      console.warn("⚠️ No se encontraron datos meteorológicos recientes");
      return;
    }

    const temp = parseFloat(mensajeDatos.match(/Temperatura:\s*([\d.]+)/)?.[1]) || 0;
    const hum = parseFloat(mensajeDatos.match(/Humedad:\s*([\d.]+)/)?.[1]) || 0;
    const pres = parseFloat(mensajeDatos.match(/Presi[óo]n:\s*([\d.]+)/)?.[1]) || 0;
    const uv = parseFloat(mensajeDatos.match(/UV:\s*([\d.]+)/)?.[1]) || 0;
    const probLluvia = parseFloat(mensajeDatos.match(/Prob.*lluvia:\s*([\d.]+)/)?.[1]) || 0;
    const estadoLluvia = mensajeDatos.match(/🌧\s*(.*)/)?.[1] || "N/A";

    tempEl.textContent = `${temp} °C`;
    humEl.textContent = `${hum} %`;
    presEl.textContent = `${pres} hPa`;
    uvEl.textContent = uv;
    lluviaEl.textContent = `${probLluvia} %`;
    estadoEl.textContent = estadoLluvia;

    const ahora = new Date().toLocaleTimeString();
    chart.data.labels.push(ahora);
    chart.data.datasets[0].data.push(temp);
    chart.data.datasets[1].data.push(hum);
    chart.data.datasets[2].data.push(pres);

    if (chart.data.labels.length > 10) {
      chart.data.labels.shift();
      chart.data.datasets.forEach(d => d.data.shift());
    }

    chart.update();
    console.log("✅ Datos actualizados:", { temp, hum, pres, uv, probLluvia, estadoLluvia });

  } catch (err) {
    console.error("❌ Error al obtener datos:", err);
  }
}

setInterval(obtenerDatos, 10000);
obtenerDatos();
