const { SlashCommandBuilder, EmbedBuilder, version: djsVersion } = require('discord.js');
const os = require('os');
const pkg = require('../../package.json');

const LOGO = '```\n' +
'╔═══════════════════╗\n' +
'║  ✿  BLOSSOM  ✿  ║\n' +
'║   discord-bot    ║\n' +
'║   v' + pkg.version + '           ║\n' +
'╚═══════════════════╝';

function formatUptime(ms) {
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${d ? d + 'd ' : ''}${h}h ${m}m ${s}s`;
}

module.exports = {
  name: 'botinfo',
  data: new SlashCommandBuilder()
    .setName('botinfo')
    .setDescription('Show bot system info (fastfetch style)'),

  async execute(interaction) {
    const c = interaction.client;
    const embed = new EmbedBuilder()
      .setColor(0xFFCBF6)
      .setTitle('🤖 Bot Info')
      .setDescription(LOGO)
      .addFields(
        { name: 'Uptime', value: formatUptime(c.uptime), inline: true },
        { name: 'Ping', value: `${Math.round(c.ws.ping)}ms`, inline: true },
        { name: 'Servers', value: `${c.guilds.cache.size}`, inline: true },
        { name: 'Users', value: `${c.guilds.cache.reduce((a, g) => a + g.memberCount, 0)}`, inline: true },
        { name: 'Node', value: process.version, inline: true },
        { name: 'd.js', value: djsVersion, inline: true },
        { name: 'Memory', value: `${(process.memoryUsage().rss / 1048576).toFixed(1)} MB`, inline: true },
        { name: 'OS', value: `${os.type()} ${os.release()}`, inline: true },
        { name: 'Arch', value: os.arch(), inline: true },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },

  async executePrefix(message) {
    const c = message.client;
    const embed = new EmbedBuilder()
      .setColor(0xFFCBF6)
      .setTitle('🤖 Bot Info')
      .setDescription(LOGO)
      .addFields(
        { name: 'Uptime', value: formatUptime(c.uptime), inline: true },
        { name: 'Ping', value: `${Math.round(c.ws.ping)}ms`, inline: true },
        { name: 'Servers', value: `${c.guilds.cache.size}`, inline: true },
        { name: 'Users', value: `${c.guilds.cache.reduce((a, g) => a + g.memberCount, 0)}`, inline: true },
        { name: 'Node', value: process.version, inline: true },
        { name: 'd.js', value: djsVersion, inline: true },
        { name: 'Memory', value: `${(process.memoryUsage().rss / 1048576).toFixed(1)} MB`, inline: true },
        { name: 'OS', value: `${os.type()} ${os.release()}`, inline: true },
        { name: 'Arch', value: os.arch(), inline: true },
      )
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  },
};
