import { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events } from "discord.js";

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages
  ]
});

const ADMIN_ID = process.env.ADMIN_ID;   // Your Discord ID
const GUILD_ID = process.env.GUILD_ID;   // Your Server ID

client.once("ready", () => {
  console.log(`🤖 Bot logged in as ${client.user.tag}`);
});

/* ======================
   /admin command
====================== */
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "admin") {
    if (interaction.user.id !== ADMIN_ID) {
      return interaction.reply({ content: "❌ Not allowed", ephemeral: true });
    }

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("dm")
        .setLabel("📩 Send DM")
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId("invite")
        .setLabel("🔗 Create Invite")
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId("kick")
        .setLabel("⛔ Kick User")
        .setStyle(ButtonStyle.Danger)
    );

    await interaction.reply({
      content: "Choose what you want to do:",
      components: [row],
      ephemeral: true
    });
  }
});

/* ======================
   Button Clicks
====================== */
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isButton()) return;

  if (interaction.user.id !== ADMIN_ID) {
    return interaction.reply({ content: "❌ Not allowed", ephemeral: true });
  }

  if (interaction.customId === "dm") {
    return interaction.reply({
      content: "Send me:\n`username#1234 | message`",
      ephemeral: true
    });
  }

  if (interaction.customId === "kick") {
    return interaction.reply({
      content: "Send me:\n`username#1234`",
      ephemeral: true
    });
  }

  if (interaction.customId === "invite") {
    return interaction.reply({
      content: "Use your existing /invite web link to generate invite 🔗",
      ephemeral: true
    });
  }
});

/* ======================
   Handle your replies
====================== */
client.on("messageCreate", async message => {
  if (message.author.bot) return;
  if (message.author.id !== ADMIN_ID) return;

  const guild = await client.guilds.fetch(GUILD_ID);
  const members = await guild.members.fetch();

  // DM format: username#1234 | message
  if (message.content.includes("|")) {
    const [userTag, dmText] = message.content.split("|").map(x => x.trim());
    const [username, discrim] = userTag.split("#");

    const user = members.find(
      m => m.user.username === username && m.user.discriminator === discrim
    );

    if (!user) return message.reply("❌ User not found");

    await user.send(dmText);
    return message.reply("✅ DM sent");
  }

  // Kick format: username#1234
  if (message.content.includes("#")) {
    const [username, discrim] = message.content.split("#");

    const user = members.find(
      m => m.user.username === username && m.user.discriminator === discrim
    );

    if (!user) return message.reply("❌ User not found");

    await user.kick("Admin request");
    return message.reply("⛔ User kicked");
  }
});
