const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
function rollDice(input, userTag) {
  const match = input.toLowerCase().match(/^(\d+)d(\d+)$/);
  if (!match) return { error: 'Invalid format. Try `2d6` or `1d20`.' };
  const count = Math.min(parseInt(match[1]), 25);
  const sides = Math.min(parseInt(match[2]), 1000);
  if (sides < 2) return { error: 'Dice need at least 2 sides.' };
  const rolls = Array.from({ length: count }, () => Math.floor(Math.random() * sides) + 1);
  const total = rolls.reduce((a, b) => a + b, 0);
  return new EmbedBuilder().setColor(0xFFCBF6).setTitle(`🎲 Roll ${count}d${sides}`)
    .addFields({ name: 'Rolls', value: rolls.join(', ') }, { name: 'Total', value: `**${total}**`, inline: true }, { name: 'Average', value: `${(total/count).toFixed(1)}`, inline: true })
    .setFooter({ text: `Rolled by ${userTag}` }).setTimestamp();
}
module.exports = {
  name: 'roll',
  data: new SlashCommandBuilder().setName('roll').setDescription('Roll dice (e.g. 2d6)')
    .addStringOption(opt => opt.setName('dice').setDescription('Dice notation like 2d6 (default: 1d6)').setRequired(false)),
  async execute(interaction) {
    const result = rollDice(interaction.options.getString('dice') ?? '1d6', interaction.user.tag);
    if (result.error) return interaction.reply({ content: result.error, ephemeral: true });
    await interaction.reply({ embeds: [result] });
  },
  async executePrefix(message, args) {
    const result = rollDice(args[0] ?? '1d6', message.author.tag);
    if (result.error) return message.reply(result.error);
    await message.reply({ embeds: [result] });
  },
};
