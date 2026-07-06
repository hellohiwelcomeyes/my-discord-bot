const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const rr = require('../../utils/reactionroles');
const { isMod, noPermSlash } = require('../../utils/permissions');

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

const panelOption = o => o.setName('panel').setDescription('Panel ID (leave empty for all)').setRequired(false);

module.exports = {
  name: 'reactionrole',
  data: new SlashCommandBuilder()
    .setName('reactionrole')
    .setDescription('Manage reaction role panels')
    .addSubcommand(s => s.setName('create').setDescription('Create a new reaction role panel').addStringOption(o => o.setName('title').setDescription('Panel title').setRequired(false)))
    .addSubcommand(s => s.setName('add').setDescription('Add a reaction role').addStringOption(o => o.setName('emoji').setDescription('Emoji for the role').setRequired(true)).addRoleOption(o => o.setName('role').setDescription('Role to assign').setRequired(true)).addStringOption(o => o.setName('panel').setDescription('Panel ID (leave empty for all)').setRequired(false)))
    .addSubcommand(s => s.setName('remove').setDescription('Remove a reaction role').addStringOption(o => o.setName('emoji').setDescription('Emoji to remove').setRequired(true)).addStringOption(o => o.setName('panel').setDescription('Panel ID').setRequired(false)))
    .addSubcommand(s => s.setName('color').setDescription('Set panel embed color').addStringOption(o => o.setName('hex').setDescription('Hex color (e.g. FFCBF6)').setRequired(true)).addStringOption(panelOption))
    .addSubcommand(s => s.setName('desc').setDescription('Set panel description').addStringOption(o => o.setName('text').setDescription('Description text').setRequired(true)).addStringOption(panelOption))
    .addSubcommand(s => s.setName('list').setDescription('List all panels')),

  async execute(interaction) {
    if (!(await isMod(interaction.member))) return noPermSlash(interaction);

    const sub = interaction.options.getSubcommand();
    const all = rr.getAll();

    if (sub === 'create') {
      const title = interaction.options.getString('title') || 'Reaction Roles';
      const embed = buildEmbed({ title, roles: {}, color: 'FFCBF6', description: '' });
      const msg = await interaction.channel.send({ embeds: [embed] });
      rr.setPanel(msg.id, { channelId: msg.channel.id, guildId: interaction.guild.id, title, roles: {}, color: 'FFCBF6', description: '' });
      return interaction.reply({ content: `panel created \`${msg.id}\``, ephemeral: true });
    }

    if (sub === 'add') {
      const emoji = interaction.options.getString('emoji');
      const role = interaction.options.getRole('role');
      const targetId = interaction.options.getString('panel');

      const panels = Object.entries(all).filter(([id, p]) =>
        p.guildId === interaction.guild.id && (!targetId || id === targetId)
      );
      if (!panels.length) return interaction.reply({ content: 'no panels. create one first.', ephemeral: true });

      for (const [msgId, panel] of panels) {
        panel.roles[emoji] = role.id;
        rr.setPanel(msgId, panel);
        const ch = interaction.guild.channels.cache.get(panel.channelId);
        if (ch) {
          const msg = await ch.messages.fetch(msgId).catch(() => null);
          if (msg) {
            await msg.react(emoji).catch(() => {});
            await msg.edit({ embeds: [buildEmbed(panel)] }).catch(() => {});
          }
        }
      }

      return interaction.reply({ content: `added ${emoji} → ${role}`, ephemeral: true });
    }

    if (sub === 'remove') {
      const emoji = interaction.options.getString('emoji');
      const targetId = interaction.options.getString('panel');
      let found = false;
      for (const [msgId, panel] of Object.entries(all)) {
        if (panel.guildId !== interaction.guild.id) continue;
        if (targetId && msgId !== targetId) continue;
        if (!panel.roles[emoji]) continue;
        delete panel.roles[emoji];
        rr.setPanel(msgId, panel);
        const ch = interaction.guild.channels.cache.get(panel.channelId);
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
      if (!found) return interaction.reply({ content: 'emoji not found in any panel', ephemeral: true });
      return interaction.reply({ content: `removed ${emoji}`, ephemeral: true });
    }

    if (sub === 'color') {
      const color = interaction.options.getString('hex').replace('#', '');
      if (!/^[0-9A-Fa-f]{6}$/.test(color)) return interaction.reply({ content: 'invalid hex color', ephemeral: true });
      const targetId = interaction.options.getString('panel');
      for (const [msgId, panel] of Object.entries(all)) {
        if (panel.guildId !== interaction.guild.id) continue;
        if (targetId && msgId !== targetId) continue;
        panel.color = color;
        rr.setPanel(msgId, panel);
        const ch = interaction.guild.channels.cache.get(panel.channelId);
        if (ch) {
          const msg = await ch.messages.fetch(msgId).catch(() => null);
          if (msg) msg.edit({ embeds: [buildEmbed(panel)] }).catch(() => {});
        }
      }
      return interaction.reply({ content: `color set to #${color}`, ephemeral: true });
    }

    if (sub === 'desc') {
      const text = interaction.options.getString('text');
      const targetId = interaction.options.getString('panel');
      for (const [msgId, panel] of Object.entries(all)) {
        if (panel.guildId !== interaction.guild.id) continue;
        if (targetId && msgId !== targetId) continue;
        panel.description = text;
        rr.setPanel(msgId, panel);
        const ch = interaction.guild.channels.cache.get(panel.channelId);
        if (ch) {
          const msg = await ch.messages.fetch(msgId).catch(() => null);
          if (msg) msg.edit({ embeds: [buildEmbed(panel)] }).catch(() => {});
        }
      }
      return interaction.reply({ content: 'description updated', ephemeral: true });
    }

    if (sub === 'list') {
      const entries = Object.entries(all).filter(([, p]) => p.guildId === interaction.guild.id);
      if (!entries.length) return interaction.reply({ content: 'no panels', ephemeral: true });
      const lines = entries.map(([id, p]) =>
        `\`${id}\` **${p.title || 'Untitled'}** (${Object.keys(p.roles).length} roles)`
      );
      return interaction.reply({ content: lines.join('\n'), ephemeral: true });
    }
  },

  async executePrefix(message, args) {
    if (!(await isMod(message.member))) return require('../../utils/permissions').noPermPrefix(message);

    const sub = (args[0] || '').toLowerCase();
    const all = rr.getAll();

    if (sub === 'create') {
      const title = args.slice(1).join(' ') || 'Reaction Roles';
      const embed = buildEmbed({ title, roles: {}, color: 'FFCBF6', description: '' });
      const msg = await message.channel.send({ embeds: [embed] });
      rr.setPanel(msg.id, { channelId: msg.channel.id, guildId: message.guild.id, title, roles: {}, color: 'FFCBF6', description: '' });
      await message.delete().catch(() => {});
      const reply = await message.channel.send(`panel created \`${msg.id}\``);
      return setTimeout(() => reply.delete().catch(() => {}), 3000);
    }

    if (sub === 'add') {
      const emoji = args[1];
      const role = message.mentions.roles.first();
      if (!emoji || !role) return message.reply('usage: `!areactionrole add :emoji: @role [panel_id]`');
      const targetId = args[3] || null;

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

    if (sub === 'remove') {
      const emoji = args[1];
      if (!emoji) return message.reply('usage: `!areactionrole remove :emoji: [panel_id]`');
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

    if (sub === 'color') {
      const color = (args[1] || '').replace('#', '');
      if (!/^[0-9A-Fa-f]{6}$/.test(color)) return message.reply('usage: `!areactionrole color FFABCD [panel_id]`');
      const targetId = args[2] || null;
      for (const [msgId, panel] of Object.entries(all)) {
        if (panel.guildId !== message.guild.id) continue;
        if (targetId && msgId !== targetId) continue;
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

    if (sub === 'desc') {
      const desc = args.slice(1).join(' ');
      if (!desc) return message.reply('usage: `!areactionrole desc <text> [panel_id]`');
      const targetId = args[2] || null;
      for (const [msgId, panel] of Object.entries(all)) {
        if (panel.guildId !== message.guild.id) continue;
        if (targetId && msgId !== targetId) continue;
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

    if (sub === 'list') {
      const entries = Object.entries(all).filter(([, p]) => p.guildId === message.guild.id);
      if (!entries.length) return message.reply('no panels');
      const lines = entries.map(([id, p]) =>
        `\`${id}\` **${p.title || 'Untitled'}** (${Object.keys(p.roles).length} roles)`
      );
      return message.channel.send(lines.join('\n'));
    }

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
