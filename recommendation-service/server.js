const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

app.post("/recomendacion", async (req,res)=>{

  const { idUsuario } = req.body;

  const respuestaUsuario =
    await axios.get(`http://user-service:3001/usuarios/${idUsuario}`);

  const usuario = respuestaUsuario.data;

  const respuestaProductos =
    await axios.get("http://catalog-service:3002/productos");

  const productos = respuestaProductos.data;

  let talla = "M";

  if(usuario.busto < 85) talla = "S";
  else if(usuario.busto > 95) talla = "L";

  const producto = productos.find(p => p.talla === talla) || productos[0];

  res.json({
    usuario,
    tallaRecomendada: talla,
    producto
  });

});

app.listen(3003);