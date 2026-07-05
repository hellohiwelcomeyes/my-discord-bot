const { SlashCommandBuilder } = require('discord.js');
const qotd = require('../../utils/qotd');

module.exports = {
  name: 'qotd',
  data: new SlashCommandBuilder()
    .setName('qotd')
    .setDescription('Post the question of the day now'),

  async execute(interaction) {
    await qotd.postQOTD(interaction.client);
    await interaction.reply({ content: 'posted', ephemeral: true });
  },

  async executePrefix(message) {
    await qotd.postQOTD(message.client);
    await message.reply('posted');
  },
};
