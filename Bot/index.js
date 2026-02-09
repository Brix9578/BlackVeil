const { Client, GatewayIntentBits } = require("discord.js");
const http = require("http");

// ===== LOGS DE DÉMARRAGE =====
console.log("🚀 Démarrage du bot BlackVeil");
console.log("🔑 DISCORD_TOKEN présent ?", !!process.env.DISCORD_TOKEN);

// ===== CLIENT DISCORD =====
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// ===== BOT PRÊT =====
client.once("ready", () => {
  console.log("🤖 Bot connecté avec succès :", client.user.tag);
});

// ===== ERREURS DISCORD =====
client.on("error", err => {
  console.error("❌ Erreur Discord :", err);
});

client.on("shardError", err => {
  console.error("❌ Shard error :", err);
});

// ===== CONNEXION DISCORD =====
console.log("📡 Connexion à Discord...");
client.login(process.env.DISCORD_TOKEN)
  .then(() => console.log("📡 Login envoyé"))
  .catch(err => {
    console.error("❌ Échec login Discord :", err);
    process.exit(1);
  });

// ===== SERVEUR HTTP (OBLIGATOIRE POUR RENDER) =====
const PORT = process.env.PORT || 3000;

http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Bot Discord BlackVeil en ligne");
}).listen(PORT, () => {
  console.log("🌍 Serveur HTTP actif sur le port", PORT);
});

