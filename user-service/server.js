const express  = require("express");
const mongoose = require("mongoose");
const jwt      = require("jsonwebtoken");
const bcrypt   = require("bcryptjs");

const app = express();
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "smartfit_secret_2025";

mongoose.connect("mongodb://mongodb:27017/tienda_db")
  .then(() => console.log("user-service conectado a MongoDB"))
  .catch(e => console.error("Error MongoDB:", e.message));

const UsuarioSchema = new mongoose.Schema({
  nombre:   String,
  correo:   { type: String, unique: true, sparse: true },
  password: String,
  busto:    Number,
  cintura:  Number,
  cadera:   Number,
  rol:      { type: String, default: "usuario" }
});

const Usuario = mongoose.model("Usuario", UsuarioSchema);

// ─── POST /register ───────────────────────────────────────
app.post("/register", async (req, res) => {
  try {
    const { nombre, correo, password, busto, cintura, cadera } = req.body;
    if (!nombre || !correo || !password)
      return res.status(400).json({ error: "nombre, correo y password son obligatorios" });

    const existe = await Usuario.findOne({ correo });
    if (existe) return res.status(409).json({ error: "El correo ya está registrado" });

    const hash    = await bcrypt.hash(password, 10);
    const usuario = new Usuario({ nombre, correo, password: hash, busto, cintura, cadera });
    await usuario.save();

    const token = jwt.sign({ id: usuario._id, correo, rol: usuario.rol }, JWT_SECRET, { expiresIn: "8h" });
    res.json({ token, usuario: { _id: usuario._id, nombre, correo, busto, cintura, cadera, rol: usuario.rol } });
  } catch (e) {
    console.error("/register error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// ─── POST /login ──────────────────────────────────────────
app.post("/login", async (req, res) => {
  try {
    const { correo, password } = req.body;
    if (!correo || !password)
      return res.status(400).json({ error: "correo y password son obligatorios" });

    const usuario = await Usuario.findOne({ correo });
    if (!usuario) return res.status(404).json({ error: "Usuaria no encontrada" });

    const ok = await bcrypt.compare(password, usuario.password);
    if (!ok) return res.status(401).json({ error: "Contraseña incorrecta" });

    const token = jwt.sign({ id: usuario._id, correo, rol: usuario.rol }, JWT_SECRET, { expiresIn: "8h" });
    // Devolver medidas en el login para que el frontend las tenga disponibles
    res.json({
      token,
      usuario: {
        _id:    usuario._id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        busto:  usuario.busto,
        cintura:usuario.cintura,
        cadera: usuario.cadera,
        rol:    usuario.rol
      }
    });
  } catch (e) {
    console.error("/login error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// ─── GET /usuarios  (usado por admin y recommendation) ────
app.get("/usuarios", async (req, res) => {
  try {
    res.json(await Usuario.find().select("-password"));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── GET /usuarios/:id  (usado por recommendation-service) 
app.get("/usuarios/:id", async (req, res) => {
  try {
    const u = await Usuario.findById(req.params.id).select("-password");
    if (!u) return res.status(404).json({ error: "Usuaria no encontrada" });
    res.json(u);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── POST /usuarios  (retrocompatible, sin password) ──────
app.post("/usuarios", async (req, res) => {
  try {
    const usuario = new Usuario(req.body);
    await usuario.save();
    res.json(usuario);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(3001, () => console.log("user-service corriendo en :3001"));