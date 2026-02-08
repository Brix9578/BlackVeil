const express = require("express");
const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require("discord.js");

// 🚀 DÉMARRAGE
console.log("🚀 index.js démarré");
console.log("🔑 TOKEN PRESENT ?", !!process.env.DISCORD_TOKEN);

// 🌐 MINI SERVEUR
const app = express();
app.use(express.json());

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

// 📩 RÉCEPTION CONTRAT DEPUIS LE SITE
app.post("/contract", async (req, res) => {
  try {
    const { joueur, mission, prix, detail, channelId } = req.body;

    const channel = await client.channels.fetch(channelId);
    if (!channel) return res.status(404).send("Salon introuvable");

    const embed = new EmbedBuilder()
      .setTitle("📄 Nouvelle demande de contrat")
      .addFields(
        { name: "👤 Joueur", value: joueur || "N/A", inline: true },
        { name: "🎯 Mission", value: mission || "N/A", inline: true },
        { name: "💰 Prix", value: prix || "N/A", inline: true },
        { name: "📄 Détail", value: detail || "Aucun", inline: true }
      )
      .setColor(0x2b2d31)
      .setTimestamp();

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

    await channel.send({ embeds: [embed], components: [row] });

    res.status(200).send("Contrat envoyé sur Discord ✅");
  } catch (err) {
    console.error("❌ Erreur contrat :", err);
    res.status(500).send("Erreur serveur");
  }
});

// 🎯 BOUTONS DISCORD
client.on("interactionCreate", async (interaction) => {
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

// 🌐 SERVEUR HTTP (OBLIGATOIRE POUR RENDER)
const PORT = process.env.PORT || 10000;
app.get("/", (req, res) => {
  res.send("🤖 Bot Black Veil Agency en ligne");
});

app.listen(PORT, () => {
  console.log("🌐 Serveur HTTP actif sur le port", PORT);
});

// 🔌 CONNEXION DISCORD
console.log("📡 Tentative de connexion à Discord...");
client.login(process.env.DISCORD_TOKEN)
  .then(() => console.log("📡 Login envoyé à Discord"))
  .catch(err => console.error("❌ Erreur login Discord :", err));

client.on("error", err => {
  console.error("❌ Discord client error :", err);
});

client.on("shardError", err => {
  console.error("❌ Shard error :", err);
});
