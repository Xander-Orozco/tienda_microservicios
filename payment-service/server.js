const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

mongoose.connect("mongodb://mongodb:27017/tienda_db");

const PagoSchema = new mongoose.Schema({
  idUsuario:String,
  monto:Number,
  estado:String,
  fecha:{ type:Date, default:Date.now }
});

const Pago = mongoose.model("Pago", PagoSchema);

app.post("/pagar", async (req,res)=>{

  const pago = new Pago({
    idUsuario:req.body.idUsuario,
    monto:req.body.monto,
    estado:"aprobado"
  });

  await pago.save();

  res.json(pago);
});

app.get("/pagos", async (req,res)=>{
  res.json(await Pago.find());
});

app.listen(3005);