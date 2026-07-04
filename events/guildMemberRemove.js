const { EmbedBuilder } = require('discord.js');
const { channels } = require('../config');

module.exports = {
  name: 'guildMemberRemove',
  async execute(member, client) {
    const channel = client.channels.cache.get(channels.goodbye);
    if (!channel) return;

    const duration = Math.floor((Date.now() - (member.joinedTimestamp || Date.now())) / 86400000);

    const embed = new EmbedBuilder()
      .setColor(0xFFCBF6)
      .setTitle('Goodbye')
      .setDescription(`${member.user.tag}`)
      .addFields(
        { name: 'Joined', value: `<t:${Math.floor((member.joinedTimestamp || Date.now()) / 1000)}:R>`, inline: true },
        { name: 'Member Count', value: `${member.guild.memberCount}`, inline: true },
        { name: 'Duration', value: `${duration}d in the server`, inline: true },
      )
      .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
      .setFooter({ text: `ID: ${member.id}` })
      .setTimestamp();

    channel.send({ embeds: [embed] }).catch(() => {});
  },
};
