const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'help',
  async executePrefix(message, args) {
    const embed = new EmbedBuilder()
      .setColor(0xFFCBF6)
      .setTitle('Commands')
      .setDescription('All commands:')
      .addFields(
        { name: '🎱 `!a8ball <q>`', value: 'ask the 8-ball', inline: true },
        { name: '🖼️ `!aavatar [@u]`', value: 'see avatar', inline: true },
        { name: '🪙 `!acoinflip`', value: 'flip a coin', inline: true },
        { name: '🎲 `!aroll [XdY]`', value: 'roll dice', inline: true },
        { name: '🏠 `!aserverinfo`', value: 'server stats', inline: true },
        { name: '👤 `!auserinfo [@u]`', value: 'user details', inline: true },
        { name: '🤖 `!abotinfo`', value: 'bot system info', inline: true },
        { name: '🔔 `!aremind 30m <text>`', value: 'reminder DMs you', inline: true },
        { name: '👻 `!as`', value: 'snipe last deleted msg', inline: true },
        { name: '🎫 `!aticket`', value: 'open support ticket', inline: true },
      )
      .setFooter({ text: `Prefix: !a` })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  },
};
