const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'help',
  async executePrefix(message, args) {
    const embed = new EmbedBuilder()
      .setColor(0xFFCBF6)
      .setTitle('Commands')
      .setDescription('All commands:')
      .addFields(
        { name: '🎱 `!a8ball <question>`', value: 'Ask the 8-ball anything', inline: false },
        { name: '🖼️ `!aavatar [@user]`', value: "See someone's avatar", inline: false },
        { name: '🪙 `!acoinflip`', value: 'Flip a coin', inline: false },
        { name: '🎲 `!aroll [dice]`', value: 'Roll some dice', inline: false },
        { name: '🏠 `!aserverinfo`', value: 'Server stats', inline: false },
        { name: '👤 `!auserinfo [@user]`', value: 'User details', inline: false },
        { name: '🎫 `!aticket`', value: 'Open a support ticket', inline: false },
      )
      .setFooter({ text: `Prefix: !a` })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  },
};
