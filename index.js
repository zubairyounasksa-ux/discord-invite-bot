import { client } from "./bot.js";
client.login(process.env.BOT_TOKEN);

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

/* =========================
   SIMPLE IN-MEMORY LIMITS
========================= */

let lastInviteTime = 0;
let lastInviteUrl = null;
let lastInviteExpiry = 0;

const COOLDOWN_MS = 60 * 1000; // 1 minute

/* =========================
   ROUTES
========================= */

app.get("/", (req, res) => {
  res.send("Discord Invite Service is running.");
});

app.get("/invite", async (req, res) => {
  const now = Date.now();

  // Reuse existing invite if still valid
  if (lastInviteUrl && now < lastInviteExpiry) {
    return res.send(`
      <h2>Invite (Still Valid)</h2>
      <p><a href="${lastInviteUrl}" target="_blank">${lastInviteUrl}</a></p>
      <p>This invite is still valid.</p>
    `);
  }

  // Cooldown protection
  if (now - lastInviteTime < COOLDOWN_MS) {
    return res.send(
      `Please wait ${Math.ceil(
        (COOLDOWN_MS - (now - lastInviteTime)) / 1000
      )} seconds before generating a new invite.`
    );
  }

  lastInviteTime = now;

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

    const text = await response.text();

    console.log("Discord API status:", response.status);
    console.log("Discord API response:", text);

    // Handle rate limit explicitly
    if (response.status === 429) {
      return res.send(
        "Discord rate limit reached. Please wait a few minutes and try again."
      );
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.send(
        `Discord returned unexpected response.<br>Status: ${response.status}`
      );
    }

    if (!response.ok) {
      return res.send(
        `Discord API error ${response.status}:<pre>${JSON.stringify(
          data,
          null,
          2
        )}</pre>`
      );
    }

    const inviteUrl = `https://discord.gg/${data.code}`;

    // Store invite for reuse
    lastInviteUrl = inviteUrl;
    lastInviteExpiry = now + data.max_age * 1000;

    res.send(`
      <h2>Invite Created</h2>
      <p><a href="${inviteUrl}" target="_blank">${inviteUrl}</a></p>
      <p>1 use · 24 hours</p>
    `);

  } catch (err) {
    console.error("Invite error:", err);
    res.send("Internal server error.");
  }
});

/* =========================
   START SERVER
========================= */

app.listen(PORT, () => {
  console.log(`Web server running on port ${PORT}`);
});

