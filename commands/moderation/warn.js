const { SlashCommandBuilder } = require('discord.js');
const { isMod, noPermSlash, noPermPrefix } = require('../../utils/permissions');

const warns = new Map();

function getWarns(guildId, userId) {
  return warns.get(`${guildId}-${userId}`) ?? [];
}

module.exports = {
  name: 'warn',
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warn system')
    .addSubcommand(sub => sub.setName('add').setDescription('Warn someone')
      .addUserOption(opt => opt.setName('user').setDescription('User').setRequired(true))
      .addStringOption(opt => opt.setName('reason').setDescription('Reason').setRequired(true)))
    .addSubcommand(sub => sub.setName('list').setDescription('Check warns')
      .addUserOption(opt => opt.setName('user').setDescription('User').setRequired(true)))
    .addSubcommand(sub => sub.setName('clear').setDescription('Clear warns')
      .addUserOption(opt => opt.setName('user').setDescription('User').setRequired(true))),

  async execute(interaction) {
    if (!await isMod(interaction.member)) return noPermSlash(interaction);
    const sub = interaction.options.getSubcommand();
    const target = interaction.options.getUser('user');
    const key = `${interaction.guild.id}-${target.id}`;

    if (sub === 'add') {
      const reason = interaction.options.getString('reason');
      if (!warns.has(key)) warns.set(key, []);
      warns.get(key).push({ reason, mod: interaction.user.tag, date: new Date().toISOString() });
      const count = warns.get(key).length;
      await target.send(`warned in ${interaction.guild.name} · ${reason} (${count})`).catch(() => {});
      return interaction.reply({ content: `**${target.tag}** warned (${count})`, ephemeral: true });
    }

    if (sub === 'list') {
      const list = getWarns(interaction.guild.id, target.id);
      if (!list.length) return interaction.reply({ ephemeral: true, content: `${target.tag} is clean` });
      return interaction.reply({ ephemeral: true, content: `**${target.tag}** (${list.length}):\n` + list.map((w, i) => `${i+1}. ${w.reason} — ${w.mod}`).join('\n') });
    }

    if (sub === 'clear') {
      warns.delete(key);
      return interaction.reply({ content: `wiped ${target.tag}`, ephemeral: true });
    }
  },

  async executePrefix(message, args) {
    if (!await isMod(message.member)) return noPermPrefix(message);
    const sub = args[0]?.toLowerCase();
    const target = message.mentions.users.first();
    if (!target) return message.reply('Mention a user.');
    const key = `${message.guild.id}-${target.id}`;

    if (sub === 'add') {
      const reason = args.slice(2).join(' ') || 'No reason given';
      if (!warns.has(key)) warns.set(key, []);
      warns.get(key).push({ reason, mod: message.author.tag, date: new Date().toISOString() });
      const count = warns.get(key).length;
      return message.reply(`**${target.tag}** warned (${count})`);
    }
    if (sub === 'list') {
      const list = getWarns(message.guild.id, target.id);
      if (!list.length) return message.reply(`${target.tag} is clean`);
      return message.reply(`**${target.tag}** (${list.length}):\n` + list.map((w, i) => `${i+1}. ${w.reason} — ${w.mod}`).join('\n'));
    }
    if (sub === 'clear') {
      warns.delete(key);
      return message.reply(`wiped ${target.tag}`);
    }
    return message.reply('Usage: `!awarn add/list/clear @user [reason]`');
  },
};
