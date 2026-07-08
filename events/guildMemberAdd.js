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

    const logCh = client.channels.cache.get(channels.memberLog);
    if (logCh) {
      logCh.send({
        embeds: [new EmbedBuilder()
          .setColor(0xFFCBF6)
          .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL({ size: 64 }) })
          .setThumbnail(member.user.displayAvatarURL({ size: 128 }))
          .setDescription(
            '────── ✦⠂⠂୨୧ ──────\n' +
            `ᴊᴏɪɴᴇᴅ ﹕ ${member.user.tag}\n` +
            `ɪᴅ ﹕ \`${member.id}\`\n` +
            `ᴍᴇɴᴛɪᴏɴ ﹕ ${member}\n` +
            `ʙᴏᴛ ﹕ ${member.user.bot ? 'ʏᴇꜱ' : 'ɴᴏ'}\n` +
            `ᴀᴄᴄᴏᴜɴᴛ ᴀɢᴇ ﹕ <t:${created}:R>\n` +
            `ᴍᴇᴍʙᴇʀꜱ ﹕ ${member.guild.memberCount}\n` +
            '────── ୨୧⠂⠂✦ ──────'
          )
          .setTimestamp()
        ]
      }).catch(() => {});
    }

    const embed = new EmbedBuilder()
      .setColor(0xFFCBF6)
      .setDescription(
        '────── ˖⁺.꒷꒦♡꒷꒦˖⁺. ──────\n' +
        '⋆. 𐙚˚࿔  ᴡᴇʟᴄᴏᴍᴇ ᴛᴏ /ʙʟꜱᴍ  𝜗𝜚˚⋆\n\n' +
        `${member} ɪꜱ ᴛʜᴇ ${ordinal(member.guild.memberCount)} ᴍᴇᴍʙᴇʀ\n\n` +
        'ʀᴇᴍᴇᴍʙᴇʀ ᴛᴏ ᴠᴇʀɪꜰʏ ɪɴ <#' + channels.verify + '>\n' +
        'ɢᴇᴛ ᴄᴏᴍꜰᴏʀᴛᴀʙʟᴇ!\n\n' +
        '────── ෆ˚⋆୨୧⋆˚ෆ ──────'
      )
      .setImage('https://media.discordapp.net/attachments/1515420062461329420/1524497582108442624/3ED022D9-DFCA-46E8-9C43-AAC2BF35A739.gif')
      .setTimestamp();

    channel.send({ embeds: [embed] }).catch(() => {});
  },
};
