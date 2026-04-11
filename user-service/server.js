const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

// 🔹 Conexión a MongoDB
mongoose.connect("mongodb://mongodb:27017/tienda_db")
  .then(() => console.log("MongoDB conectado"))
  .catch(err => console.log(err));

// 🔹 Esquema
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  bust: Number,
  waist: Number,
  hips: Number
});

const User = mongoose.model("User", UserSchema);

// 🔹 Obtener todos los usuarios
app.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
});

// 🔹 Obtener usuario por ID (CLAVE 🔥)
app.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Error al buscar usuario" });
  }
});

// 🔹 Crear usuario
app.post("/users", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Error al crear usuario" });
  }
});

app.listen(3001, () => {
  console.log("User service running on 3001");
});