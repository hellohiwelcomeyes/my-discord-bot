const { SlashCommandBuilder } = require('discord.js');
const { isMod, noPermSlash, noPermPrefix } = require('../../utils/permissions');

const DURATION_MAP = {
  '60':     { label: '1m',   ms: 60_000 },
  '300':    { label: '5m',  ms: 300_000 },
  '600':    { label: '10m', ms: 600_000 },
  '3600':   { label: '1h',     ms: 3_600_000 },
  '86400':  { label: '1d',      ms: 86_400_000 },
  '604800': { label: '1w',     ms: 604_800_000 },
};

function parseDuration(str) {
  const map = { m: 60, h: 3600, d: 86400, w: 604800 };
  const match = str.match(/^(\d+)([mhdw])$/i);
  if (!match) return null;
  const seconds = parseInt(match[1]) * map[match[2].toLowerCase()];
  const entry = DURATION_MAP[String(seconds)];
  return entry ? { ...entry, seconds } : null;
}

async function runTimeout(target, ms, label, reason, modTag) {
  if (!target) return { error: 'who' };
  if (!target.moderatable) return { error: 'nice try' };

  await target.timeout(ms, `${reason} | By ${modTag}`);

  return { text: `**${target.user.tag}** shut up for ${label}.` };
}

module.exports = {
  name: 'timeout',
  data: new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Timeout a member')
    .addUserOption(opt => opt.setName('user').setDescription('User to timeout').setRequired(true))
    .addStringOption(opt => opt.setName('duration').setDescription('Duration').setRequired(true)
      .addChoices(
        { name: '1 minute',   value: '60' },
        { name: '5 minutes',  value: '300' },
        { name: '10 minutes', value: '600' },
        { name: '1 hour',     value: '3600' },
        { name: '1 day',      value: '86400' },
        { name: '1 week',     value: '604800' },
      ))
    .addStringOption(opt => opt.setName('reason').setDescription('Reason').setRequired(false)),

  async execute(interaction) {
    if (!await isMod(interaction.member)) return noPermSlash(interaction);
    const target = interaction.options.getMember('user');
    const durationKey = interaction.options.getString('duration');
    const reason = interaction.options.getString('reason') ?? 'No reason given';
    const { label, ms } = DURATION_MAP[durationKey];
    const result = await runTimeout(target, ms, label, reason, interaction.user.tag);
    if (result.error) return interaction.reply({ content: result.error, ephemeral: true });
    await interaction.reply({ content: result.text });
  },

  async executePrefix(message, args) {
    if (!await isMod(message.member)) return noPermPrefix(message);
    const target = message.mentions.members.first();
    const durationStr = args[1];
    const reason = args.slice(2).join(' ') || 'No reason given';
    if (!durationStr) return message.reply('Usage: `!atimeout @user <1m/10m/1h/1d/1w> [reason]`');
    const duration = parseDuration(durationStr);
    if (!duration) return message.reply('Invalid duration. Try: `1m`, `10m`, `1h`, `1d`, `1w`');
    const result = await runTimeout(target, duration.ms, duration.label, reason, message.author.tag);
    if (result.error) return message.reply(result.error);
    await message.reply(result.text);
  },
};
