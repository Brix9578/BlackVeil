// ================== CONFIG ==================
const CHANNEL_ID = "1469524090946846904";
const ARCHIVE_CHANNEL_ID = "1470904139008446485";

// ================== IMPORTS =================
const express = require("express");
const fs = require("fs");
const app = express();

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "https://brix9578.github.io");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(200);
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

// ================== UTILS ==================
function loadDossiers() {
  return JSON.parse(fs.readFileSync("dossiers.json", "utf8"));
}
function saveDossiers(data) {
  fs.writeFileSync("dossiers.json", JSON.stringify(data, null, 2));
}

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
      return res.status(400).json({ error: "Champs manquants" });
    }

    const dossiers = loadDossiers();
    dossiers[dossier] = {
      statut: "en_attente",
      demandeur_nom,
      type_contrat,
      date: new Date().toISOString()
    };
    saveDossiers(dossiers);

    const channel = await client.channels.fetch(CHANNEL_ID);

    const embed = new EmbedBuilder()
      .setTitle("📄 Nouvelle demande de contrat")
      .setColor(0x2b2d31)
      .setDescription(
`📁 **Dossier**
**${dossier}**

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
      new ButtonBuilder().setCustomId("accept").setLabel("Accepter").setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId("refuse").setLabel("Refuser").setStyle(ButtonStyle.Danger)
    );

    await channel.send({ embeds: [embed], components: [row] });

    res.json({ success: true, dossier });

  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ================== SUIVI DOSSIER ==========
app.get("/suivi/:id", (req, res) => {
  const dossiers = loadDossiers();
  const dossier = dossiers[req.params.id];

  if (!dossier) return res.status(404).json({ error: "Introuvable" });
  res.json(dossier);
});

// ================== INTERACTIONS ============
client.on("interactionCreate", async interaction => {
  if (!interaction.isButton()) return;
  if (!["accept", "refuse"].includes(interaction.customId)) return;

  const accepted = interaction.customId === "accept";
  const dossiers = loadDossiers();

  const dossierId = interaction.message.embeds[0]
    .description.match(/BV-\d{4}-\d{5}/)[0];

  dossiers[dossierId].statut = accepted ? "accepte" : "refuse";
  saveDossiers(dossiers);

  const archiveChannel = interaction.guild.channels.cache.get(ARCHIVE_CHANNEL_ID);
  await archiveChannel.send({
    content: `📁 **Dossier ${accepted ? "ACCEPTÉ" : "REFUSÉ"}**`,
    embeds: interaction.message.embeds
  });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("accept_disabled").setLabel("Accepté").setStyle(ButtonStyle.Success).setDisabled(true),
    new ButtonBuilder().setCustomId("refuse_disabled").setLabel("Refusé").setStyle(ButtonStyle.Danger).setDisabled(true)
  );

  await interaction.update({
    content: `📌 Dossier ${accepted ? "accepté" : "refusé"}`,
    components: [row]
  });
});

// ================== START ===================
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log("🌐 Serveur actif", PORT));
client.login(process.env.DISCORD_TOKEN);

