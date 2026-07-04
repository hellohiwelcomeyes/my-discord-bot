const { SlashCommandBuilder } = require('discord.js');
const { isMod, noPermSlash, noPermPrefix } = require('../../utils/permissions');

async function runBan(guild, target, reason, days, modTag) {
  if (!target) return { error: 'who' };
  if (!target.bannable) return { error: 'nice try' };
  if (target.id === guild.members.me.id) return { error: 'no' };

  await target.send(`banned from ${guild.name} · ${reason}`).catch(() => {});
  await target.ban({ deleteMessageDays: days, reason: `${reason} | Banned by ${modTag}` });

  return { text: `**${target.user.tag}** gone.` };
}

module.exports = {
  name: 'ban',
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a member from the server')
    .addUserOption(opt => opt.setName('user').setDescription('User to ban').setRequired(true))
    .addStringOption(opt => opt.setName('reason').setDescription('Reason').setRequired(false))
    .addIntegerOption(opt => opt.setName('days').setDescription('Days of messages to delete (0-7)').setMinValue(0).setMaxValue(7).setRequired(false)),

  async execute(interaction) {
    if (!await isMod(interaction.member)) return noPermSlash(interaction);
    const target = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason') ?? 'No reason given';
    const days = interaction.options.getInteger('days') ?? 0;
    const result = await runBan(interaction.guild, target, reason, days, interaction.user.tag);
    if (result.error) return interaction.reply({ content: result.error, ephemeral: true });
    await interaction.reply({ content: result.text });
  },

  async executePrefix(message, args) {
    if (!await isMod(message.member)) return noPermPrefix(message);
    const target = message.mentions.members.first();
    const reason = args.slice(1).join(' ') || 'No reason given';
    const result = await runBan(message.guild, target, reason, 0, message.author.tag);
    if (result.error) return message.reply(result.error);
    await message.reply(result.text);
  },
};
