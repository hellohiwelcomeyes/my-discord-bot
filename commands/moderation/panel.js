const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { isMod, noPermPrefix } = require('../../utils/permissions');

module.exports = {
  name: 'panel',
  async executePrefix(message, args) {
    if (!(await isMod(message.member))) return noPermPrefix(message);
    const embed = new EmbedBuilder()
      .setColor(0xFFCBF6)
      .setTitle('🎫 Support Tickets')
      .setDescription(
        'Need help?\n\n' +
        'Type **`!aticket`** to open a ticket.\n' +
        "Staff will create a private channel to help you out."
      )
      .addFields(
        { name: 'Note', value: "Don't spam tickets or you risk a warning." },
      )
      .setFooter({ text: message.guild.name })
      .setTimestamp();

    await message.delete().catch(() => {});
    await message.channel.send({ embeds: [embed] });
  },
};
