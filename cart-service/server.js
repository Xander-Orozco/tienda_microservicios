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

app.get("/carrito/:idUsuario", async (req,res)=>{
  res.json(await Carrito.findOne({idUsuario:req.params.idUsuario}));
});

app.post("/carrito", async (req,res)=>{

  const { idUsuario, idProducto, cantidad } = req.body;

  let carrito = await Carrito.findOne({idUsuario});

  if(!carrito){
    carrito = new Carrito({
      idUsuario,
      productos:[]
    });
  }

  carrito.productos.push({
    idProducto,
    cantidad
  });

  await carrito.save();

  res.json(carrito);
});

app.listen(3004);