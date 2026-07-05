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
      .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL({ size: 64 }) })
      .setDescription(
        '────୨ৎ────\n' +
        '⋆. 𐙚˚࿔  ᴡᴇʟᴄᴏᴍᴇ ᴛᴏ ʙʟᴏꜱꜱᴏᴍ  𝜗𝜚˚⋆\n\n' +
        `${member} ɪꜱ ᴛʜᴇ ${member.guild.memberCount}ᴛʜ ᴍᴇᴍʙᴇʀ\n\n` +
        'ʀᴇᴍᴇᴍʙᴇʀ ᴛᴏ ᴠᴇʀɪꜰʏ ɪɴ <#' + channels.verify + '>\n' +
        'ɢᴇᴛ ᴄᴏᴍꜰᴏʀᴛᴀʙʟᴇ!\n\n' +
        '⏔⏔⏔ ꒰ ᧔ෆ᧓ ꒱ ⏔⏔⏔'
      )
      .addFields(
        { name: 'ᴀᴄᴄᴏᴜɴᴛ ᴀɢᴇ', value: `<t:${created}:R>`, inline: true },
        { name: 'ᴊᴏɪɴᴇᴅ', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
      )
      .setFooter({ text: `ɪᴅ: ${member.id}` })
      .setTimestamp();

    channel.send({ embeds: [embed] }).catch(() => {});
  },
};
