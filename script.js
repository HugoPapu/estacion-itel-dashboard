const BOT_TOKEN = "8417526642:AAFL-KaDSyhPVGWo7lKIUm4YGUvUHlR1fko";
const API_URL = `https://api.telegram.org/bot${BOT_TOKEN}/getUpdates`;

const ctx = document.getElementById("graficaClima").getContext("2d");

let grafica = new Chart(ctx, {
  type: "bar",
  data: {
    labels: ["Temperatura", "Humedad", "Presión", "UV", "Lluvia"],
    datasets: [
      {
        label: "Datos Meteorológicos",
        data: [0, 0, 0, 0, 0],
        backgroundColor: [
          "rgba(255, 99, 132, 0.5)",
          "rgba(54, 162, 235, 0.5)",
          "rgba(255, 206, 86, 0.5)",
          "rgba(75, 192, 192, 0.5)",
          "rgba(153, 102, 255, 0.5)"
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)"
        ],
        borderWidth: 1
      }
    ]
  },
  options: {
    responsive: true,
    scales: {
      y: { beginAtZero: true }
    }
  }
});

async function obtenerDatos() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    if (!data.ok || !data.result.length) {
      console.warn("No se encontraron datos meteorológicos recientes");
      return;
    }

    // Buscar el último mensaje con texto
    const mensajesTexto = data.result.filter(
      r => r.channel_post && r.channel_post.text
    );

    if (!mensajesTexto.length) {
      console.warn("No hay mensajes de texto en el canal");
      return;
    }

    const ultimo = mensajesTexto[mensajesTexto.length - 1].channel_post.text;

    console.log("Mensaje recibido:", ultimo);

    // Extraer valores numéricos
    const temperatura = parseFloat(ultimo.match(/Temperatura:\s*([\d.]+)/)?.[1] || 0);
    const humedad = parseFloat(ultimo.match(/Humedad:\s*([\d.]+)/)?.[1] || 0);
    const presion = parseFloat(ultimo.match(/Presi[oó]n:\s*([\d.]+)/)?.[1] || 0);
    const uv = parseFloat(ultimo.match(/UV:\s*(\d+)/)?.[1] || 0);
    const lluvia = parseFloat(ultimo.match(/Prob\.\s*lluvia:\s*([\d.]+)/)?.[1] || 0);

    // Actualizar datos en la gráfica
    grafica.data.datasets[0].data = [temperatura, humedad, presion, uv, lluvia];
    grafica.update();

    document.getElementById("ultimoMensaje").innerText =
      "Última actualización: " + new Date().toLocaleTimeString();
  } catch (error) {
    console.error("Error al obtener datos:", error);
  }
}

// Actualizar cada 10 segundos
setInterval(obtenerDatos, 10000);

// Cargar al inicio
obtenerDatos();
