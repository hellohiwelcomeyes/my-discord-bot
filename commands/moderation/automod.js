const { SlashCommandBuilder } = require('discord.js');
const automod = require('../../utils/automod');
const { isMod, noPermSlash, noPermPrefix } = require('../../utils/permissions');

module.exports = {
  name: 'automod',
  data: new SlashCommandBuilder()
    .setName('automod')
    .setDescription('Word filter')
    .addSubcommand(sub => sub.setName('add').setDescription('Add word')
      .addStringOption(opt => opt.setName('word').setDescription('Word').setRequired(true))
      .addStringOption(opt => opt.setName('severity').setDescription('Level').addChoices(
        { name: 'Warn', value: 'warn' }, { name: 'Timeout', value: 'timeout' },
        { name: 'Kick', value: 'kick' }, { name: 'Ban', value: 'ban' },
      )))
    .addSubcommand(sub => sub.setName('remove').setDescription('Remove word')
      .addStringOption(opt => opt.setName('word').setDescription('Word').setRequired(true)))
    .addSubcommand(sub => sub.setName('list').setDescription('Show filter list'))
    .addSubcommand(sub => sub.setName('toggle').setDescription('On/off')),

  async execute(interaction) {
    if (!(await isMod(interaction.member))) return noPermSlash(interaction);
    const sub = interaction.options.getSubcommand();

    if (sub === 'add') {
      const word = interaction.options.getString('word').toLowerCase();
      const severity = interaction.options.getString('severity') || 'warn';
      if (automod.addWord(word, severity)) {
        return interaction.reply({ content: `got "${word}" (${severity})`, ephemeral: true });
      }
      return interaction.reply({ content: `"${word}" already there`, ephemeral: true });
    }

    if (sub === 'remove') {
      const word = interaction.options.getString('word').toLowerCase();
      if (automod.removeWord(word)) {
        return interaction.reply({ content: `dropped "${word}"`, ephemeral: true });
      }
      return interaction.reply({ content: `"${word}" not found`, ephemeral: true });
    }

    if (sub === 'list') {
      const words = automod.getWords();
      if (!words.length) return interaction.reply({ content: 'empty', ephemeral: true });
      const s = automod.isEnabled() ? 'on' : 'off';
      return interaction.reply({ content: `**filter** (${s})\n` + words.map((w, i) => `${i+1}. ${w.word} (${w.severity})`).join('\n'), ephemeral: true });
    }

    if (sub === 'toggle') {
      return interaction.reply({ content: `filter ${automod.toggle() ? 'on' : 'off'}`, ephemeral: true });
    }
  },

  async executePrefix(message, args) {
    if (!(await isMod(message.member))) return noPermPrefix(message);

    const sub = (args[0] || '').toLowerCase();

    if (sub === 'add') {
      const word = args[1]?.toLowerCase();
      const severity = (args[2] || 'warn').toLowerCase();
      if (!word) return message.reply('usage: `!aautomod add <word> [warn|timeout|kick|ban]`');
      if (!['warn', 'timeout', 'kick', 'ban'].includes(severity)) {
        return message.reply('warn, timeout, kick, or ban only');
      }
      if (automod.addWord(word, severity)) {
        return message.reply(`got "${word}" (${severity})`);
      }
      return message.reply(`"${word}" already there`);
    }

    if (sub === 'remove') {
      const word = args[1]?.toLowerCase();
      if (!word) return message.reply('usage: `!aautomod remove <word>`');
      if (automod.removeWord(word)) {
        return message.reply(`dropped "${word}"`);
      }
      return message.reply(`"${word}" not found`);
    }

    if (sub === 'list') {
      const words = automod.getWords();
      if (!words.length) return message.reply('empty');
      const s = automod.isEnabled() ? 'on' : 'off';
      return message.reply(`**filter** (${s})\n` + words.map((w, i) => `${i+1}. ${w.word} (${w.severity})`).join('\n'));
    }

    if (sub === 'toggle') {
      return message.reply(`filter ${automod.toggle() ? 'on' : 'off'}`);
    }

    message.reply('`!aautomod add/remove/list/toggle`');
  },
};
