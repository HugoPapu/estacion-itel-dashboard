// 🧠 Reemplaza con tu token real (¡NO lo compartas públicamente!)
const BOT_TOKEN = "8417526642:AAFL-KaDSyhPVGWo7lKIUm4YGUvUHlR1fko";
const API_URL = `https://api.telegram.org/bot${BOT_TOKEN}/getUpdates`;

async function obtenerDatos() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    if (!data.ok) throw new Error("Error en la API de Telegram");

    // Buscar el último mensaje que contenga datos meteorológicos
    const mensajes = data.result.reverse();
    let mensajeDatos = null;

    for (let msg of mensajes) {
      if (msg.message && msg.message.text && msg.message.text.includes("Reporte Meteorológico")) {
        mensajeDatos = msg.message.text;
        break;
      }
    }

    if (mensajeDatos) {
      actualizarDashboard(mensajeDatos);
    } else {
      console.warn("No se encontraron datos meteorológicos en los mensajes recientes.");
    }
  } catch (error) {
    console.error("Error al obtener datos:", error);
  }
}

function actualizarDashboard(texto) {
  // Ejemplo de texto que llega:
  // 📈 <b>Reporte Meteorológico ITEL</b> 🌤
  // 🌡 Temperatura: 25.3°C
  // 💧 Humedad: 65.2%
  // 🔽 Presión: 1013 hPa
  // ☀ UV: 3.4
  // 🌧 Seco
  // ☔ Prob. lluvia: 20.5%

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
}

function extraerValor(texto, regex) {
  const match = texto.match(regex);
  return match ? parseFloat(match[1]) : null;
}

function extraerTexto(texto, regex) {
  const match = texto.match(regex);
  return match ? match[1].trim() : null;
}

// Actualizar cada 10 segundos
setInterval(obtenerDatos, 10000);
obtenerDatos();
