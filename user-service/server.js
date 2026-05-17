const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "smartfit_secret_2025";

mongoose.connect("mongodb://mongodb:27017/tienda_db");

const UsuarioSchema = new mongoose.Schema({
  nombre:   String,
  correo:   String,
  password: String,
  rol:      { type: String, default: "usuario" },
  busto:    Number,
  cintura:  Number,
  cadera:   Number
});

const Usuario = mongoose.model("Usuario", UsuarioSchema);

// ── Middleware auth ───────────────────────────────────────
function auth(req, res, next) {
  const header = req.headers["authorization"];
  if (!header) return res.status(401).json({ error: "Sin token" });
  const token = header.split(" ")[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Token inválido" });
  }
}

// ── REGISTER ──────────────────────────────────────────────
app.post("/register", async (req, res) => {
  const { nombre, correo, password, busto, cintura, cadera, rol } = req.body;
  if (!correo || !password)
    return res.status(400).json({ error: "Correo y password requeridos" });

  const existe = await Usuario.findOne({ correo });
  if (existe) return res.status(409).json({ error: "Correo ya registrado" });

  const usuario = new Usuario({
    nombre, correo, password,
    busto, cintura, cadera,
    rol: rol || "usuario"
  });
  await usuario.save();

  const token = jwt.sign(
    { id: usuario._id, correo, rol: usuario.rol },
    JWT_SECRET,
    { expiresIn: "8h" }
  );
  res.json({
    token,
    usuario: { id: usuario._id, nombre, correo, rol: usuario.rol }
  });
});

// ── LOGIN ─────────────────────────────────────────────────
app.post("/login", async (req, res) => {
  const { correo, password } = req.body;
  const usuario = await Usuario.findOne({ correo, password });
  if (!usuario)
    return res.status(401).json({ error: "Credenciales incorrectas" });

  const token = jwt.sign(
    { id: usuario._id, correo, rol: usuario.rol },
    JWT_SECRET,
    { expiresIn: "8h" }
  );
  res.json({
    token,
    usuario: { id: usuario._id, nombre: usuario.nombre, correo, rol: usuario.rol }
  });
});

// ── USUARIOS ──────────────────────────────────────────────
app.get("/usuarios", auth, async (req, res) => {
  res.json(await Usuario.find({}, "-password"));
});

app.get("/usuarios/:id", async (req, res) => {
  res.json(await Usuario.findById(req.params.id, "-password"));
});

app.post("/usuarios", async (req, res) => {
  const usuario = new Usuario(req.body);
  await usuario.save();
  res.json(usuario);
});

app.listen(3001);