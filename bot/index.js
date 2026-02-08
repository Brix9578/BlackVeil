const express = require("express");
const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require("discord.js");

const app = express();
app.use(express.json());

// ===== DISCORD BOT =====
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once("ready", () => {
  console.log("🤖 Bot Discord connecté");
});

client.login(process.env.DISCORD_TOKEN);

// ===== ROUTES WEB =====
app.get("/", (req, res) => {
  res.send("Bot Black Veil Agency en ligne");
});

// Réception contrat depuis le site

app.post("/new-contract", async (req, res) => {
  try {
    console.log("📩 Nouveau contrat reçu :", req.body);

    const channel = await client.channels.fetch("1469524090946846904");
    if (!channel) {
      return res.status(500).json({ error: "Salon introuvable" });
    }

    const embed = new EmbedBuilder()
      .setTitle("📩 Nouveau contrat RP")
      .addFields(
        { name: "Nom RP", value: req.body.nom || "?" },
        { name: "Contact", value: req.body.contact || "?" },
        { name: "Type", value: req.body.type || "?" },
        { name: "Détails", value: req.body.details || "Aucun" }
      )
      .setColor(0x00ff88);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("accept")
        .setLabel("✅ Accepter")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId("refuse")
        .setLabel("❌ Refuser")
        .setStyle(ButtonStyle.Danger)
    );

    await channel.send({ embeds: [embed], components: [row] });
    res.json({ status: "ok" });

  } catch (err) {
    console.error("❌ Erreur envoi Discord :", err);
    res.status(500).json({ error: "Erreur Discord" });
  }
});


