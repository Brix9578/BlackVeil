// ================== CONFIG ==================
const CHANNEL_ID = "1469524090946846904";
const ARCHIVE_CHANNEL_ID = "1470904139008446485";

// ================== IMPORTS =================
const express = require("express");
const app = express();

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "https://brix9578.github.io");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

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

// ================== DISCORD CLIENT ==========
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

client.once("ready", () => {
  console.log("🤖 Bot connecté :", client.user.tag);
});

// ================== ROUTE CONTRACT ==========
app.post("/contract", async (req, res) => {
  try {
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

    const channel = await client.channels.fetch(CHANNEL_ID);

    const embed = new EmbedBuilder()
      .setTitle("📄 Nouvelle demande de contrat")
      .setColor(0x2b2d31)
      .setDescription(
`📁 **Dossier**
**${dossier}**

🧑 **Demandeur**
**Nom RP :** ${demandeur_nom}
**Contact RP :** ${demandeur_tel}

🎯 **Cible**
**Nom RP :** ${cible_nom || "Inconnu"}
**Contact RP :** ${cible_tel || "Inconnu"}
**Description :** ${cible_desc || "Aucune information"}

📜 **Contrat**
**Type :** ${type_contrat}

🧠 **Motif**
${raison}`
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
    return res.json({ success: true, dossier });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

// ================== INTERACTIONS ============
client.on("interactionCreate", async interaction => {
  if (!interaction.isButton()) return;
  if (!["accept", "refuse"].includes(interaction.customId)) return;

  const archiveChannel = interaction.guild.channels.cache.get(ARCHIVE_CHANNEL_ID);
  const accepted = interaction.customId === "accept";

  // 📦 Envoi dans les archives
  await archiveChannel.send({
    content: `📁 **Dossier ${accepted ? "ACCEPTÉ ✅" : "REFUSÉ ❌"}**
👮 Staff : ${interaction.user}`,
    embeds: interaction.message.embeds
  });

  // 🔒 Désactiver les boutons
  const disabledRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel("Accepté ✅")
      .setStyle(ButtonStyle.Success)
      .setDisabled(true),
    new ButtonBuilder()
      .setLabel("Refusé ❌")
      .setStyle(ButtonStyle.Danger)
      .setDisabled(true)
  );

  // 🧾 Modifier le message original (sans supprimer)
  await interaction.update({
    content: `📌 **Dossier ${accepted ? "accepté" : "refusé"}**`,
    components: [disabledRow]
  });
});

// ================== START ===================
const PORT = process.env.PORT || 8080;
app.listen(PORT, () =>
  console.log("🌐 Serveur actif sur le port", PORT)
);

client.login(process.env.DISCORD_TOKEN);

