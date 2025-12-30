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
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          max_uses: 1,
          max_age: 86400,
          unique: true
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(data);
      return res.send("Failed to create invite. Check permissions.");
    }

    const inviteUrl = `https://discord.gg/${data.code}`;

    res.send(`
      <h2>Invite Created</h2>
      <p><a href="${inviteUrl}" target="_blank">${inviteUrl}</a></p>
      <p>1 use · 24 hours</p>
    `);

  } catch (err) {
    console.error(err);
    res.send("Internal error creating invite.");
  }
});

app.listen(PORT, () => {
  console.log(`Web server running on port ${PORT}`);
});
