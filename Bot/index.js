// ================== CONFIG ==================
const CHANNEL_ID = "1469524090946846904";

// ================== IMPORTS =================
const express = require("express");
const app = express();

// ✅ HEADERS CORS MANUELS (OBLIGATOIRE)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "https://brix9578.github.io");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // ✅ Répond aux preflight (OPTIONS)
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

app.use(express.json());

const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require("discord.js");

// ================== LOGS ====================
console.log("🚀 index.js démarré");
console.log("🔑 TOKEN PRESENT ?", !!process.env.DISCORD_TOKEN);

// ================== DISCORD CLIENT ==========
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages
  ]
});

// ✅ Bot prêt
client.once("ready", () => {
  console.log("🤖 Bot connecté :", client.user.tag);
});

// ================== ROUTE CONTRACT ==========
app.post("/contract", async (req, res) => {
  console.log("📩 /contract HIT");
  console.log("📦 BODY:", req.body);

  try {

    // 🕶️ Génération dossier Black Veil
    const year = new Date().getFullYear();
    const random = Math.floor(10000 + Math.random() * 90000);
    const dossier = `BV-${year}-${random}`;

    const {
      demandeur_nom,
      demandeur_tel,
      type_contrat,
      raison,
      cible_nom,
      cible_tel,
      cible_desc
    } = req.body;

    if (!demandeur_nom || !demandeur_tel || !type_contrat || !raison) {
      return res.status(400).json({ error: "Champs demandeur manquants" });
    }

    if (!client.isReady()) {
      return res.status(503).json({ error: "Bot Discord pas prêt" });
    }

    // suite du code…

    const channel = await client.channels.fetch(CHANNEL_ID);

    if (!channel || !channel.isTextBased()) {
      return res.status(404).json({ error: "Salon Discord introuvable" });
    }

    const dossier = `BV-${Math.floor(100000 + Math.random() * 900000)}`;
    
    // 📦 Embed Discord
  const embed = new EmbedBuilder()
  .setTitle("📄 Nouvelle demande de contrat")
  .setColor(0x2b2d31)
  .addFields(
    { name: "📁 Dossier", value: `**${dossier}**`, inline: false },
    { name: "🧑 Demandeur", value: `${demandeur_nom} (${demandeur_tel})` },
    { name: "🎯 Cible", value: `${cible_nom} (${cible_tel})` },
    { name: "📜 Contrat", value: type_contrat },
    { name: "🧠 Motif", value: raison },
    {
      name: "🎯 Détails cible",
      value:
        `**Nom RP :** ${cible_nom || "Inconnu"}\n` +
        `**Contact RP :** ${cible_tel || "Inconnu"}\n` +
        `**Description :** ${cible_desc || "Aucune information"}`
    }
  )
  .setTimestamp();

    
    // 🎯 Boutons
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("accept")
        .setLabel("Accepter")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId("refuse")
        .setLabel("Refuser")
        .setStyle(ButtonStyle.Danger)
    );

 try {
  // ... ton code
  await channel.send({ embeds: [embed], components: [row] });

  return res.json({
    success: true,
    dossier: dossier
  });

} catch (err) {
  console.error("❌ Erreur /contract :", err);
  return res.status(500).json({ error: "Erreur serveur" });
}


// ================== INTERACTIONS ============
client.on("interactionCreate", async interaction => {
  if (!interaction.isButton()) return;

  if (interaction.customId === "accept") {
    await interaction.update({
      content: "✅ Contrat ACCEPTÉ",
      embeds: [],
      components: []
    });
  }

  if (interaction.customId === "refuse") {
    await interaction.update({
      content: "❌ Contrat REFUSÉ",
      embeds: [],
      components: []
    });
  }
});

// ================== START SERVEUR ===========
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log("🌐 Serveur actif sur le port", PORT);
});

// ================== LOGIN DISCORD ===========
console.log("📡 Connexion à Discord...");
client.login(process.env.DISCORD_TOKEN);

