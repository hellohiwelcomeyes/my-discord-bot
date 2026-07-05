const { EmbedBuilder } = require('discord.js');
const snipe = require('../../utils/snipe');

module.exports = {
  name: 's',
  async executePrefix(message) {
    const data = snipe.get(message.channel.id);
    if (!data) return message.reply('nothing to snipe');

    const embed = new EmbedBuilder()
      .setColor(0xFFCBF6)
      .setAuthor({ name: data.author })
      .setDescription(data.content)
      .setFooter({ text: `snipe · <t:${Math.floor(data.timestamp / 1000)}:R>` })
      .setTimestamp();

    if (data.image) embed.setImage(data.image);

    await message.channel.send({ embeds: [embed] });
    await message.delete().catch(() => {});
  },
};
