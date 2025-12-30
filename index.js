import { Client, GatewayIntentBits } from 'discord.js';
import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

let readyAt = null;

client.on('ready', () => {
  readyAt = new Date();
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on('error', (e) => {
  console.error('❌ Discord client error:', e);
});

client.on('shardError', (e) => {
  console.error('❌ Discord shard error:', e);
});

console.log('Starting web server...');
app.get('/', (req, res) => res.send('Discord Invite Bot is running.'));
app.get('/status', (req, res) => {
  res.json({
    hasToken: Boolean(process.env.BOT_TOKEN),
    tokenLength: process.env.BOT_TOKEN ? process.env.BOT_TOKEN.length : 0,
    ready: Boolean(readyAt),
    readyAt
  });
});

app.get('/invite', async (req, res) => {
  if (!readyAt) return res.send('Discord bot not connected yet. Check /status and logs.');

  try {
    const guild = client.guilds.cache.first();
    if (!guild) return res.send('Bot is not in any server (guild cache empty).');

    const channel = guild.systemChannel || guild.channels.cache.find(c => c.isTextBased());
    if (!channel) return res.send('No usable text channel found.');

    const invite = await channel.createInvite({ maxUses: 1, maxAge: 86400, unique: true });

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

app.listen(PORT, () => console.log(`Web server running on port ${PORT}`));

/* ---- LOGIN WITH EXPLICIT ERROR OUTPUT ---- */
if (!process.env.BOT_TOKEN) {
  console.error('❌ BOT_TOKEN is missing in Render Environment Variables');
} else {
  console.log(`BOT_TOKEN detected (length=${process.env.BOT_TOKEN.length}). Attempting Discord login...`);
  client.login(process.env.BOT_TOKEN).catch((err) => {
    console.error('❌ Discord login failed:', err);
  });
}
