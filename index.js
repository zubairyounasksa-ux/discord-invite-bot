import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;

if (!BOT_TOKEN || !CHANNEL_ID) {
  console.error("❌ BOT_TOKEN or CHANNEL_ID missing");
  process.exit(1);
}

app.get("/", (req, res) => {
  res.send("Discord Invite Service is running.");
});

app.get("/invite", async (req, res) => {
  try {
    const response = await fetch(
      `https://discord.com/api/v10/channels/${CHANNEL_ID}/invites`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bot ${BOT_TOKEN}`,
          "Content-Type": "application/json",
          "User-Agent": "DiscordBot (InviteService, 1.0)"
        },
        body: JSON.stringify({
          max_uses: 1,
          max_age: 86400,
          unique: true
        })
      }
    );

    const text = await response.text(); // ⬅️ IMPORTANT

    console.log("Discord API status:", response.status);
    console.log("Discord API raw response:", text);

    // Try parsing JSON safely
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.send(
        `Discord did not return JSON.<br>Status: ${response.status}<br>Raw response:<pre>${text}</pre>`
      );
    }

    if (!response.ok) {
      return res.send(
        `Discord API error ${response.status}:<pre>${JSON.stringify(data, null, 2)}</pre>`
      );
    }

    const inviteUrl = `https://discord.gg/${data.code}`;

    res.send(`
      <h2>Invite Created</h2>
      <p><a href="${inviteUrl}" target="_blank">${inviteUrl}</a></p>
      <p>1 use · 24 hours</p>
    `);

  } catch (err) {
    console.error("Invite exception:", err);
    res.send("Internal server error.");
  }
});

app.listen(PORT, () => {
  console.log(`Web server running on port ${PORT}`);
});
