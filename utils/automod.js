const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');
const { channels } = require('../config');

const DATA_FILE = path.join(__dirname, '../data/automod.json');
let data = { enabled: true, words: [] };

function load() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
  } catch {}
}

function save() {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch {}
}

load();

function getWords() {
  return data.words;
}

function addWord(word, severity) {
  const exists = data.words.find(w => w.word.toLowerCase() === word.toLowerCase());
  if (exists) return false;
  data.words.push({ word: word.toLowerCase(), severity });
  save();
  return true;
}

function removeWord(word) {
  const idx = data.words.findIndex(w => w.word.toLowerCase() === word.toLowerCase());
  if (idx === -1) return false;
  data.words.splice(idx, 1);
  save();
  return true;
}

function isEnabled() {
  return data.enabled;
}

function toggle() {
  data.enabled = !data.enabled;
  save();
  return data.enabled;
}

function check(content) {
  if (!data.enabled || !data.words.length) return null;
  const lower = content.toLowerCase();
  for (const entry of data.words) {
    if (lower.includes(entry.word)) return entry;
  }
  return null;
}

async function handleFilteredMessage(message, client) {
  if (message.author.bot) return;
  const match = check(message.content);
  if (!match) return;

  const member = message.member;
  if (!member) return;

  try {
    await message.delete();
  } catch {}

  const logChannel = client.channels.cache.get(channels.logs);

  switch (match.severity) {
    case 'warn': {
      const reply = await message.channel.send(`${message.author} watch your language.`).catch(() => {});
      if (reply) setTimeout(() => reply.delete().catch(() => {}), 5000);
      break;
    }
    case 'timeout': {
      if (member.moderatable) {
        await member.timeout(10 * 60 * 1000, `Auto-mod: "${match.word}"`);
        message.channel.send(`${message.author} timed out for 10 minutes.`).catch(() => {});
      }
      break;
    }
    case 'kick': {
      if (member.kickable) {
        await member.kick(`Auto-mod: "${match.word}"`);
      }
      break;
    }
    case 'ban': {
      if (member.bannable) {
        await member.ban({ reason: `Auto-mod: "${match.word}"` });
      }
      break;
    }
  }

  if (logChannel) {
    const embed = new EmbedBuilder()
      .setColor(0xFFCBF6)
      .setTitle('Auto-Mod')
      .setDescription(
        `${message.author.tag} triggered the filter in <#${message.channel.id}>.\n` +
        `**Word:** "${match.word}" (${match.severity})\n` +
        `**Message:** ${message.content.substring(0, 200)}`
      )
      .setTimestamp();
    logChannel.send({ embeds: [embed] }).catch(() => {});
  }
}

module.exports = { getWords, addWord, removeWord, isEnabled, toggle, handleFilteredMessage };
