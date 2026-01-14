import { REST, Routes } from "discord.js";

const BOT_TOKEN = process.env.BOT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

const commands = [
  {
    name: "admin",
    description: "Open admin control panel"
  }
];

const rest = new REST({ version: "10" }).setToken(BOT_TOKEN);

try {
  console.log("⏳ Registering /admin command...");
  await rest.put(
    Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
    { body: commands }
  );
  console.log("✅ /admin registered");
} catch (err) {
  console.error("❌ Command registration failed:", err);
}
