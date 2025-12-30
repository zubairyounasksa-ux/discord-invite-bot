import { Client, GatewayIntentBits } from 'discord.js';
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
  intents: [
    GatewayIntentBits.Guilds
  ]
});

let inviteChannel = null;

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);

  // Select first guild
  const guild = client.guilds.cache.first();
  if (!guild) {
    console.error('Bot is not in any server');
    return;
  }

  // Prefer system channel, fallback to any text channel
  inviteChannel =
    guild.systemChannel ||
    guild.channels.cache.find(c => c.isTextBased());

  if (!inviteChannel) {
    console.error('No usable text channel found');
  } else {
    console.log(`Using channel: ${inviteChannel.name}`);
  }
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
    if (!inviteChannel) {
      return res.send('Bot is not ready yet. Please try again.');
    }

    const invite = await inviteChannel.createInvite({
      maxUses: 1,
      maxAge: 86400, // 24 hours
      unique: true
    });

    res.send(`
      <h2>Discord Invite Generated</h2>
      <p>
        <a href="${invite.url}" target="_blank">
          ${invite.url}
        </a>
      </p>
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
