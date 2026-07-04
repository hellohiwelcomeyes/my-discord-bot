const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const os = require('os');

const LEAF = [
  '     .--.',
  '    / .  \\',
  '   /      \\',
  '  /________\\',
].join('\n');

function formatUptime(ms) {
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  let out = '';
  if (d) out += d + 'd ';
  out += h + 'h ' + m + 'm ' + s + 's';
  return out;
}

module.exports = {
  name: 'botinfo',
  data: new SlashCommandBuilder()
    .setName('botinfo')
    .setDescription('Show bot system info (fastfetch style)'),

  async execute(interaction) {
    const c = interaction.client;
    const uptime = formatUptime(c.uptime);
    const ping = Math.round(c.ws.ping);
    const users = c.guilds.cache.reduce((a, g) => a + g.memberCount, 0);

    const output = '```\n' + LEAF + '\n\n' +
      '  uptime     ' + uptime + '\n' +
      '  users      ' + users + '\n' +
      '  ping       ' + ping + 'ms\n' +
      '  os         Linux LFS (btw)\n' +
      '```';

    const embed = new EmbedBuilder()
      .setColor(0xFFCBF6)
      .setDescription(output)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },

  async executePrefix(message) {
    const c = message.client;
    const uptime = formatUptime(c.uptime);
    const ping = Math.round(c.ws.ping);
    const users = c.guilds.cache.reduce((a, g) => a + g.memberCount, 0);

    const output = '```\n' + LEAF + '\n\n' +
      '  uptime     ' + uptime + '\n' +
      '  users      ' + users + '\n' +
      '  ping       ' + ping + 'ms\n' +
      '  os         Linux LFS (btw)\n' +
      '```';

    const embed = new EmbedBuilder()
      .setColor(0xFFCBF6)
      .setDescription(output)
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  },
};
