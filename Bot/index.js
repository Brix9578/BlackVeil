// ================== CONFIG ==================
const CHANNEL_ID = "1469524090946846904";
const ARCHIVE_CHANNEL_ID = "1470904139008446485";

// ================== IMPORTS =================
const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();

const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require("discord.js");

// ================== EXPRESS =================
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// ================== DISCORD CLIENT ==========
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

client.once("ready", () => {
  console.log("🤖 Bot connecté :", client.user.tag);
});

// ================== DOSSIERS =================
const DOSSIER_PATH = path.join(__dirname, "dossiers.json");

function loadDossiers() {
  if (!fs.existsSync(DOSSIER_PATH)) {
    fs.writeFileSync(DOSSIER_PATH, "{}");
  }
  return JSON.parse(fs.readFileSync(DOSSIER_PATH, "utf8"));
}

function saveDossiers(data) {
  fs.writeFileSync(DOSSIER_PATH, JSON.stringify(data, null, 2));
}

// ================== ROUTE ENVOI DOSSIER =====
app.post("/contract", async (req, res) => {
  try {
    const year = new Date().getFullYear();
    const random = Math.floor(10000 + Math.random() * 90000);
    const dossierId = `BV-${year}-${random}`;

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
      return res.status(400).json({ error: "Champs manquants" });
    }

    const dossiers = loadDossiers();
    dossiers[dossierId] = {
      statut: "en_attente",
      demandeur_nom,
      demandeur_tel,
      type_contrat,
      raison,
      date: new Date().toISOString()
    };
    saveDossiers(dossiers);

    const channel = await client.channels.fetch(CHANNEL_ID);

    const embed = new EmbedBuilder()
      .setTitle("📄 Nouvelle demande de contrat")
      .setColor(0x2b2d31)
      .setDescription(
`📁 **Dossier**
**${dossierId}**

🧑 **Demandeur**
${demandeur_nom} — ${demandeur_tel}

🎯 **Cible**
${cible_nom || "Inconnu"} — ${cible_tel || "Inconnu"}
${cible_desc || "Aucune info"}

📜 **Type**
${type_contrat}

🧠 **Motif**
${raison}`
      )
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`accept_${dossierId}`)
        .setLabel("Accepter")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`refuse_${dossierId}`)
        .setLabel("Refuser")
        .setStyle(ButtonStyle.Danger)
    );

    await channel.send({ embeds: [embed], components: [row] });

    res.json({ success: true, dossier: dossierId });

  } catch (err) {
    console.error("Erreur /contract :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ================== ROUTE SUIVI DOSSIER ======
app.get("/suivi", (req, res) => {
  const { ref } = req.query;

  if (!ref) {
    return res.json({ success: false, message: "Numéro manquant" });
  }

  const dossiers = loadDossiers();
  const dossier = dossiers[ref];

  if (!dossier) {
    return res.json({ success: false, message: "Dossier introuvable" });
  }

  let status = "🟡 EN ATTENTE";
  if (dossier.statut === "accepte") status = "🟢 ACCEPTE";
  if (dossier.statut === "refuse") status = "🔴 REFUSE";

  res.json({
    success: true,
    ref,
    status
  });
});

// ================== INTERACTIONS DISCORD =====
client.on("interactionCreate", async interaction => {
  if (!interaction.isButton()) return;

  // ✅ ACK immédiat (évite l’échec interaction)
  await interaction.deferUpdate();

  const [action, dossierId] = interaction.customId.split("_");
  if (!["accept", "refuse"].includes(action)) return;

  const dossiers = loadDossiers();
  if (!dossiers[dossierId]) return;

  dossiers[dossierId].statut = action === "accept" ? "accepte" : "refuse";
  saveDossiers(dossiers);

  const archiveChannel = interaction.guild.channels.cache.get(ARCHIVE_CHANNEL_ID);
  if (archiveChannel) {
    await archiveChannel.send({
      content: `📁 **Dossier ${action === "accept" ? "ACCEPTÉ" : "REFUSÉ"}**`,
      embeds: interaction.message.embeds
    });
  }

  const disabledRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("accept_disabled")
      .setLabel("Accepté")
      .setStyle(ButtonStyle.Success)
      .setDisabled(true),
    new ButtonBuilder()
      .setCustomId("refuse_disabled")
      .setLabel("Refusé")
      .setStyle(ButtonStyle.Danger)
      .setDisabled(true)
  );

  // ✅ LA LIGNE CLÉ (CORRIGÉE)
  await interaction.message.edit({
    content: `📌 Dossier ${action === "accept" ? "accepté" : "refusé"}`,
    components: [disabledRow]
  });
});

// ================== START ===================
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log("🌐 Serveur actif sur le port", PORT));

client.login(process.env.DISCORD_TOKEN);

