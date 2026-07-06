const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const rr = require('../../utils/reactionroles');
const { isMod, noPermSlash, noPermPrefix } = require('../../utils/permissions');

function buildEmbed(panel) {
  const entries = Object.entries(panel.roles || {});
  const lines = entries.map(([e, r]) => `${e}  <@&${r}>`);
  let desc = '❀ ˚ .  𓇢𓆸 ' + (panel.title || 'roles') + ' 𓆸𓇢  . ˚ ❀\n\n';
  if (lines.length) {
    desc += lines.join('\n');
  } else {
    desc += '‧₊ ⊹ _no roles yet_ ⊹ ₊‧';
  }
  const embed = new EmbedBuilder()
    .setColor(parseInt(panel.color || 'FFCBF6', 16))
    .setDescription(desc)
    .setFooter({ text: 'Click to assign' });
  if (panel.image) embed.setImage(panel.image);
  return embed;
}

function buildRows(panel, msgId) {
  const entries = Object.entries(panel.roles || {});
  const rows = [];
  let row = new ActionRowBuilder();
  for (const [emoji, roleId] of entries) {
    const id = `rr_${msgId}_${roleId}`.slice(0, 100);
    const btn = new ButtonBuilder()
      .setCustomId(id)
      .setEmoji(emoji)
      .setStyle(ButtonStyle.Secondary);
    if (row.components.length >= 5) {
      rows.push(row);
      row = new ActionRowBuilder();
    }
    row.addComponents(btn);
  }
  if (row.components.length) rows.push(row);
  return rows;
}

module.exports = {
  name: 'reactionrole',
  data: new SlashCommandBuilder()
    .setName('reactionrole')
    .setDescription('Manage role panels')
    .addSubcommand(s => s.setName('panel').setDescription('Create a role panel').addStringOption(o => o.setName('title').setDescription('Panel title').setRequired(false)).addAttachmentOption(o => o.setName('image').setDescription('Image or gif for the panel').setRequired(false)))
    .addSubcommand(s => s.setName('add').setDescription('Add a role option').addStringOption(o => o.setName('emoji').setDescription('Emoji').setRequired(true)).addRoleOption(o => o.setName('role').setDescription('Role').setRequired(true)).addStringOption(o => o.setName('panel').setDescription('Panel ID').setRequired(false)).addAttachmentOption(o => o.setName('image').setDescription('Image or gif for the panel').setRequired(false)))
    .addSubcommand(s => s.setName('remove').setDescription('Remove a role option').addStringOption(o => o.setName('emoji').setDescription('Emoji').setRequired(true)).addStringOption(o => o.setName('panel').setDescription('Panel ID').setRequired(false)))
    .addSubcommand(s => s.setName('color').setDescription('Set panel color').addStringOption(o => o.setName('hex').setDescription('Hex color').setRequired(true)).addStringOption(o => o.setName('panel').setDescription('Panel ID').setRequired(false)))
    .addSubcommand(s => s.setName('list').setDescription('List all panels'))
    .addSubcommand(s => s.setName('edit').setDescription('Edit panel title or image').addStringOption(o => o.setName('panel').setDescription('Panel ID').setRequired(true)).addStringOption(o => o.setName('title').setDescription('New title').setRequired(false)).addAttachmentOption(o => o.setName('image').setDescription('New image or gif').setRequired(false)).addBooleanOption(o => o.setName('clear_image').setDescription('Remove the image').setRequired(false)))
    .addSubcommand(s => s.setName('delete').setDescription('Delete a role panel').addStringOption(o => o.setName('panel').setDescription('Panel ID').setRequired(true))),

  async execute(interaction) {
    if (!(await isMod(interaction.member))) return noPermSlash(interaction);

    const sub = interaction.options.getSubcommand();
    const all = rr.getAll();

    if (sub === 'panel') {
      const title = interaction.options.getString('title') || 'Roles';
      const imageAttachment = interaction.options.getAttachment('image');
      const data = { title, roles: {}, color: 'FFCBF6', guildId: interaction.guild.id, channelId: interaction.channel.id };
      if (imageAttachment) data.image = imageAttachment.url;
      const embed = buildEmbed(data);
      const rows = buildRows(data, 'temp');
      const msg = await interaction.channel.send({ embeds: [embed], components: rows });
      data.channelId = msg.channel.id;
      rr.setPanel(msg.id, data);
      const realRows = buildRows(data, msg.id);
      await msg.edit({ components: realRows }).catch(() => {});
      return interaction.reply({ content: `panel created`, ephemeral: true });
    }

    if (sub === 'add') {
      const emoji = interaction.options.getString('emoji');
      const role = interaction.options.getRole('role');
      const targetId = interaction.options.getString('panel');
      const imageAttachment = interaction.options.getAttachment('image');

      const panels = Object.entries(all).filter(([id, p]) =>
        p.guildId === interaction.guild.id && (!targetId || id === targetId)
      );
      if (!panels.length) return interaction.reply({ content: 'create a panel first', ephemeral: true });

      for (const [msgId, panel] of panels) {
        panel.roles[emoji] = role.id;
        if (imageAttachment) panel.image = imageAttachment.url;
        rr.setPanel(msgId, panel);
        const ch = interaction.guild.channels.cache.get(panel.channelId);
        if (ch) {
          const msg = await ch.messages.fetch(msgId).catch(() => null);
          if (msg) {
            await msg.edit({ embeds: [buildEmbed(panel)], components: buildRows(panel, msgId) }).catch(() => {});
          }
        }
      }
      return interaction.reply({ content: `added ${emoji} → ${role}`, ephemeral: true });
    }

    if (sub === 'remove') {
      const emoji = interaction.options.getString('emoji');
      const targetId = interaction.options.getString('panel');
      for (const [msgId, panel] of Object.entries(all)) {
        if (panel.guildId !== interaction.guild.id) continue;
        if (targetId && msgId !== targetId) continue;
        if (!panel.roles[emoji]) continue;
        delete panel.roles[emoji];
        rr.setPanel(msgId, panel);
        const ch = interaction.guild.channels.cache.get(panel.channelId);
        if (ch) {
          const msg = await ch.messages.fetch(msgId).catch(() => null);
          if (msg) msg.edit({ embeds: [buildEmbed(panel)], components: buildRows(panel, msgId) }).catch(() => {});
        }
      }
      return interaction.reply({ content: `removed ${emoji}`, ephemeral: true });
    }

    if (sub === 'color') {
      const color = interaction.options.getString('hex').replace('#', '');
      if (!/^[0-9A-Fa-f]{6}$/.test(color)) return interaction.reply({ content: 'invalid hex', ephemeral: true });
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
      return interaction.reply({ content: `color set`, ephemeral: true });
    }

    if (sub === 'list') {
      const entries = Object.entries(all).filter(([, p]) => p.guildId === interaction.guild.id);
      if (!entries.length) return interaction.reply({ content: 'no panels', ephemeral: true });
      return interaction.reply({
        content: entries.map(([id, p]) => `\`${id}\` **${p.title}** (${Object.keys(p.roles).length} roles)`).join('\n'),
        ephemeral: true,
      });
    }

    if (sub === 'edit') {
      const targetId = interaction.options.getString('panel');
      const panel = all[targetId];
      if (!panel || panel.guildId !== interaction.guild.id)
        return interaction.reply({ content: 'panel not found', ephemeral: true });

      const title = interaction.options.getString('title');
      const imageAttachment = interaction.options.getAttachment('image');
      const clearImage = interaction.options.getBoolean('clear_image');

      if (title !== null) panel.title = title;
      if (imageAttachment) panel.image = imageAttachment.url;
      if (clearImage) delete panel.image;

      rr.setPanel(targetId, panel);
      const ch = interaction.guild.channels.cache.get(panel.channelId);
      if (ch) {
        const msg = await ch.messages.fetch(targetId).catch(() => null);
        if (msg) msg.edit({ embeds: [buildEmbed(panel)], components: buildRows(panel, targetId) }).catch(() => {});
      }
      return interaction.reply({ content: 'panel updated', ephemeral: true });
    }

    if (sub === 'delete') {
      const targetId = interaction.options.getString('panel');
      const panel = all[targetId];
      if (!panel || panel.guildId !== interaction.guild.id)
        return interaction.reply({ content: 'panel not found', ephemeral: true });
      const ch = interaction.guild.channels.cache.get(panel.channelId);
      if (ch) {
        const msg = await ch.messages.fetch(targetId).catch(() => null);
        if (msg) await msg.delete().catch(() => {});
      }
      rr.deletePanel(targetId);
      return interaction.reply({ content: 'panel deleted', ephemeral: true });
    }

  },

  async executePrefix(message, args) {
    if (!(await isMod(message.member))) return noPermPrefix(message);

    const sub = (args[0] || '').toLowerCase();
    const all = rr.getAll();

    if (sub === 'panel' || sub === 'create') {
      const title = args.slice(1).join(' ') || 'Roles';
      const data = { title, roles: {}, color: 'FFCBF6', guildId: message.guild.id, channelId: message.channel.id };
      const attach = message.attachments.first();
      if (attach) data.image = attach.url;
      const embed = buildEmbed(data);
      const rows = buildRows(data, 'temp');
      const msg = await message.channel.send({ embeds: [embed], components: rows });
      data.channelId = msg.channel.id;
      rr.setPanel(msg.id, data);
      const realRows = buildRows(data, msg.id);
      await msg.edit({ components: realRows }).catch(() => {});
      await message.delete().catch(() => {});
      return message.channel.send(`panel created`).then(m => setTimeout(() => m.delete().catch(() => {}), 3000));
    }

    if (sub === 'add') {
      const tokens = args.slice(1);
      const pairs = [];
      let targetId = null;

      for (let i = 0; i < tokens.length; i++) {
        if (tokens[i].startsWith('<@&')) {
          if (i === 0) return message.reply('usage: `!areactionrole add :emoji: @role :emoji2: @role2 ... [panel_id]`');
          pairs.push({ emoji: tokens[i - 1], roleId: tokens[i].slice(3, -1) });
        }
      }

      const remaining = tokens.length - pairs.length * 2;
      if (remaining === 1) targetId = tokens[tokens.length - 1];

      if (!pairs.length) return message.reply('usage: `!areactionrole add :emoji: @role :emoji2: @role2 ... [panel_id]`');

      const panels = Object.entries(all).filter(([id, p]) =>
        p.guildId === message.guild.id && (!targetId || id === targetId)
      );
      if (!panels.length) return message.reply('no panels');

      for (const [msgId, panel] of panels) {
        for (const { emoji, roleId } of pairs) {
          panel.roles[emoji] = roleId;
        }
        const attach = message.attachments.first();
        if (attach) panel.image = attach.url;
        rr.setPanel(msgId, panel);
        const ch = message.guild.channels.cache.get(panel.channelId);
        if (ch) {
          const msg = await ch.messages.fetch(msgId).catch(() => null);
          if (msg) msg.edit({ embeds: [buildEmbed(panel)], components: buildRows(panel, msgId) }).catch(() => {});
        }
      }
      await message.delete().catch(() => {});
      const added = pairs.map(p => `${p.emoji} → <@&${p.roleId}>`).join(', ');
      return message.channel.send(`added ${added}`).then(m => setTimeout(() => m.delete().catch(() => {}), 3000));
    }

    if (sub === 'remove') {
      const emoji = args[1];
      if (!emoji) return message.reply('usage: `!areactionrole remove :emoji: [panel_id]`');
      const targetId = args[2] || null;
      for (const [msgId, panel] of Object.entries(all)) {
        if (panel.guildId !== message.guild.id) continue;
        if (targetId && msgId !== targetId) continue;
        if (!panel.roles[emoji]) continue;
        delete panel.roles[emoji];
        rr.setPanel(msgId, panel);
        const ch = message.guild.channels.cache.get(panel.channelId);
        if (ch) {
          const msg = await ch.messages.fetch(msgId).catch(() => null);
          if (msg) msg.edit({ embeds: [buildEmbed(panel)], components: buildRows(panel, msgId) }).catch(() => {});
        }
      }
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
      return message.reply(`color set`);
    }

    if (sub === 'list') {
      const entries = Object.entries(all).filter(([, p]) => p.guildId === message.guild.id);
      if (!entries.length) return message.reply('no panels');
      return message.channel.send(entries.map(([id, p]) => `\`${id}\` **${p.title}** (${Object.keys(p.roles).length} roles)`).join('\n'));
    }

    if (sub === 'edit') {
      const targetId = args[1];
      if (!targetId) return message.reply('usage: `!areactionrole edit <panel_id> [new_title]`');
      const panel = all[targetId];
      if (!panel || panel.guildId !== message.guild.id) return message.reply('panel not found');

      const newTitle = args.slice(2).join(' ');
      if (newTitle) panel.title = newTitle;
      const attach = message.attachments.first();
      if (attach) panel.image = attach.url;
      if (args.includes('--remove-image')) delete panel.image;

      rr.setPanel(targetId, panel);
      const ch = message.guild.channels.cache.get(panel.channelId);
      if (ch) {
        const msg = await ch.messages.fetch(targetId).catch(() => null);
        if (msg) msg.edit({ embeds: [buildEmbed(panel)], components: buildRows(panel, targetId) }).catch(() => {});
      }
      return message.reply('panel updated');
    }

    if (sub === 'delete') {
      const targetId = args[1];
      if (!targetId) return message.reply('usage: `!areactionrole delete <panel_id>`');
      const panel = all[targetId];
      if (!panel || panel.guildId !== message.guild.id) return message.reply('panel not found');
      const ch = message.guild.channels.cache.get(panel.channelId);
      if (ch) {
        const msg = await ch.messages.fetch(targetId).catch(() => null);
        if (msg) await msg.delete().catch(() => {});
      }
      rr.deletePanel(targetId);
      return message.reply('panel deleted');
    }

    message.reply(
      '`!areactionrole panel <title>` — create button panel (attach image for panel image)\n' +
      '`!areactionrole add :emoji: @role ... [panel_id]` — add role(s) (attach image for panel image)\n' +
      '`!areactionrole edit <panel_id> [new_title]` — edit title/image (attach image, --remove-image)\n' +
      '`!areactionrole remove :emoji: [panel_id]` — remove role\n' +
      '`!areactionrole color <hex> [panel_id]` — set color\n' +
      '`!areactionrole delete <panel_id>` — delete panel\n' +
      '`!areactionrole list` — list panels'
    );
  },
};
