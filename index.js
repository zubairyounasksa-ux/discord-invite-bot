import { Client, GatewayIntentBits } from 'discord.js';
import express from 'express';

/* =========================
   EXPRESS APP
========================= */

const app = express();
const PORT = process.env.PORT || 3000;

/* =========================
   DISCORD CLIENT
========================= */

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

let readyAt = null;

/* ---- Discord Events ---- */

client.once('ready', () => {
  readyAt = new Date();
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on('error', (err) => {
  console.error('❌ Discord client error:', err);
});

client.on('shardError', (err) => {
  console.error('❌ Discord shard error:', err);
});

/* ---- Login ---- */

if (!process.env.BOT_TOKEN) {
  console.error('❌ BOT_TOKEN is missing. Set it in Render Environment Variables.');
} else {
  console.log(`BOT_TOKEN detected (length=${process.env.BOT_TOKEN.length}). Attempting Discord login...`);
  client.login(process.env.BOT_TOKEN).catch(err => {
    console.error('❌ Discord login failed:', err);
  });
}

/* =========================
   ROUTES
========================= */

app.get('/', (req, res) => {
  res.send('Discord Invite Bot is running.');
});

app.get('/status', (req, res) => {
  res.json({
    ready: Boolean(readyAt),
    readyAt,
    botUser: client.user ? client.user.tag : null,
    guildCount: client.guilds.cache.size
  });
});

app.get('/invite', async (req, res) => {
  if (!readyAt) {
    return res.send('Discord bot not connected yet. Check /status and logs.');
  }

  try {
    const guild = client.guilds.cache.first();
    if (!guild) {
      return res.send('Bot is not in any server.');
    }

    const channel =
      guild.systemChannel ||
      guild.channels.cache.find(c => c.isTextBased());

    if (!channel) {
      return res.send('No usable text channel found.');
    }

    const invite = await channel.createInvite({
      maxUses: 1,
      maxAge: 86400, // 24 hours
      unique: true
    });

    res.send(`
      <h2>Invite Created</h2>
      <p><a href="${invite.url}" target="_blank">${invite.url}</a></p>
      <p>1 use · 24 hours</p>
    `);

  } catch (err) {
    console.error('❌ Invite creation error:', err);
    res.send('Error creating invite. Check bot permissions.');
  }
});

/* =========================
   START SERVER
========================= */

app.listen(PORT, () => {
  console.log(`Web server running on port ${PORT}`);
});
