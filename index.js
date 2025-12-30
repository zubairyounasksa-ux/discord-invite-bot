import { Client, GatewayIntentBits } from 'discord.js';
import express from 'express';

/* =========================
   EXPRESS SETUP
========================= */

const app = express();
const PORT = process.env.PORT || 3000;

/* =========================
   DISCORD CLIENT
========================= */

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

let ready = false;

client.once('ready', () => {
  ready = true;
  console.log(`Logged in as ${client.user.tag}`);
});

client.login(process.env.BOT_TOKEN);

/* =========================
   ROUTES
========================= */

app.get('/', (req, res) => {
  res.send('Discord Invite Bot is running.');
});

app.get('/invite', async (req, res) => {
  try {
    if (!ready) {
      return res.send('Discord bot is still starting. Please refresh in 10 seconds.');
    }

    const guild = client.guilds.cache.first();
    if (!guild) {
      return res.send('Bot is not connected to any server.');
    }

    const channel =
      guild.systemChannel ||
      guild.channels.cache.find(c => c.isTextBased());

    if (!channel) {
      return res.send('No usable text channel found.');
    }

    const invite = await channel.createInvite({
      maxUses: 1,
      maxAge: 86400,
      unique: true
    });

    res.send(`
      <h2>Discord Invite Generated</h2>
      <p><a href="${invite.url}" target="_blank">${invite.url}</a></p>
      <p>Valid for 24 hours · 1 use only</p>
    `);

  } catch (err) {
    console.error(err);
    res.send('Error creating invite. Check bot permissions.');
  }
});

/* =========================
   START SERVER
========================= */

app.listen(PORT, () => {
  console.log(`Web server running on port ${PORT}`);
});
