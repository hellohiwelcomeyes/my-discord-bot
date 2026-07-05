const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'help',
  async executePrefix(message, args) {
    const embed = new EmbedBuilder()
      .setColor(0xFFCBF6)
      .setTitle('Commands')
      .setDescription(
        '`!a8ball <q>` — ask the 8-ball\n' +
        '`!aavatar [@u]` — see avatar\n' +
        '`!acoinflip` — flip a coin\n' +
        '`!aroll [XdY]` — roll dice\n' +
        '`!aserverinfo` — server stats\n' +
        '`!auserinfo [@u]` — user details\n' +
        '`!abotinfo` — bot system info\n' +
        '`!aremind 30m <text>` — reminder DMs you\n' +
        '`!as` — snipe last deleted msg\n' +
        '`!aticket` — open support ticket'
      )
      .setFooter({ text: 'Prefix: !a' })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  },
};
