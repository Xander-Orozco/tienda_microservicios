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

app.get("/productos", async (req, res) => {
  res.json(await Producto.find());
});

app.post("/productos", async (req, res) => {
  const producto = new Producto(req.body);
  await producto.save();
  res.json(producto);
});

// Descontar stock después de un pago
app.patch("/productos/:id/stock", async (req, res) => {
  const { cantidad } = req.body;
  const producto = await Producto.findById(req.params.id);
  if (!producto) return res.status(404).json({ error: "Producto no encontrado" });
  producto.stock = Math.max(0, (producto.stock || 0) - (cantidad || 1));
  await producto.save();
  res.json(producto);
});

app.listen(3002, () => console.log("catalog-service en :3002"));