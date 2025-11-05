const BOT_TOKEN = "8417526642:AAFL-KaDSyhPVGWo7lKIUm4YGUvUHlR1fko";
const API_URL = `https://api.telegram.org/bot${BOT_TOKEN}/getUpdates`;

let chartTemp, chartHum, chartPres;
let datosTemp = [], datosHum = [], datosPres = [];
let labels = [];

async function obtenerDatos() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    if (!data.ok) throw new Error("Error en la API de Telegram");

    const mensajes = data.result.reverse();
    let mensajeDatos = null;

    for (let msg of mensajes) {
      if (msg.message && msg.message.text && msg.message.text.includes("Reporte Meteorológico")) {
        mensajeDatos = msg.message.text;
        break;
      }
    }

    if (mensajeDatos) actualizarDashboard(mensajeDatos);
  } catch (error) {
    console.error("Error al obtener datos:", error);
  }
}

function actualizarDashboard(texto) {
  const temp = extraerValor(texto, /Temperatura:\s([\d.]+)/);
  const hum = extraerValor(texto, /Humedad:\s([\d.]+)/);
  const pres = extraerValor(texto, /Presión:\s([\d.]+)/);
  const uv = extraerValor(texto, /UV:\s([\d.]+)/);
  const lluvia = extraerTexto(texto, /🌧\s([^\n]+)/);
  const prob = extraerValor(texto, /Prob\. lluvia:\s([\d.]+)/);

  document.getElementById("temp").textContent = temp ? `${temp} °C` : "--";
  document.getElementById("hum").textContent = hum ? `${hum} %` : "--";
  document.getElementById("pres").textContent = pres ? `${pres} hPa` : "--";
  document.getElementById("uv").textContent = uv ? `${uv}` : "--";
  document.getElementById("lluvia").textContent = lluvia || "--";
  document.getElementById("prob").textContent = prob ? `${prob} %` : "--";

  // Actualizar gráficos
  if (temp && hum && pres) {
    const hora = new Date().toLocaleTimeString();
    labels.push(hora);
    if (labels.length > 10) labels.shift();

    datosTemp.push(temp);
    datosHum.push(hum);
    datosPres.push(pres);
    if (datosTemp.length > 10) {
      datosTemp.shift();
      datosHum.shift();
      datosPres.shift();
    }

    chartTemp.data.labels = labels;
    chartHum.data.labels = labels;
    chartPres.data.labels = labels;

    chartTemp.data.datasets[0].data = datosTemp;
    chartHum.data.datasets[0].data = datosHum;
    chartPres.data.datasets[0].data = datosPres;

    chartTemp.update();
    chartHum.update();
    chartPres.update();
  }
}

function extraerValor(texto, regex) {
  const match = texto.match(regex);
  return match ? parseFloat(match[1]) : null;
}

function extraerTexto(texto, regex) {
  const match = texto.match(regex);
  return match ? match[1].trim() : null;
}

function crearGraficas() {
  const opciones = {
    responsive: true,
    scales: {
      x: { display: true, title: { display: false } },
      y: { beginAtZero: false }
    }
  };

  chartTemp = new Chart(document.getElementById("chartTemp"), {
    type: "line",
    data: { labels, datasets: [{ label: "Temperatura", data: [], borderWidth: 2 }] },
    options: opciones
  });

  chartHum = new Chart(document.getElementById("chartHum"), {
    type: "line",
    data: { labels, datasets: [{ label: "Humedad", data: [], borderWidth: 2 }] },
    options: opciones
  });

  chartPres = new Chart(document.getElementById("chartPres"), {
    type: "line",
    data: { labels, datasets: [{ label: "Presión", data: [], borderWidth: 2 }] },
    options: opciones
  });
}

crearGraficas();
setInterval(obtenerDatos, 10000);
obtenerDatos();
