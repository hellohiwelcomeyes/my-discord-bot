const { EmbedBuilder } = require('discord.js');
const { channels, roles } = require('../config');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member, client) {
    const unverifiedRole = member.guild.roles.cache.get(roles.unverified);
    if (unverifiedRole) {
      await member.roles.add(unverifiedRole).catch(() => {});
    }

    const channel = client.channels.cache.get(channels.welcome);
    if (!channel) return;

    const created = Math.floor(member.user.createdTimestamp / 1000);
    const ageDays = Math.floor((Date.now() - member.user.createdTimestamp) / 86400000);

    const embed = new EmbedBuilder()
      .setColor(0xFFCBF6)
      .setTitle('Welcome')
      .setDescription(`${member.user.tag}`)
      .addFields(
        { name: 'Member', value: `${member}`, inline: true },
        { name: 'Member Count', value: `${member.guild.memberCount}`, inline: true },
        { name: 'Account Created', value: `<t:${created}:R>`, inline: true },
      )
      .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
      .setFooter({ text: `ID: ${member.id}` })
      .setTimestamp();

    channel.send({ embeds: [embed] }).catch(() => {});
  },
};
