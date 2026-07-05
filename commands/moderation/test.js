const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const welcomeEvent = require('../../events/guildMemberAdd');
const goodbyeEvent = require('../../events/guildMemberRemove');

module.exports = {
  name: 'test',
  data: new SlashCommandBuilder()
    .setName('test')
    .setDescription('Test welcome/goodbye embeds')
    .addSubcommand(s => s.setName('welcome').setDescription('Test welcome embed').addUserOption(o => o.setName('user').setDescription('User to test with')))
    .addSubcommand(s => s.setName('goodbye').setDescription('Test goodbye embed').addUserOption(o => o.setName('user').setDescription('User to test with'))),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const target = interaction.options.getUser('user') || interaction.user;
    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (!member) return interaction.reply({ content: ':skull: user not in server', ephemeral: true });

    if (sub === 'welcome') {
      await welcomeEvent.execute(member, interaction.client);
      await interaction.reply({ content: 'welcome embed sent', ephemeral: true });
    } else {
      await goodbyeEvent.execute(member, interaction.client);
      await interaction.reply({ content: 'goodbye embed sent', ephemeral: true });
    }
  },

  async executePrefix(message, args) {
    const sub = args[0];
    if (!sub || !['welcome', 'goodbye'].includes(sub)) {
      return message.reply('usage: `!atest welcome [@user]` or `!atest goodbye [@user]`');
    }
    const target = message.mentions.users.first() || message.author;
    const member = await message.guild.members.fetch(target.id).catch(() => null);
    if (!member) return message.reply(':skull: user not in server');

    if (sub === 'welcome') {
      await welcomeEvent.execute(member, message.client);
      await message.reply('welcome embed sent');
    } else {
      await goodbyeEvent.execute(member, message.client);
      await message.reply('goodbye embed sent');
    }
  },
};
