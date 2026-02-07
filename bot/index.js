const express = require("express");
const app = express();

app.use(express.json());

// juste pour tester l’URL
app.get("/", (req, res) => {
  res.send("Bot Black Veil Agency en ligne");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Serveur actif sur le port " + PORT);
});
