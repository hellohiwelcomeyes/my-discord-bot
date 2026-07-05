const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'help',
  async executePrefix(message, args) {
    const embed = new EmbedBuilder()
      .setColor(0xFFCBF6)
      .setTitle('Commands')
      .setDescription(
        '```\n' +
        '8ball <q>       ask the 8-ball\n' +
        'avatar [@u]     see avatar\n' +
        'coinflip        flip a coin\n' +
        'roll [XdY]      roll dice\n' +
        'serverinfo      server stats\n' +
        'userinfo [@u]   user details\n' +
        'botinfo         bot system info\n' +
        'remind <t> <t>  reminder DMs you\n' +
        's               snipe last deleted msg\n' +
        'ticket          open support ticket\n' +
        '```'
      )
      .setFooter({ text: 'Prefix: !a' })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  },
};
