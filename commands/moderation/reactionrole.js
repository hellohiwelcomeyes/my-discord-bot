const { EmbedBuilder } = require('discord.js');
const rr = require('../../utils/reactionroles');
const { isMod, noPermPrefix } = require('../../utils/permissions');

function buildEmbed(panel) {
  const entries = Object.entries(panel.roles || {});
  let desc = panel.description
    ? panel.description + '\n\n'
    : '────── ✦⠂⠂୨୧ ──────\n\n';
  if (entries.length) {
    desc += entries.map(([e, r]) => `${e}  <@&${r}>`).join('\n');
  } else {
    desc += '*no roles set*';
  }
  return new EmbedBuilder()
    .setColor(parseInt(panel.color || 'FFCBF6', 16))
    .setTitle(panel.title || 'Reaction Roles')
    .setDescription(desc)
    .setFooter({ text: 'react to get the role' })
    .setTimestamp();
}

module.exports = {
  name: 'reactionrole',
  async executePrefix(message, args) {
    if (!(await isMod(message.member))) return noPermPrefix(message);

    const sub = (args[0] || '').toLowerCase();

    // ── create <title> ──
    if (sub === 'create') {
      const title = args.slice(1).join(' ') || 'Reaction Roles';
      const embed = buildEmbed({ title, roles: {}, color: 'FFCBF6', description: '' });
      const msg = await message.channel.send({ embeds: [embed] });
      rr.setPanel(msg.id, { channelId: msg.channel.id, guildId: message.guild.id, title, roles: {}, color: 'FFCBF6', description: '' });
      await message.delete().catch(() => {});
      const reply = await message.channel.send(`panel created \`${msg.id}\``);
      return setTimeout(() => reply.delete().catch(() => {}), 3000);
    }

    // ── add :emoji: @role [panel_id] ──
    if (sub === 'add') {
      const emoji = args[1];
      const role = message.mentions.roles.first();
      if (!emoji || !role) return message.reply('usage: `!areactionrole add :emoji: @role [panel_id]`');
      const targetId = args[3] || null;

      const all = rr.getAll();
      const panels = Object.entries(all).filter(([id, p]) =>
        p.guildId === message.guild.id && (!targetId || targetId === 'all' || id === targetId)
      );
      if (!panels.length) return message.reply('no panels. create one with `!areactionrole create <title>`');

      for (const [msgId, panel] of panels) {
        panel.roles[emoji] = role.id;
        rr.setPanel(msgId, panel);
        const ch = message.guild.channels.cache.get(panel.channelId);
        if (ch) {
          const msg = await ch.messages.fetch(msgId).catch(() => null);
          if (msg) {
            await msg.react(emoji).catch(() => {});
            await msg.edit({ embeds: [buildEmbed(panel)] }).catch(() => {});
          }
        }
      }

      await message.delete().catch(() => {});
      const reply = await message.channel.send(`added ${emoji} → ${role}`);
      return setTimeout(() => reply.delete().catch(() => {}), 3000);
    }

    // ── remove :emoji [panel_id] ──
    if (sub === 'remove') {
      const emoji = args[1];
      if (!emoji) return message.reply('usage: `!areactionrole remove :emoji: [panel_id]`');

      const all = rr.getAll();
      let found = false;
      for (const [msgId, panel] of Object.entries(all)) {
        if (panel.guildId !== message.guild.id) continue;
        if (args[2] && msgId !== args[2]) continue;
        if (!panel.roles[emoji]) continue;

        delete panel.roles[emoji];
        rr.setPanel(msgId, panel);
        const ch = message.guild.channels.cache.get(panel.channelId);
        if (ch) {
          const msg = await ch.messages.fetch(msgId).catch(() => null);
          if (msg) {
            const reaction = msg.reactions.cache.find(r => (r.emoji.name || r.emoji.id) === emoji);
            if (reaction) await reaction.remove().catch(() => {});
            await msg.edit({ embeds: [buildEmbed(panel)] }).catch(() => {});
          }
        }
        found = true;
      }
      if (!found) return message.reply('emoji not found in any panel');
      return message.reply(`removed ${emoji}`);
    }

    // ── color <hex> [panel_id] ──
    if (sub === 'color') {
      const color = (args[1] || '').replace('#', '');
      if (!/^[0-9A-Fa-f]{6}$/.test(color)) return message.reply('usage: `!areactionrole color FFABCD [panel_id]`');
      const all = rr.getAll();
      for (const [msgId, panel] of Object.entries(all)) {
        if (panel.guildId !== message.guild.id) continue;
        if (args[2] && msgId !== args[2]) continue;
        panel.color = color;
        rr.setPanel(msgId, panel);
        const ch = message.guild.channels.cache.get(panel.channelId);
        if (ch) {
          const msg = await ch.messages.fetch(msgId).catch(() => null);
          if (msg) msg.edit({ embeds: [buildEmbed(panel)] }).catch(() => {});
        }
      }
      return message.reply(`color set to #${color}`);
    }

    // ── desc <text> [panel_id] ──
    if (sub === 'desc') {
      const desc = args.slice(1).join(' ');
      if (!desc) return message.reply('usage: `!areactionrole desc <text> [panel_id]`');
      const all = rr.getAll();
      for (const [msgId, panel] of Object.entries(all)) {
        if (panel.guildId !== message.guild.id) continue;
        if (args[2] && msgId !== args[2]) continue;
        panel.description = desc;
        rr.setPanel(msgId, panel);
        const ch = message.guild.channels.cache.get(panel.channelId);
        if (ch) {
          const msg = await ch.messages.fetch(msgId).catch(() => null);
          if (msg) msg.edit({ embeds: [buildEmbed(panel)] }).catch(() => {});
        }
      }
      return message.reply('description updated');
    }

    // ── list ──
    if (sub === 'list') {
      const all = rr.getAll();
      const entries = Object.entries(all).filter(([, p]) => p.guildId === message.guild.id);
      if (!entries.length) return message.reply('no panels');
      const lines = entries.map(([id, p]) =>
        `\`${id}\` **${p.title || 'Untitled'}** (${Object.keys(p.roles).length} roles)`
      );
      return message.channel.send(lines.join('\n'));
    }

    // ── help ──
    message.reply(
      '`!areactionrole create <title>` — create panel\n' +
      '`!areactionrole add :emoji: @role [panel_id]` — add role\n' +
      '`!areactionrole remove :emoji: [panel_id]` — remove role\n' +
      '`!areactionrole color <hex> [panel_id]` — set embed color\n' +
      '`!areactionrole desc <text> [panel_id]` — set description\n' +
      '`!areactionrole list` — list panels'
    );
  },
};
