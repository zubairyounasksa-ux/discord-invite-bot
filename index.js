import { Client, GatewayIntentBits, ChannelType } from 'discord.js';
import express from 'express';

/* =========================
   EXPRESS WEB SERVER
========================= */

const app = express();
const PORT = process.env.PORT || 3000;

/* =========================
   DISCORD CLIENT
========================= */

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.login(process.env.BOT_TOKEN);

/* =========================
   WEB ROUTES
========================= */

app.get('/', (req, res) => {
  res.send('Discord Invite Bot is running.');
});

app.get('/invite', async (req, res) => {
  try {
    // Fetch guild dynamically (reliable on Render)
    const guilds = await client.guilds.fetch();
    const guild = guilds.first();
    if (!guild) {
      return res.send('Bot is not connected to any server.');
    }

    const fullGuild = await guild.fetch();

    // Find a text channel that allows invites
    const channel = fullGuild.channels.cache.find(
      c =>
        c.type === ChannelType.GuildText &&
        c.permissionsFor(fullGuild.members.me).has('CreateInstantInvite')
    );

    if (!channel) {
      return res.send('No channel found with invite permission.');
    }

    const invite = await channel.createInvite({
      maxUses: 1,
      maxAge: 86400, // 24 hours
      unique: true
    });

    res.send(`
      <h2>Discord Invite Generated</h2>
      <p><a href="${invite.url}" target="_blank">${invite.url}</a></p>
      <p>Valid for 24 hours · 1 use only</p>
    `);

  } catch (error) {
    console.error(error);
    res.send('Failed to create invite. Check bot permissions.');
  }
});

/* =========================
   START SERVER
========================= */

app.listen(PORT, () => {
  console.log(`Web server running on port ${PORT}`);
});
