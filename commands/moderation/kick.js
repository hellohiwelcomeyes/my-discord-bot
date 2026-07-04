const { SlashCommandBuilder } = require('discord.js');
const { isMod, noPermSlash, noPermPrefix } = require('../../utils/permissions');

async function runKick(guild, target, reason, modTag) {
  if (!target) return { error: 'who' };
  if (!target.kickable) return { error: 'nice try' };

  await target.send(`kicked from ${guild.name} · ${reason}`).catch(() => {});
  await target.kick(`${reason} | Kicked by ${modTag}`);

  return { text: `**${target.user.tag}** out.` };
}

module.exports = {
  name: 'kick',
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a member from the server')
    .addUserOption(opt => opt.setName('user').setDescription('User to kick').setRequired(true))
    .addStringOption(opt => opt.setName('reason').setDescription('Reason').setRequired(false)),

  async execute(interaction) {
    if (!await isMod(interaction.member)) return noPermSlash(interaction);
    const target = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason') ?? 'No reason given';
    const result = await runKick(interaction.guild, target, reason, interaction.user.tag);
    if (result.error) return interaction.reply({ content: result.error, ephemeral: true });
    await interaction.reply({ content: result.text });
  },

  async executePrefix(message, args) {
    if (!await isMod(message.member)) return noPermPrefix(message);
    const target = message.mentions.members.first();
    const reason = args.slice(1).join(' ') || 'No reason given';
    const result = await runKick(message.guild, target, reason, message.author.tag);
    if (result.error) return message.reply(result.error);
    await message.reply(result.text);
  },
};
