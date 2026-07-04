const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
module.exports = {
  name: 'serverinfo',
  data: new SlashCommandBuilder().setName('serverinfo').setDescription('Get server info'),
  async execute(interaction) {
    const g = interaction.guild;
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(0xFFCBF6).setTitle(`🏠 ${g.name}`)
      .setThumbnail(g.iconURL({ size: 256 }))
      .addFields(
        { name: 'Owner', value: `<@${g.ownerId}>`, inline: true },
        { name: 'Created', value: `<t:${Math.floor(g.createdTimestamp/1000)}:R>`, inline: true },
        { name: 'Members', value: `${g.memberCount}`, inline: true },
        { name: 'Channels', value: `${g.channels.cache.size}`, inline: true },
        { name: 'Roles', value: `${g.roles.cache.size}`, inline: true },
        { name: 'Boost Level', value: `Level ${g.premiumTier}`, inline: true }
      ).setTimestamp()] });
  },
  async executePrefix(message) {
    const g = message.guild;
    await message.reply({ embeds: [new EmbedBuilder().setColor(0xFFCBF6).setTitle(`🏠 ${g.name}`)
      .setThumbnail(g.iconURL({ size: 256 }))
      .addFields(
        { name: 'Owner', value: `<@${g.ownerId}>`, inline: true },
        { name: 'Created', value: `<t:${Math.floor(g.createdTimestamp/1000)}:R>`, inline: true },
        { name: 'Members', value: `${g.memberCount}`, inline: true },
        { name: 'Channels', value: `${g.channels.cache.size}`, inline: true },
        { name: 'Roles', value: `${g.roles.cache.size}`, inline: true },
        { name: 'Boost Level', value: `Level ${g.premiumTier}`, inline: true }
      ).setTimestamp()] });
  },
};
