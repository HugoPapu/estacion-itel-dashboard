document.addEventListener("DOMContentLoaded", () => {
  const TOKEN = "TU_TOKEN_AQUI";
  const CHAT_ID = "-1003116455259";
  const API_URL = `https://api.telegram.org/bot${TOKEN}/getUpdates`;

  async function obtenerDatos() {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();

      if (!data.ok) throw new Error("Error en la API de Telegram");

      const mensajes = data.result
        .map(m => m.channel_post?.text)
        .filter(Boolean);

      console.log("Mensajes recibidos:", mensajes);

      const ultimo = mensajes.reverse().find(msg =>
        msg.toLowerCase().includes("reporte")
      );

      if (!ultimo) {
        console.warn("⚠️ No se encontró un mensaje con 'Reporte'");
        return;
      }

      console.log("Mensaje detectado:", ultimo);

      const temperatura = ultimo.match(/Temperatura:\s*([\d.]+)/)?.[1] || "--";
      const humedad = ultimo.match(/Humedad:\s*(\d+)/)?.[1] || "--";
      const presion = ultimo.match(/Presi[oó]n:\s*(\d+)/)?.[1] || "--";
      const uv = ultimo.match(/UV:\s*(\d+)/)?.[1] || "--";
      const lluvia = ultimo.match(/Prob\. lluvia:\s*(\d+)/)?.[1] || "--";
      const estado = ultimo.match(/[\u2600-\u26FF]\s*(.+)/)?.[1] || "--";

      console.log({ temperatura, humedad, presion, uv, lluvia, estado });

      document.getElementById("temp").textContent = temperatura + " °C";
      document.getElementById("hum").textContent = humedad + " %";
      document.getElementById("pres").textContent = presion + " hPa";
      document.getElementById("uv").textContent = uv;
      document.getElementById("lluvia").textContent = lluvia + " %";
      document.getElementById("estado").textContent = estado;

      actualizarGrafica(temperatura, humedad, presion);
    } catch (err) {
      console.error("❌ Error obteniendo datos:", err);
    }
  }

  // --- Gráfica de Chart.js ---
  let grafica;

  function actualizarGrafica(temp, hum, pres) {
    const canvas = document.getElementById("chart");
    if (!canvas) {
      console.error("❌ No se encontró el elemento <canvas id='chart'>");
      return;
    }

    const ctx = canvas.getContext("2d");
    const datos = [parseFloat(temp), parseFloat(hum), parseFloat(pres)];

    if (grafica) {
      grafica.data.datasets[0].data = datos;
      grafica.update();
    } else {
      grafica = new Chart(ctx, {
        type: "bar",
        data: {
          labels: ["Temperatura (°C)", "Humedad (%)", "Presión (hPa)"],
          datasets: [{
            label: "Lectura actual",
            data: datos,
            backgroundColor: ["#ff6b6b", "#4dabf7", "#74c0fc"]
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: { beginAtZero: true }
          }
        }
      });
    }
  }

  setInterval(obtenerDatos, 10000);
  obtenerDatos();
});
