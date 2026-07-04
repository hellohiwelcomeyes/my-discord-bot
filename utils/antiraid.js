const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { channels } = require('../config');

const SPAM_WINDOW = 5000;
const SPAM_THRESHOLD = 5;
const SPAM_TIMEOUT_MS = 10 * 60 * 1000;
const EVERYONE_TIMEOUT_MS = 30 * 60 * 1000;
const CHANNEL_DELETE_WINDOW = 15000;
const CHANNEL_DELETE_THRESHOLD = 3;

const userMessages = new Map();
const channelDeletions = [];
const LOG_COOLDOWN = 10 * 1000;
let lastLogTime = 0;

function canLog() {
  const now = Date.now();
  if (now - lastLogTime < LOG_COOLDOWN) return false;
  lastLogTime = now;
  return true;
}

async function timeoutMember(member, ms, reason) {
  if (!member?.moderatable) return;
  try {
    await member.timeout(ms, reason);
  } catch {}
}

async function banMember(guild, targetId, reason) {
  try {
    await guild.members.ban(targetId, { reason });
    return true;
  } catch {
    return false;
  }
}

async function sendAlert(client, title, description, color) {
  if (!canLog()) return;
  const channel = client.channels.cache.get(channels.logs);
  if (!channel) return;
  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .setDescription(description)
    .setTimestamp();
  channel.send({ embeds: [embed] }).catch(() => {});
}

function init(client) {
  client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (!message.member) return;

    if (message.mentions.everyone) {
      if (message.member.permissions.has(PermissionFlagsBits.Administrator)) return;
      await timeoutMember(message.member, EVERYONE_TIMEOUT_MS, 'Mass ping / @everyone spam');
      await message.delete().catch(() => {});
      await sendAlert(
        client,
        '@everyone Ping',
        `${message.author.tag} pinged @everyone in <#${message.channel.id}> and got timed out for 30 minutes.\n\n${message.content.substring(0, 200)}`,
        0xFFCBF6
      );
      return;
    }

    const now = Date.now();
    let timestamps = userMessages.get(message.author.id);
    if (!timestamps) {
      timestamps = [];
      userMessages.set(message.author.id, timestamps);
    }

    while (timestamps.length && timestamps[0] < now - SPAM_WINDOW) timestamps.shift();
    if (timestamps.length === 0) userMessages.delete(message.author.id);
    timestamps.push(now);

    if (timestamps.length >= SPAM_THRESHOLD) {
      await timeoutMember(message.member, SPAM_TIMEOUT_MS, 'Spam - too many messages too fast');
      userMessages.delete(message.author.id);
      await sendAlert(
        client,
        'Spam Alert',
        `${message.author.tag} timed out in <#${message.channel.id}> — ${SPAM_THRESHOLD} messages in ${SPAM_WINDOW / 1000}s.`,
        0xFFCBF6
      );
    }
  });

  client.on('messageDeleteBulk', async (messages) => {
    if (messages.size < 5) return;
      await sendAlert(
        client,
        'Bulk Delete',
        `${messages.size} messages deleted in <#${[...messages][0]?.[1]?.channel?.id || 'unknown'}>.`,
        0xFFCBF6
      );
  });

  client.on('channelDelete', async (channel) => {
    if (channel.type !== 0 && channel.type !== 2 && channel.type !== 5) return;
    const guild = channel.guild;
    if (!guild) return;

    const now = Date.now();
    while (channelDeletions.length && channelDeletions[0].time < now - CHANNEL_DELETE_WINDOW) channelDeletions.shift();
    channelDeletions.push({ time: now, name: channel.name, type: channel.type });

    if (channelDeletions.length >= CHANNEL_DELETE_THRESHOLD) {
      const names = channelDeletions.map(c => c.name).join(', ');
      channelDeletions.length = 0;

      let deleterTag = 'Unknown';
      let deleterId = null;

      try {
        const audit = await guild.fetchAuditLogs({ type: 12, limit: 1 });
        const entry = audit.entries.first();
        if (entry && Date.now() - entry.createdTimestamp < 30000) {
          deleterTag = entry.executor.tag;
          deleterId = entry.executor.id;
        }
      } catch {}

      await sendAlert(
        client,
        'Channel Mass Delete',
        `${CHANNEL_DELETE_THRESHOLD}+ channels deleted in ${CHANNEL_DELETE_WINDOW / 1000}s.\n` +
        `Channels: ${names}\n` +
        `By: ${deleterTag} (${deleterId || 'unknown'})\n\n` +
        `Banning them...`,
        0xFFCBF6
      );

      if (deleterId) {
        const banned = await banMember(guild, deleterId, 'Mass channel deletion');
        if (banned) {
          await sendAlert(client, 'User Banned', `${deleterTag} banned for mass channel deletion.`, 0xFFCBF6);
        }
      }
    }
  });
}

module.exports = { init };
