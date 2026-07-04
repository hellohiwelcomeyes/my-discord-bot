const { EmbedBuilder } = require('discord.js');
const logger = require('../../utils/logger');
const { isMod, noPermPrefix } = require('../../utils/permissions');

module.exports = {
  name: 'log',
  async executePrefix(message, args) {
    if (!(await isMod(message.member))) return noPermPrefix(message);

    const sub = (args[0] || '').toLowerCase();

    if (sub === 'flush') {
      const status = logger.getStatus();
      if (status.total === 0) {
        return message.reply('Buffer is already empty.');
      }
      await message.reply(`Flushing ${status.total}...`);
      await logger.flushLogs();
      return;
    }

    if (sub === 'test') {
      const embed = new EmbedBuilder()
        .setColor(0xFFCBF6)
        .setTitle('Test Log')
        .setDescription('Testing if the log channel works.')
        .setFooter({ text: `Sent by ${message.author.tag}` })
        .setTimestamp();
      const { channels } = require('../../config');
      let channel = message.client.channels.cache.get(channels.logs);
      if (!channel) {
        try {
          channel = await message.client.channels.fetch(channels.logs);
        } catch {
          const guildList = message.client.guilds.cache.map(g => `${g.name} (${g.id})`).join(', ') || 'none';
          return message.reply(
            `Log channel \`${channels.logs}\` not found.\n` +
            `Bot is in: ${guildList}\n` +
            `Try running this command in the same server as the log channel.`
          );
        }
      }
      await channel.send({ embeds: [embed] });
      return message.reply('Sent a test log.');
    }

    if (sub === 'status') {
      const status = logger.getStatus();
      return message.reply(
        `Log buffer status:\nMessages: ${status.messages}\nEdits: ${status.edits}\nDeletes: ${status.deletes}\nLast flush: ${status.lastFlush ? new Date(status.lastFlush).toLocaleString() : 'never'}`
      );
    }

    if (sub === 'channels') {
      const textChannels = message.guild.channels.cache
        .filter(c => c.type === 0)
        .map(c => `#${c.name} — \`${c.id}\``)
        .join('\n') || 'none';
      return message.reply(`Text channels in ${message.guild.name}:\n${textChannels}`);
    }

    message.reply('Usage: `!alog flush | test | status | channels`');
  },
};
