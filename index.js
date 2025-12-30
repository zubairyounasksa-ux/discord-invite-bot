import { Client, GatewayIntentBits } from 'discord.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content === '!invite') {
    try {
      const channel = message.guild.systemChannel || message.channel;

      const invite = await channel.createInvite({
        maxUses: 1,
        maxAge: 86400, // 24 hours
        unique: true,
        reason: `Invite requested by ${message.author.tag}`
      });

      await message.reply(
        `Here is your invite link (1 use, 24 hours):\n${invite.url}`
      );

    } catch (error) {
      console.error(error);
      message.reply('I cannot create an invite. Check my permissions.');
    }
  }
});

client.login(process.env.BOT_TOKEN);
