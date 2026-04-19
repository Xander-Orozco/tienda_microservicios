const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

mongoose.connect("mongodb://mongodb:27017/tienda_db");

const UsuarioSchema = new mongoose.Schema({
  nombre: String,
  correo: String,
  busto: Number,
  cintura: Number,
  cadera: Number
});

const Usuario = mongoose.model("Usuario", UsuarioSchema);

app.get("/usuarios", async (req,res)=>{
  res.json(await Usuario.find());
});

app.get("/usuarios/:id", async (req,res)=>{
  res.json(await Usuario.findById(req.params.id));
});

app.post("/usuarios", async (req,res)=>{
  const usuario = new Usuario(req.body);
  await usuario.save();
  res.json(usuario);
});

app.listen(3001);