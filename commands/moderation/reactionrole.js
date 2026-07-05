const { EmbedBuilder } = require('discord.js');
const rr = require('../../utils/reactionroles');
const { isMod, noPermPrefix } = require('../../utils/permissions');

module.exports = {
  name: 'reactionrole',
  async executePrefix(message, args) {
    if (!(await isMod(message.member))) return noPermPrefix(message);

    const sub = (args[0] || '').toLowerCase();

    if (sub === 'create') {
      const embed = new EmbedBuilder()
        .setColor(0xFFCBF6)
        .setTitle('Reaction Roles')
        .setDescription('React to get roles!')
        .setTimestamp();

      const msg = await message.channel.send({ embeds: [embed] });
      await message.delete().catch(() => {});

      rr.setPanel(msg.id, { channelId: msg.channel.id, guildId: msg.guild.id, roles: {} });

      return msg.reply(`Panel created. Use \`reactionrole add :emoji: @role\``);
    }

    if (sub === 'add') {
      const panelEntries = Object.entries(rr.getAll());
      if (!panelEntries.length) return message.reply('Create a panel first with `reactionrole create`');

      const targetMsgId = args[args.length - 1].match(/^\d+$/) ? args.pop() : null;
      const role = message.mentions.roles.first();
      const emoji = args.slice(1, args.indexOf(`<@&${role?.id}>`) > 0 ? args.indexOf(`<@&${role.id}>`) : args.length).filter(a => !a.startsWith('<@&'))[0];
      if (!emoji || !role) return message.reply('Usage: `reactionrole add :emoji: @role [msgId]`');

      const messageId = targetMsgId || panelEntries[0][0];
      const panel = rr.getPanel(messageId);
      if (!panel) return message.reply('Panel not found.');

      const emojiKey = role;
      // just grab actual emoji from the message
      const cleanEmoji = emoji.replace(/[<:>]/g, '').split(':')[0] || emoji;
      panel.roles[cleanEmoji] = role.id;
      rr.setPanel(messageId, panel);

      try {
        const channel = message.guild.channels.cache.get(panel.channelId);
        if (channel) {
          const msg = await channel.messages.fetch(messageId);
          await msg.react(cleanEmoji);
        }
      } catch {}

      await message.delete().catch(() => {});
      const reply = await message.channel.send(`Added ${cleanEmoji} -> ${role}.`);
      return setTimeout(() => reply.delete().catch(() => {}), 3000);
    }

    if (sub === 'remove') {
      const emoji = args[1];
      const messageId = args[2];
      if (!emoji || !messageId) return message.reply('Usage: `reactionrole remove :emoji: <msgId>`');

      const panel = rr.getPanel(messageId);
      if (!panel || !panel.roles[emoji]) return message.reply('not found');

      delete panel.roles[emoji];
      rr.setPanel(messageId, panel);
      return message.reply(`removed ${emoji}`);
    }

    if (sub === 'list') {
      const all = rr.getAll();
      const entries = Object.entries(all);
      if (!entries.length) return message.reply('no panels');

      const lines = entries.map(([id, p]) => {
        const roles = Object.entries(p.roles).map(([e, r]) => `  ${e} -> <@&${r}>`).join('\n');
        return `**Panel:** ${id}\n${roles || '  no roles'}`;
      });

      return message.channel.send(lines.join('\n\n'));
    }

    message.reply('`!areactionrole create | add :emoji: @role [msgId] | remove :emoji: <msgId> | list`');
  },
};