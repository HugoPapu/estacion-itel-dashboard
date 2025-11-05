document.addEventListener("DOMContentLoaded", () => {
  // 🔑 Inserta aquí tu token real del bot
  const TOKEN = "<TU_TOKEN_AQUI>";
  const url = `https://api.telegram.org/bot${TOKEN}/getUpdates`;

  // 📊 Inicializar gráfica
  const canvas = document.getElementById("chart");
  const ctx = canvas.getContext("2d");

  const grafica = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Temperatura (°C)",
          data: [],
          borderColor: "orange",
          backgroundColor: "rgba(255,165,0,0.3)",
          borderWidth: 2,
          fill: true,
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: "white" } }
      },
      scales: {
        x: {
          ticks: { color: "white" },
          grid: { color: "rgba(255,255,255,0.1)" }
        },
        y: {
          ticks: { color: "white" },
          grid: { color: "rgba(255,255,255,0.1)" },
          beginAtZero: true
        }
      }
    }
  });

  // 🧠 Función para obtener los datos del canal
  async function obtenerDatos() {
    try {
      const res = await fetch(url);
      const data = await res.json();

      const mensajes = data.result
        .map(u => u.channel_post?.text)
        .filter(t => t && t.includes("Reporte Meteorológico ITEL"));

      if (mensajes.length === 0) {
        console.warn("⚠️ No se encontraron datos meteorológicos recientes");
        return;
      }

      const ultimo = mensajes[mensajes.length - 1];
      console.log("📩 Mensaje detectado:", ultimo);

      const valores = extraerDatos(ultimo);
      actualizarDashboard(valores);
      actualizarGrafica(valores.temperatura);
    } catch (err) {
      console.error("❌ Error obteniendo datos:", err);
    }
  }

  // 🧩 Extrae valores del texto del reporte
  function extraerDatos(texto) {
    const temp = texto.match(/Temperatura:\s([\d.]+)/)?.[1];
    const hum = texto.match(/Humedad:\s(\d+)/)?.[1];
    const pres = texto.match(/Presión:\s(\d+)/)?.[1];
    const uv = texto.match(/UV:\s(\d+)/)?.[1];
    const lluvia = texto.match(/Prob\. lluvia:\s(\d+)/)?.[1];
    const estado = texto.match(/(?:☀️|🌧|⛅|🌩️|🌦️)\s(.+)/)?.[1];

    return { temperatura: temp, humedad: hum, presion: pres, uv, lluvia, estado };
  }

  // 🖥️ Actualiza las lecturas en pantalla
  function actualizarDashboard({ temperatura, humedad, presion, uv, lluvia, estado }) {
    document.getElementById("temp").textContent = temperatura || "--";
    document.getElementById("hum").textContent = humedad || "--";
    document.getElementById("pres").textContent = presion || "--";
    document.getElementById("uv").textContent = uv || "--";
    document.getElementById("lluvia").textContent = lluvia || "--";
    document.getElementById("estado").textContent = estado || "--";
  }

  // 📈 Agrega el nuevo punto al gráfico
  function actualizarGrafica(temp) {
    const valor = parseFloat(temp);
    if (isNaN(valor)) return;

    const hora = new Date().toLocaleTimeString();
    grafica.data.labels.push(hora);
    grafica.data.datasets[0].data.push(valor);

    if (grafica.data.labels.length > 10) {
      grafica.data.labels.shift();
      grafica.data.datasets[0].data.shift();
    }

    grafica.update();
  }

  // 🔁 Actualiza automáticamente cada 5 segundos
  setInterval(obtenerDatos, 5000);
  obtenerDatos(); // Primera carga
});
