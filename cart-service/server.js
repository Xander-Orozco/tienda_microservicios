const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

mongoose.connect("mongodb://mongodb:27017/tienda_db");

const CarritoSchema = new mongoose.Schema({
  idUsuario: String,
  productos: Array
});

const Carrito = mongoose.model("Carrito", CarritoSchema);

// Ver carrito de un usuario
app.get("/carrito/:idUsuario", async (req, res) => {
  const c = await Carrito.findOne({ idUsuario: req.params.idUsuario });
  res.json(c || { idUsuario: req.params.idUsuario, productos: [] });
});

// Agregar producto al carrito
app.post("/carrito", async (req, res) => {
  const { idUsuario, idProducto, cantidad } = req.body;
  let carrito = await Carrito.findOne({ idUsuario });
  if (!carrito) {
    carrito = new Carrito({ idUsuario, productos: [] });
  }
  // Si el producto ya existe, sumar cantidad
  const existente = carrito.productos.find(p => p.idProducto === idProducto);
  if (existente) {
    existente.cantidad = (existente.cantidad || 1) + (cantidad || 1);
    carrito.markModified("productos");
  } else {
    carrito.productos.push({ idProducto, cantidad: cantidad || 1 });
  }
  await carrito.save();
  res.json(carrito);
});

// Vaciar carrito (después del pago)
app.delete("/carrito/:idUsuario", async (req, res) => {
  await Carrito.findOneAndUpdate(
    { idUsuario: req.params.idUsuario },
    { $set: { productos: [] } }
  );
  res.json({ ok: true, mensaje: "Carrito vaciado" });
});

app.listen(3004, () => console.log("cart-service en :3004"));