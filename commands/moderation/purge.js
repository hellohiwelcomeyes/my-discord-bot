const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { isMod, noPermSlash, noPermPrefix } = require('../../utils/permissions');

async function runPurge(channel, amount, filterUser) {
  const messages = await channel.messages.fetch({ limit: 100 });
  let toDelete = [...messages.values()].filter(m => {
    const age = Date.now() - m.createdTimestamp;
    return age < 14 * 24 * 60 * 60 * 1000;
  });
  if (filterUser) toDelete = toDelete.filter(m => m.author.id === filterUser.id);
  toDelete = toDelete.slice(0, amount);
  if (toDelete.length === 0) return { error: 'nothing to nuke' };
  const deleted = await channel.bulkDelete(toDelete, true);
  return new EmbedBuilder()
    .setColor(0xFFCBF6)
    .setTitle('Purged')
    .setDescription(`Cleaned **${deleted.size}** message${deleted.size === 1 ? '' : 's'}${filterUser ? ` from ${filterUser.tag}` : ''}.`)
    .setTimestamp();
}

module.exports = {
  name: 'purge',
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Bulk delete messages')
    .addIntegerOption(opt => opt.setName('amount').setDescription('How many to delete (1-100)').setMinValue(1).setMaxValue(100).setRequired(true))
    .addUserOption(opt => opt.setName('user').setDescription('Only from this user').setRequired(false)),

  async execute(interaction) {
    if (!await isMod(interaction.member)) return noPermSlash(interaction);
    await interaction.deferReply({ ephemeral: true });
    const result = await runPurge(interaction.channel, interaction.options.getInteger('amount'), interaction.options.getUser('user'));
    if (result.error) return interaction.editReply(result.error);
    await interaction.editReply({ embeds: [result] });
  },

  async executePrefix(message, args) {
    if (!await isMod(message.member)) return noPermPrefix(message);
    const amount = parseInt(args[0]);
    if (!amount || amount < 1 || amount > 100) return message.reply('Usage: `!apurge <1-100> [@user]`');
    const filterUser = message.mentions.users.first() ?? null;
    await message.delete().catch(() => {});
    const result = await runPurge(message.channel, amount, filterUser);
    if (result.error) return message.channel.send(result.error);
    const reply = await message.channel.send({ embeds: [result] });
    setTimeout(() => reply.delete().catch(() => {}), 5000);
  },
};
