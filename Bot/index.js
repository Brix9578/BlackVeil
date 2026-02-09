const express = require("express");
const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require("discord.js");

// =====================
// CONFIG
// =====================
const PORT = process.env.PORT || 8080;
const CHANNEL_ID = "MET_ICI_L_ID_DU_SALON"; // 👈 OBLIGATOIRE

// =====================
// APP EXPRESS
// =====================
const app = express();
app.use(express.json());

// =====================
// CLIENT DISCORD
// =====================
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

console.log("🚀 index.js démarré");
console.log("🔑 TOKEN PRESENT ?", !!process.env.DISCORD_TOKEN);

// =====================
// BOT READY
// =====================
client.once("ready", () => {
  console.log(`🤖 Bot connecté : ${client.user.tag}`);
});

// =====================
// RÉCEPTION CONTRAT
// =====================
app.post("/contract", async (req, res) => {
  try {
    const {
      demandeur_nom,
      demandeur_tel,
      type_contrat,
      raison,
      cible_nom,
      cible_tel,
      cible_desc
    } = req.body;

    const channel = await client.channels.fetch(CHANNEL_ID);
    if (!channel) {
      return res.status(404).send("Salon introuvable");
    }

    const embed = new EmbedBuilder()
      .setTitle("📄 Nouvelle demande de contrat")
      .setColor(0x2b2d31)
      .addFields(
        { name: "👤 Demandeur", value: demandeur_nom || "N/A", inline: true },
        { name: "📞 Téléphone", value: demandeur_tel || "N/A", inline: true },
        { name: "🎯 Type", value: type_contrat || "N/A", inline: true },

        { name: "📝 Raison", value: raison || "N/A" },

        { name: "🎯 Cible", value: cible_nom || "Inconnue", inline: true },
        { name: "📱 Tel cible", value: cible_tel || "N/A", inline: true },
        { name: "👕 Description", value: cible_desc || "Aucune info" }
      )
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

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Erreur contrat :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// =====================
// INTERACTIONS BOUTONS
// =====================
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;

  if (interaction.customId === "accept") {
    await interaction.update({
      content: "✅ **Contrat ACCEPTÉ**",
      embeds: [],
      components: []
    });
  }

  if (interaction.customId === "refuse") {
    await interaction.update({
      content: "❌ **Contrat REFUSÉ**",
      embeds: [],
      components: []
    });
  }
});

// =====================
// LANCEMENT
// =====================
app.listen(PORT, () => {
  console.log(`🌐 Serveur actif sur le port ${PORT}`);
});

client.login(process.env.DISCORD_TOKEN)
  .then(() => console.log("📡 Connexion Discord envoyée"))
  .catch(err => console.error("❌ Erreur login Discord :", err));

