const { Client, GatewayIntentBits } = require("discord.js");

// 🚀 DÉMARRAGE
console.log("🚀 index.js démarré");
console.log("🔑 TOKEN PRESENT ?", !!process.env.DISCORD_TOKEN);

// 🤖 CLIENT DISCORD
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds
  ]
});

// ✅ BOT CONNECTÉ
client.once("ready", () => {
  console.log("🤖 Bot Discord connecté :", client.user.tag);
});

// 🔌 CONNEXION DISCORD
console.log("📡 Tentative de connexion à Discord...");
client.login(process.env.DISCORD_TOKEN)
  .then(() => console.log("📡 Login envoyé à Discord"))
  .catch(err => console.error("❌ Erreur login Discord :", err));
