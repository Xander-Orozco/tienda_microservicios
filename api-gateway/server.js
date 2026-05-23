const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ─── AUTH ─────────────────────────────────────────────────
app.post("/login", async (req, res) => {
  try { res.json((await axios.post("http://user-service:3001/login", req.body)).data); }
  catch (e) { res.status(e.response?.status||500).json(e.response?.data||{error:"Error"}); }
});

app.post("/register", async (req, res) => {
  try { res.json((await axios.post("http://user-service:3001/register", req.body)).data); }
  catch (e) { res.status(e.response?.status||500).json(e.response?.data||{error:"Error"}); }
});

// ─── USUARIOS ─────────────────────────────────────────────
app.get("/usuarios", async (req, res) => {
  try { res.json((await axios.get("http://user-service:3001/usuarios")).data); }
  catch (e) { res.status(500).json({error:"Error"}); }
});

app.post("/usuarios", async (req, res) => {
  try { res.json((await axios.post("http://user-service:3001/usuarios", req.body)).data); }
  catch (e) { res.status(500).json({error:"Error"}); }
});

// ─── USUARIO POR ID (usado por frontend para refrescar sesión) ─
app.get("/usuarios/:id", async (req, res) => {
  try { res.json((await axios.get(`http://user-service:3001/usuarios/${req.params.id}`)).data); }
  catch (e) { res.status(e.response?.status||500).json(e.response?.data||{error:"Error"}); }
});

// ─── PRODUCTOS ────────────────────────────────────────────
app.get("/productos", async (req, res) => {
  try { res.json((await axios.get("http://catalog-service:3002/productos")).data); }
  catch (e) { res.status(500).json({error:"Error"}); }
});

app.post("/productos", async (req, res) => {
  try { res.json((await axios.post("http://catalog-service:3002/productos", req.body)).data); }
  catch (e) { res.status(500).json({error:"Error"}); }
});

app.patch("/productos/:id/stock", async (req, res) => {
  try { res.json((await axios.patch(`http://catalog-service:3002/productos/${req.params.id}/stock`, req.body)).data); }
  catch (e) { res.status(500).json({error:"Error"}); }
});

// ─── RECOMENDACIÓN ────────────────────────────────────────
app.post("/recomendacion", async (req, res) => {
  try { res.json((await axios.post("http://recommendation-service:3003/recomendacion", req.body)).data); }
  catch (e) { res.status(500).json({error:"Error"}); }
});

// ─── CARRITO ──────────────────────────────────────────────
app.get("/carrito/:idUsuario", async (req, res) => {
  try { res.json((await axios.get(`http://cart-service:3004/carrito/${req.params.idUsuario}`)).data); }
  catch (e) { res.status(500).json({error:"Error"}); }
});

app.post("/carrito", async (req, res) => {
  try { res.json((await axios.post("http://cart-service:3004/carrito", req.body)).data); }
  catch (e) { res.status(500).json({error:"Error"}); }
});

app.delete("/carrito/:idUsuario", async (req, res) => {
  try { res.json((await axios.delete(`http://cart-service:3004/carrito/${req.params.idUsuario}`)).data); }
  catch (e) { res.status(500).json({error:"Error"}); }
});

// ─── PAGOS ────────────────────────────────────────────────
app.post("/pagar", async (req, res) => {
  try { res.json((await axios.post("http://payment-service:3005/pagar", req.body)).data); }
  catch (e) { res.status(500).json({error:"Error"}); }
});

app.get("/pagos", async (req, res) => {
  try { res.json((await axios.get("http://payment-service:3005/pagos")).data); }
  catch (e) { res.status(500).json({error:"Error"}); }
});

// ─── CHATBOT (con fallback local si no hay créditos) ──────
app.post("/chat", async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY || "";

  // Intentar con Anthropic si hay key válida
  if (apiKey && apiKey.startsWith("sk-ant-")) {
    try {
      const r = await axios.post("https://api.anthropic.com/v1/messages", req.body, {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01"
        }
      });
      return res.json(r.data);
    } catch (e) {
      console.log("Anthropic falló, usando modo local:", e.response?.data?.error?.type);
    }
  }

  // ── MODO LOCAL: respuestas basadas en reglas ───────────
  const messages = req.body.messages || [];
  const lastMsg  = (messages[messages.length - 1]?.content || "").toLowerCase();

  let productos = [];
  try {
    const catResp = await axios.get("http://catalog-service:3002/productos");
    productos = catResp.data || [];
  } catch {}

  let reply = "";
  const disponibles = productos.filter(p => p.stock > 0);

  if (/talla|medida|busto|cintura|cadera|talle/.test(lastMsg)) {
    reply = "Para recomendarte la talla ideal necesito tus medidas 📏\n• S = busto < 85cm\n• M = busto 85–95cm\n• L = busto > 95cm\n\nUsá la sección \"Talla Ideal\" del menú para una recomendación personalizada con tus tres medidas.";

  } else if (/blusa/.test(lastMsg)) {
    const found = disponibles.filter(p => p.nombre?.toLowerCase().includes("blusa"));
    reply = found.length
      ? `Tenemos ${found.length} blusa(s) disponibles 👚 La más destacada: "${found[0].nombre}" talla ${found[0].talla} por $${found[0].precio?.toLocaleString()}.`
      : "No tenemos blusas en stock ahora mismo, pero revisá el catálogo completo 🛍";

  } else if (/vestido/.test(lastMsg)) {
    const found = disponibles.filter(p => p.nombre?.toLowerCase().includes("vestido"));
    reply = found.length
      ? `Tenemos ${found.length} vestido(s) disponibles 👗 "${found[0].nombre}" talla ${found[0].talla} por $${found[0].precio?.toLocaleString()}.`
      : "No hay vestidos disponibles ahora. ¡Explorá el catálogo para ver todas las opciones!";

  } else if (/jean|pantalon|pantalón/.test(lastMsg)) {
    const found = disponibles.filter(p => /jean|pantalon/.test(p.nombre?.toLowerCase()));
    reply = found.length
      ? `Tenemos ${found.length} pantalón(es) disponibles 👖 "${found[0].nombre}" talla ${found[0].talla} por $${found[0].precio?.toLocaleString()}.`
      : "No hay pantalones en stock actualmente. ¡Volvé pronto!";

  } else if (/precio|barato|económico|economico|caro|cuesta/.test(lastMsg)) {
    const ordenados = [...disponibles].sort((a, b) => a.precio - b.precio);
    reply = ordenados.length
      ? `La opción más accesible es "${ordenados[0].nombre}" (talla ${ordenados[0].talla}) por $${ordenados[0].precio?.toLocaleString()} 💰`
      : "Pasate por el catálogo para ver todos nuestros precios 🏷";

  } else if (/catálogo|catalogo|qué tienen|que tienen|disponible|stock|prendas/.test(lastMsg)) {
    reply = disponibles.length
      ? `Tenemos ${disponibles.length} prenda(s) disponibles ✨ Incluye: ${disponibles.slice(0,3).map(p => p.nombre).join(", ")}${disponibles.length > 3 ? " y más" : ""}. ¡Explorá el catálogo!`
      : "Estamos actualizando el catálogo. ¡Volvé pronto! 🌸";

  } else if (/pag|compr|tarjeta|carrito/.test(lastMsg)) {
    reply = "El proceso de pago es muy sencillo 💳 Agregá prendas al carrito y finalizá la compra desde ahí. Es un pago simulado, completamente seguro para probar.";

  } else if (/devoluci|cambio/.test(lastMsg)) {
    reply = "¡Con SmartFit no necesitás devolver nada! 😊 Nuestro sistema analiza tu busto, cintura y cadera para recomendarte la talla exacta. ¿Querés probarlo en \"Talla Ideal\"?";

  } else if (/hola|buenas|hey|cómo|como estás|que tal|buen/.test(lastMsg)) {
    reply = `¡Hola! 👗 Bienvenida a SmartFit Fashion. Tenemos ${disponibles.length} prenda(s) hoy. Puedo ayudarte a encontrar tu talla ideal, buscar prendas o resolver dudas sobre la compra. ¿Por dónde empezamos?`;

  } else if (/graci|ok|genial|perfecto|gracias/.test(lastMsg)) {
    reply = "¡De nada! 🌸 Si necesitás algo más, acá estoy. ¡Que disfrutes tu compra!";

  } else {
    reply = `Puedo ayudarte con: buscar prendas, recomendarte tu talla ideal o info sobre el pago 😊 Tenemos ${disponibles.length} prenda(s) disponibles hoy. ¿Qué necesitás?`;
  }

  res.json({ content: [{ type: "text", text: reply }] });
});

app.listen(3000, () => console.log("api-gateway en :3000"));