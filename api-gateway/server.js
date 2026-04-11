const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

// USERS
app.get("/users", async (req, res) => {
  const response = await axios.get("http://user-service:3001/users");
  res.json(response.data);
});

app.post("/users", async (req, res) => {
  const response = await axios.post("http://user-service:3001/users", req.body);
  res.json(response.data);
});

// PRODUCTS
app.get("/products", async (req, res) => {
  const response = await axios.get("http://catalog-service:3002/products");
  res.json(response.data);
});

// RECOMMENDATION
app.post("/recommendation", async (req, res) => {
  const response = await axios.post(
    "http://recommendation-service:3003/recommendation",
    req.body
  );
  res.json(response.data);
});

app.listen(3000, () => {
  console.log("API Gateway running on 3000");
});