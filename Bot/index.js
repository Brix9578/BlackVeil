const express = require("express");
const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require("discord.js");

console.log("🚀 index.js démarré");
console.log("🔑 TOKEN PRESENT ?", !!process.env.DISCORD_TOKEN);

// 🌐 Serveur HTTP
const app = express();
app.use(express.json());

// 🤖 Client Discord
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// ✅ Bot prêt
client.once("ready", () => {
  console.log("🤖 Bot connecté :", client.user.tag);
});

// 📩 Réception contrat
app.post("/contract", async (req, res) => {
  try {
    console.log("📩 Données reçues :", req.body);

    const { joueur, mission, prix, detail, channelId } = req.body;

    if (!joueur || !mission || !prix || !detail || !channelId) {
      return res.status(400).send("❌ Données manquantes");
    }

    const channel = await client.channels.fetch(1469524090946846904);

    if (!channel || !channel.isTextBased()) {
      return res.status(404).send("❌ Salon introuvable ou invalide");
    }

    const embed = new EmbedBuilder()
      .setTitle("📄 Nouvelle demande de contrat")
      .addFields(
        { name: "👤 Joueur", value: joueur, inline: true },
        { name: "🎯 Mission", value: mission, inline: true },
        { name: "💰 Prix", value: prix, inline: true },
        { name: "📄 Détail", value: detail, inline: false }
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

    res.status(200).send("✅ Contrat envoyé sur Discord");
  } catch (err) {
    console.error("❌ Erreur contrat :", err);
    res.status(500).send("Erreur serveur");
  }
});

// 🎯 Boutons
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

// 🌐 Lancement serveur
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log("🌐 Serveur actif sur le port", PORT);
});

// 🔌 Connexion Discord
console.log("📡 Connexion Discord...");
client.login(process.env.DISCORD_TOKEN);
