const { EmbedBuilder } = require('discord.js');
const { channels } = require('../config');

const buffer = { messages: [], edits: [], deletes: [] };
const MAX_ENTRIES = 500;
let client = null;
let lastFlush = 0;

function init(c) {
  client = c;
  console.log('[Logger] Initialized');
  setInterval(() => {
    flushLogs().catch(err => console.error('[Logger] flushLogs error:', err));
  }, 5 * 60 * 1000);
}

function addLog(type, entry) {
  if (!buffer[type]) return;
  buffer[type].push(entry);
  const total = buffer.messages.length + buffer.edits.length + buffer.deletes.length;
  if (total >= MAX_ENTRIES) {
    flushLogs().catch(err => console.error('[Logger] flushLogs error:', err));
  }
}

function getStatus() {
  return {
    messages: buffer.messages.length,
    edits: buffer.edits.length,
    deletes: buffer.deletes.length,
    total: buffer.messages.length + buffer.edits.length + buffer.deletes.length,
    lastFlush,
  };
}

async function getLogChannel() {
  if (!client) {
    console.error('[Logger] Client not initialized');
    return null;
  }
  console.log(`[Logger] Looking up channel ${channels.logs}, guilds: ${client.guilds.cache.size}`);
  let channel = client.channels.cache.get(channels.logs);
  if (!channel) {
    console.log('[Logger] Channel not in cache, attempting fetch...');
    try {
      channel = await client.channels.fetch(channels.logs);
      console.log(`[Logger] Fetched channel: ${channel?.name} in ${channel?.guild?.name}`);
    } catch (err) {
      console.error(`[Logger] Cannot find log channel ${channels.logs}: ${err.message}`);
      return null;
    }
  } else {
    console.log(`[Logger] Channel found in cache: #${channel.name} in ${channel.guild?.name}`);
  }
  return channel;
}

async function flushLogs() {
  const total = buffer.messages.length + buffer.edits.length + buffer.deletes.length;

  const logChannel = await getLogChannel();
  if (!logChannel) {
    console.error('[Logger] Cannot flush — log channel unavailable');
    return;
  }

  if (total === 0) {
    console.log('[Logger] Sending heartbeat');
    const embed = new EmbedBuilder()
      .setColor(0xFFCBF6)
      .setTitle('⁺˚⋆｡°✩ ʜᴇᴀʀᴛʙᴇᴀᴛ ✩°｡⋆˚⁺')
      .setDescription('⋆. 𐙚˚/ʙʟꜱᴍ ɪꜱ ᴀʟɪᴠᴇ 𝜗𝜚˚⋆')
      .setFooter({ text: new Date().toLocaleString() })
      .setTimestamp();
    try {
      await logChannel.send({ embeds: [embed] });
    } catch (err) {
      console.error(`[Logger] Heartbeat send failed: ${err.message}`);
    }
    lastFlush = Date.now();
    return;
  }

  console.log(`[Logger] Flushing ${total} entries (${buffer.messages.length} msgs, ${buffer.edits.length} edits, ${buffer.deletes.length} deletes)`);

  const parts = [];

  if (buffer.messages.length) {
    let text = `New Messages — ${buffer.messages.length}\n`;
    buffer.messages.slice(0, 20).forEach(e => {
      text += `\n#${e.channelName || e.channelId} | ${e.author}\n${truncate(e.content, 150)}`;
    });
    if (buffer.messages.length > 20) text += `\n\n...and ${buffer.messages.length - 20} more`;
    parts.push(text);
  }

  if (buffer.edits.length) {
    let text = `Edited — ${buffer.edits.length}\n`;
    buffer.edits.slice(0, 10).forEach(e => {
      text += `\n#${e.channelName || e.channelId} | ${e.author}\n"${truncate(e.before, 80)}" → "${truncate(e.after, 80)}"`;
    });
    if (buffer.edits.length > 10) text += `\n\n...and ${buffer.edits.length - 10} more`;
    parts.push(text);
  }

  if (buffer.deletes.length) {
    let text = `Deleted — ${buffer.deletes.length}\n`;
    buffer.deletes.slice(0, 10).forEach(e => {
      text += `\n#${e.channelName || e.channelId} | ${e.author}\n${e.content ? truncate(e.content, 150) : '*uncached*'}`;
    });
    if (buffer.deletes.length > 10) text += `\n\n...and ${buffer.deletes.length - 10} more`;
    parts.push(text);
  }

  for (const desc of parts) {
    if (!desc.trim()) continue;
    const embed = new EmbedBuilder()
      .setColor(0xFFCBF6)
      .setTitle('Message Log')
      .setDescription(desc.substring(0, 4096))
      .setFooter({ text: `${new Date().toLocaleString()}` })
      .setTimestamp();
    try {
      await logChannel.send({ embeds: [embed] });
    } catch (err) {
      console.error(`[Logger] Send failed: ${err.message}`);
    }
  }

  lastFlush = Date.now();
  buffer.messages = [];
  buffer.edits = [];
  buffer.deletes = [];
  console.log('[Logger] Flush complete');
}

function truncate(str, len) {
  if (!str) return '*empty*';
  return str.length > len ? str.slice(0, len) + '...' : str;
}

module.exports = { init, addLog, flushLogs, getStatus };
