const reminder = require('../../utils/reminder');

function parseDuration(str) {
  const m = str.toLowerCase().match(/^(\d+)([smhd])$/);
  if (!m) return null;
  const n = parseInt(m[1]);
  const mult = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return n * (mult[m[2]] || 60000);
}

module.exports = {
  name: 'remind',
  async executePrefix(message, args) {
    if (!args.length) return message.reply('Usage: `!aremind 30m do something`');

    const duration = parseDuration(args[0]);
    if (!duration) return message.reply('Invalid time. Use e.g. `30m`, `2h`, `1d`');

    const text = args.slice(1).join(' ') || 'no message';
    const id = reminder.setReminder(message.author.id, duration, text, message.client);

    const h = Math.floor(duration / 3600000);
    const m = Math.floor((duration % 3600000) / 60000);
    const s = Math.floor((duration % 60000) / 1000);
    let timeStr = '';
    if (h) timeStr += `${h}h `;
    if (m) timeStr += `${m}m `;
    if (s && !h) timeStr += `${s}s`;

    await message.reply(`got it, will remind you in ${timeStr.trim()}`);
  },
};