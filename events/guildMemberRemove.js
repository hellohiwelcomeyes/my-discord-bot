const { EmbedBuilder } = require('discord.js');
const { channels } = require('../config');

module.exports = {
  name: 'guildMemberRemove',
  async execute(member, client) {
    const channel = client.channels.cache.get(channels.goodbye);
    if (!channel) return;

    const duration = Math.floor((Date.now() - (member.joinedTimestamp || Date.now())) / 86400000);

    const logCh = client.channels.cache.get(channels.memberLog);
    if (logCh) {
      logCh.send({
        embeds: [new EmbedBuilder()
          .setColor(0xFFCBF6)
          .setDescription(
            '────── ✦⠂⠂୨୧ ──────\n' +
            `ʟᴇꜰᴛ ﹕ ${member.user.tag} (\`${member.id}\`)\n` +
            `ᴛɪᴍᴇ ʜᴇʀᴇ ﹕ ${duration}d\n` +
            `ᴍᴇᴍʙᴇʀꜱ ﹕ ${member.guild.memberCount}\n` +
            '────── ୨୧⠂⠂✦ ──────'
          )
          .setTimestamp()
        ]
      }).catch(() => {});
    }

    const embed = new EmbedBuilder()
      .setColor(0xFFCBF6)
      .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL({ size: 64 }) })
      .setDescription(
        '────── ｡•┈୨♡୧┈•｡ ──────\n' +
        '⋆. 𐙚˚࿔  ɢᴏᴏᴅʙʏᴇ /ʙʟꜱᴍ  𝜗𝜚˚⋆\n\n' +
        `${member.user.username} ʜᴀꜱ ʟᴇꜰᴛ\n` +
        `${member.guild.memberCount} ᴍᴇᴍʙᴇʀꜱ ʀᴇᴍᴀɪɴ\n\n` +
        '────── ⋅˚₊‧୨୧‧₊˚⋅ ──────'
      )
      .addFields(
        { name: 'ᴛɪᴍᴇ ʜᴇʀᴇ', value: `${duration}d`, inline: true },
        { name: 'ᴊᴏɪɴᴇᴅ', value: member.joinedTimestamp ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` : 'Unknown', inline: true },
      )
      .setFooter({ text: 'ɪᴅ: ' + member.id })
      .setTimestamp();

    channel.send({ embeds: [embed] }).catch(() => {});
  },
};
