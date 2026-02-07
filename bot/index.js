const express = require("express");
const app = express();

app.use(express.json());

// test simple
app.get("/", (req, res) => {
  res.send("Bot Black Veil Agency en ligne");
});

// 🔔 réception d’un contrat depuis le site
app.post("/new-contract", (req, res) => {
  console.log("📩 Nouveau contrat reçu :", req.body);

  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Serveur actif sur le port " + PORT);
});


