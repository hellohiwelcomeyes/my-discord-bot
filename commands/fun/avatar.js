const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
function buildEmbed(target) {
  return new EmbedBuilder()    .setColor(0xFFCBF6).setTitle(`🖼️ ${target.username}`)
    .setImage(target.displayAvatarURL({ size: 1024 })).setTimestamp();
}
module.exports = {
  name: 'avatar',
  data: new SlashCommandBuilder().setName('avatar').setDescription("Get a user's avatar")
    .addUserOption(opt => opt.setName('user').setDescription('User (defaults to you)').setRequired(false)),
  async execute(interaction) {
    await interaction.reply({ embeds: [buildEmbed(interaction.options.getUser('user') ?? interaction.user)] });
  },
  async executePrefix(message) {
    const target = message.mentions.users.first() ?? message.author;
    await message.reply({ embeds: [buildEmbed(target)] });
  },
};
