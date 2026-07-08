const { SlashCommandBuilder } = require('discord.js');
const { isMod, noPermSlash, noPermPrefix } = require('../../utils/permissions');

module.exports = {
  name: 'hackban',
  data: new SlashCommandBuilder()
    .setName('hackban')
    .setDescription('Ban a user by ID even if not in the server')
    .addStringOption(opt => opt.setName('user_id').setDescription('User ID to ban').setRequired(true))
    .addStringOption(opt => opt.setName('reason').setDescription('Reason').setRequired(false)),

  async execute(interaction) {
    if (!await isMod(interaction.member)) return noPermSlash(interaction);

    const userId = interaction.options.getString('user_id');
    const reason = interaction.options.getString('reason') ?? 'No reason given';

    if (!/^\d{17,20}$/.test(userId))
      return interaction.reply({ content: 'invalid user ID', ephemeral: true });

    try {
      await interaction.guild.members.ban(userId, { reason: `${reason} | Hackbanned by ${interaction.user.tag}` });
      await interaction.reply({ content: `hackbanned \`${userId}\` · ${reason}`, ephemeral: true });
    } catch (err) {
      await interaction.reply({ content: `failed to ban \`${userId}\`: ${err.message}`, ephemeral: true });
    }
  },

  async executePrefix(message, args) {
    if (!await isMod(message.member)) return noPermPrefix(message);

    const userId = args[1];
    const reason = args.slice(2).join(' ') || 'No reason given';

    if (!userId || !/^\d{17,20}$/.test(userId))
      return message.reply('usage: `!ahackban <user_id> [reason]`');

    try {
      await message.guild.members.ban(userId, { reason: `${reason} | Hackbanned by ${message.author.tag}` });
      await message.reply(`hackbanned \`${userId}\` · ${reason}`);
    } catch (err) {
      await message.reply(`failed to ban \`${userId}\`: ${err.message}`);
    }
  },
};
