const CHANNEL_ID = "1469524090946846904";

const express = require("express");
const cors = require("cors");

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

// ✅ CORS COMPLET (OBLIGATOIRE)
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
}));

// ✅ Répond explicitement aux preflight
app.options("*", cors());

app.use(express.json());


// 🤖 Client Discord
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

// 📩 Réception contrat
app.post("/contract", async (req, res) => {
  try {
    console.log("📩 Données reçues :", req.body);

    const {
      demandeur_nom,
      demandeur_tel,
      type_contrat,
      raison,
      cible_nom,
      cible_tel,
      cible_desc
    } = req.body;

    // ✅ Vérification logique
    if (!demandeur_nom || !demandeur_tel || !type_contrat || !raison) {
      return res.status(400).json({ error: "Données demandeur manquantes" });
    }

    if (!client.isReady()) {
      return res.status(503).json({ error: "Bot Discord pas prêt" });
    }

    const channel = await client.channels.fetch(CHANNEL_ID);

    if (!channel || !channel.isTextBased()) {
      return res.status(404).json({ error: "Salon introuvable" });
    }

    const embed = new EmbedBuilder()
      .setTitle("📄 Nouvelle demande de contrat")
      .setColor(0x2b2d31)
      .addFields(
        {
          name: "🧑‍💼 Demandeur",
          value:
            `**Nom RP :** ${demandeur_nom}\n` +
            `**Contact RP :** ${demandeur_tel}\n` +
            `**Type :** ${type_contrat}`,
        },
        {
          name: "📝 Raison",
          value: raison
        },
        {
          name: "🎯 Cible",
          value:
            `**Nom RP :** ${cible_nom || "Inconnu"}\n` +
            `**Contact RP :** ${cible_tel || "Inconnu"}\n` +
            `**Description :** ${cible_desc || "Aucune information"}`
        }
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

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Erreur contrat :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 🎯 Boutons Discord
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
