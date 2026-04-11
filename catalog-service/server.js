const express = require("express");

const app = express();

const products = [
  { id: 1, name: "Camiseta Oversize", price: 20, size: "M" },
  { id: 2, name: "Jeans Slim Fit", price: 45, size: "32" },
  { id: 3, name: "Chaqueta Denim", price: 60, size: "L" }
];

app.get("/products", (req, res) => {
  res.json(products);
});

app.listen(3002, () => {
  console.log("Catalog service running on 3002");
});