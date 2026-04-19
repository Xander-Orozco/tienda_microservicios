const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

mongoose.connect("mongodb://mongodb:27017/tienda_db");

const ProductoSchema = new mongoose.Schema({
  nombre: String,
  precio: Number,
  talla: String,
  stock: Number
});

const Producto = mongoose.model("Producto", ProductoSchema);

app.get("/productos", async (req,res)=>{
  res.json(await Producto.find());
});

app.post("/productos", async (req,res)=>{
  const producto = new Producto(req.body);
  await producto.save();
  res.json(producto);
});

app.listen(3002);