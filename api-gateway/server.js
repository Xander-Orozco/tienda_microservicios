const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

// Usuarios
app.get("/usuarios", async(req,res)=>{
 res.json((await axios.get("http://user-service:3001/usuarios")).data);
});

app.post("/usuarios", async(req,res)=>{
 res.json((await axios.post("http://user-service:3001/usuarios",req.body)).data);
});

// Productos
app.get("/productos", async(req,res)=>{
 res.json((await axios.get("http://catalog-service:3002/productos")).data);
});

app.post("/productos", async(req,res)=>{
 res.json((await axios.post("http://catalog-service:3002/productos",req.body)).data);
});

// Recomendacion
app.post("/recomendacion", async(req,res)=>{
 res.json((await axios.post("http://recommendation-service:3003/recomendacion",req.body)).data);
});

// Carrito
app.get("/carrito/:idUsuario", async(req,res)=>{
 res.json((await axios.get(`http://cart-service:3004/carrito/${req.params.idUsuario}`)).data);
});

app.post("/carrito", async(req,res)=>{
 res.json((await axios.post("http://cart-service:3004/carrito",req.body)).data);
});

// Pagos
app.post("/pagar", async(req,res)=>{
 res.json((await axios.post("http://payment-service:3005/pagar",req.body)).data);
});

app.get("/pagos", async(req,res)=>{
 res.json((await axios.get("http://payment-service:3005/pagos")).data);
});

app.listen(3000);