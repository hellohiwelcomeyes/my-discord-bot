const { SlashCommandBuilder } = require('discord.js');
const qotd = require('../../utils/qotd');
const { isMod, noPermSlash } = require('../../utils/permissions');

module.exports = {
  name: 'qotd',
  data: new SlashCommandBuilder()
    .setName('qotd')
    .setDescription('Post the question of the day now'),

  async execute(interaction) {
    if (!(await isMod(interaction.member))) return noPermSlash(interaction);
    await qotd.postQOTD(interaction.client);
    await interaction.reply({ content: 'posted', ephemeral: true });
  },

  async executePrefix(message) {
    if (!(await isMod(message.member))) return require('../../utils/permissions').noPermPrefix(message);
    await qotd.postQOTD(message.client);
    await message.reply('posted');
  },
};
