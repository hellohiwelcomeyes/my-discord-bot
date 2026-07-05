const { EmbedBuilder } = require('discord.js');
const { channels, roles } = require('../config');

function ordinal(n) {
  const s = ['ᴛʜ', 'ꜱᴛ', 'ɴᴅ', 'ʀᴅ'];
  const v = n % 100;
  return n + (s[(v > 10 && v < 14) ? 0 : (n % 10)] || 'ᴛʜ');
}

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

    const embed = new EmbedBuilder()
      .setColor(0xFFCBF6)
      .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL({ size: 64 }) })
      .setDescription(
        '────── ˖⁺.꒷꒦♡꒷꒦˖⁺. ──────\n' +
        '⋆. 𐙚˚࿔  ᴡᴇʟᴄᴏᴍᴇ ᴛᴏ /ʙʟꜱᴍ  𝜗𝜚˚⋆\n\n' +
        `${member} ɪꜱ ᴛʜᴇ ${ordinal(member.guild.memberCount)} ᴍᴇᴍʙᴇʀ\n\n` +
        'ʀᴇᴍᴇᴍʙᴇʀ ᴛᴏ ᴠᴇʀɪꜰʏ ɪɴ <#' + channels.verify + '>\n' +
        'ɢᴇᴛ ᴄᴏᴍꜰᴏʀᴛᴀʙʟᴇ!\n\n' +
        '────── ෆ˚⋆୨୧⋆˚ෆ ──────'
      )
      .addFields(
        { name: 'ᴀᴄᴄᴏᴜɴᴛ ᴀɢᴇ', value: `<t:${created}:R>`, inline: true },
        { name: 'ᴍᴇᴍʙᴇʀꜱ', value: `${member.guild.memberCount}`, inline: true },
      )
      .setFooter({ text: 'ɪᴅ: ' + member.id })
      .setTimestamp();

    channel.send({ embeds: [embed] }).catch(() => {});
  },
};
