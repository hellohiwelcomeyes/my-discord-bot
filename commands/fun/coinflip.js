const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
function buildEmbed(user) {
  const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
  return new EmbedBuilder().setColor(0xFFCBF6)
    .setTitle(`🪙 ${result}!`).setDescription(`${user} flipped **${result}**.`).setTimestamp();
}
module.exports = {
  name: 'coinflip',
  data: new SlashCommandBuilder().setName('coinflip').setDescription('Flip a coin!'),
  async execute(interaction) { await interaction.reply({ embeds: [buildEmbed(interaction.user)] }); },
  async executePrefix(message) { await message.reply({ embeds: [buildEmbed(message.author)] }); },
};
