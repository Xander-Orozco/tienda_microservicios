const express = require("express");
const axios   = require("axios");

const app = express();
app.use(express.json());

// ── Lógica de talla mejorada ──────────────────────────────
// Usa busto, cintura y cadera con pesos ponderados.
// Retorna { talla, razon } para que el frontend pueda explicarlo.
function calcularTalla(busto, cintura, cadera) {
  let puntos = { S: 0, M: 0, L: 0 };

  // Busto (peso 40 %)
  if (busto < 85)       puntos.S += 2;
  else if (busto <= 95) puntos.M += 2;
  else                  puntos.L += 2;

  // Cintura (peso 30 %)
  if (cintura && cintura < 68)        puntos.S += 1.5;
  else if (cintura && cintura <= 78)  puntos.M += 1.5;
  else if (cintura)                   puntos.L += 1.5;

  // Cadera (peso 30 %)
  if (cadera && cadera < 92)        puntos.S += 1.5;
  else if (cadera && cadera <= 102) puntos.M += 1.5;
  else if (cadera)                  puntos.L += 1.5;

  const talla = Object.keys(puntos).reduce((a, b) => puntos[a] >= puntos[b] ? a : b);

  const razones = {
    S: "tus medidas corresponden a una silueta delgada-petite",
    M: "tus medidas se ubican en el rango intermedio estándar",
    L: "tus medidas corresponden a una silueta más curvilínea"
  };

  return { talla, razon: razones[talla], puntajes: puntos };
}

// ── Filtrar productos por talla y tipo de prenda ──────────
function elegirProducto(productos, talla, tipoPrenda) {
  // Primero: coincidencia exacta de talla y tipo
  if (tipoPrenda) {
    const exacto = productos.find(
      p => p.talla === talla &&
           (p.nombre || "").toLowerCase().includes(tipoPrenda.toLowerCase())
    );
    if (exacto) return exacto;
  }

  // Segundo: solo por talla
  const porTalla = productos.find(p => p.talla === talla);
  if (porTalla) return porTalla;

  // Fallback: primer producto disponible
  return productos[0] || null;
}

// ── POST /recomendacion ───────────────────────────────────
app.post("/recomendacion", async (req, res) => {
  try {
    const { idUsuario, tipoPrenda } = req.body;

    const [respUsuario, respProductos] = await Promise.all([
      axios.get(`http://user-service:3001/usuarios/${idUsuario}`),
      axios.get("http://catalog-service:3002/productos")
    ]);

    const usuario   = respUsuario.data;
    const productos = respProductos.data;

    const { talla, razon, puntajes } = calcularTalla(
      usuario.busto,
      usuario.cintura,
      usuario.cadera
    );

    const producto = elegirProducto(productos, talla, tipoPrenda);

    res.json({
      usuario,
      tallaRecomendada: talla,
      razon,
      puntajes,
      tipoPrendaBuscado: tipoPrenda || null,
      producto
    });

  } catch (e) {
    res.status(500).json({ error: "Error en recomendación", detalle: e.message });
  }
});

app.listen(3003);