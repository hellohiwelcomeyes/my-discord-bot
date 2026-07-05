const { EmbedBuilder } = require('discord.js');
const rr = require('../../utils/reactionroles');
const { isMod, noPermPrefix } = require('../../utils/permissions');

function buildPanelEmbed(roles, guild) {
  const desc = Object.entries(roles).length
    ? Object.entries(roles).map(([e, r]) => `${e} → <@&${r}>`).join('\n')
    : 'No roles set up yet.';
  return new EmbedBuilder()
    .setColor(0xFFCBF6)
    .setTitle('Reaction Roles')
    .setDescription(desc)
    .setFooter({ text: 'React to get the role above' })
    .setTimestamp();
}

module.exports = {
  name: 'reactionrole',
  async executePrefix(message, args) {
    if (!(await isMod(message.member))) return noPermPrefix(message);

    const sub = (args[0] || '').toLowerCase();

    if (sub === 'add' || (!sub && message.mentions.roles.size)) {
      const role = message.mentions.roles.first();
      const emoji = args[0]?.startsWith('<') ? null : args[0];
      const cleanEmoji = emoji || args[1 === (message.mentions.roles.first() ? 0 : 1)] || args[0];
      if (!role) return message.reply('Usage: `!areactionrole add :emoji: @role`');

      const allPanels = rr.getAll();
      const existing = Object.entries(allPanels).find(([, p]) => p.guildId === message.guild.id);

      let msg;
      if (existing) {
        const [msgId, panel] = existing;
        const channel = message.guild.channels.cache.get(panel.channelId);
        if (channel) msg = await channel.messages.fetch(msgId).catch(() => null);
      }

      if (!msg) {
        const embed = buildPanelEmbed({}, message.guild);
        msg = await message.channel.send({ embeds: [embed] });
        rr.setPanel(msg.id, { channelId: msg.channel.id, guildId: message.guild.id, roles: {} });
      }

      const panel = rr.getPanel(msg.id);
      const actualEmoji = cleanEmoji || args[1];
      panel.roles[actualEmoji] = role.id;
      rr.setPanel(msg.id, panel);

      try { await msg.react(actualEmoji); } catch {}

      await msg.edit({ embeds: [buildPanelEmbed(panel.roles, message.guild)] });
      await message.delete().catch(() => {});
      const reply = await message.channel.send(`Added ${actualEmoji} → ${role}`);
      return setTimeout(() => reply.delete().catch(() => {}), 3000);
    }

    if (sub === 'remove') {
      const emoji = args[1];
      if (!emoji) return message.reply('Usage: `!areactionrole remove :emoji:`');

      const allPanels = rr.getAll();
      const existing = Object.entries(allPanels).find(([, p]) => p.guildId === message.guild.id);
      if (!existing) return message.reply('No panel found for this server.');

      const [msgId, panel] = existing;
      if (!panel.roles[emoji]) return message.reply('That emoji is not in the panel.');

      delete panel.roles[emoji];
      rr.setPanel(msgId, panel);

      const channel = message.guild.channels.cache.get(panel.channelId);
      if (channel) {
        const msg = await channel.messages.fetch(msgId).catch(() => null);
        if (msg) {
          const reaction = msg.reactions.cache.find(r => (r.emoji.name || r.emoji.id) === emoji);
          if (reaction) await reaction.remove().catch(() => {});
          await msg.edit({ embeds: [buildPanelEmbed(panel.roles, message.guild)] });
        }
      }

      return message.reply(`Removed ${emoji}`);
    }

    if (sub === 'list') {
      const all = rr.getAll();
      const entries = Object.entries(all);
      if (!entries.length) return message.reply('no panels');

      const lines = entries.map(([id, p]) => {
        const roles = Object.entries(p.roles).map(([e, r]) => `  ${e} → <@&${r}>`).join('\n');
        return `**Panel:** ${id}\n${roles || '  no roles'}`;
      });

      return message.channel.send(lines.join('\n\n'));
    }

    message.reply('`!areactionrole add :emoji: @role | remove :emoji: | list`');
  },
};
