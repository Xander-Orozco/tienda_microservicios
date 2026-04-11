const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

app.post("/recommendation", async (req, res) => {
  try {
    const { userId } = req.body;

    // 🔹 Obtener usuario por ID
    const userResponse = await axios.get(
      `http://user-service:3001/users/${userId}`
    );

    const user = userResponse.data;

    // 🔹 Obtener productos
    const productResponse = await axios.get(
      "http://catalog-service:3002/products"
    );

    const products = productResponse.data;

    // 🔹 Lógica "inteligente" basada en busto (simple pero válida)
    let recommendedSize = "M";

    if (user.bust < 85) recommendedSize = "S";
    else if (user.bust >= 85 && user.bust <= 95) recommendedSize = "M";
    else recommendedSize = "L";

    // 🔹 Filtrar productos por talla
    const filtered = products.filter(p => p.size === recommendedSize);

    const recommendation = filtered[0] || products[0];

    res.json({
      user,
      recommendedSize,
      recommendation
    });

  } catch (error) {
    console.error(error.message);

    res.status(500).json({
      error: "Error en recommendation-service"
    });
  }
});

app.listen(3003, () => {
  console.log("Recommendation service running on 3003");
});