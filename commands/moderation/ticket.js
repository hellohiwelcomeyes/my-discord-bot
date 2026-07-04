const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const { categories, modRoleIds, ownerRoles } = require('../../config');
const { isMod } = require('../../utils/permissions');

const activeTickets = new Map();

function sanitizeName(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 30) || 'ticket';
}

async function createTicketChannel(guild, user, client) {
  const categoryId = categories.tickets;
  if (!categoryId) return { error: "Tickets aren't set up yet." };

  const existing = guild.channels.cache.find(c =>
    c.parentId === categoryId && c.topic?.includes(user.id)
  );
  if (existing) return { error: `You already have a ticket open: ${existing}` };

  const name = `ticket-${sanitizeName(user.displayName)}`;
  const everyoneRole = guild.roles.everyone;
  const modPerms = [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory];
  const permissionOverwrites = [
    { id: everyoneRole.id, deny: [PermissionFlagsBits.ViewChannel] },
    { id: client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ManageChannels] },
    { id: user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
  ];

  const allModRoleIds = [...new Set([...ownerRoles, ...modRoleIds])];
  for (const roleId of allModRoleIds) {
    permissionOverwrites.push({ id: roleId, allow: modPerms });
  }

  const channel = await guild.channels.create({
    name,
    type: 0,
    parent: categoryId,
    topic: `ticket-${user.id}`,
    permissionOverwrites,
  });

  activeTickets.set(channel.id, { userId: user.id, createdAt: Date.now() });
  return { channel };
}

function getTicketEmbed(user) {
  return new EmbedBuilder()
    .setColor(0xFFCBF6)
    .setTitle('🎫 Ticket Created')
    .setDescription(`Hey ${user}, someone will be with you soon.`)
    .addFields({ name: 'Info', value: 'Use the buttons below to manage this ticket.' })
    .setFooter({ text: user.id })
    .setTimestamp();
}

function getCloseButtons(isStaff) {
  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('ticket_close')
      .setLabel('🔒 Close Ticket')
      .setStyle(ButtonStyle.Secondary),
  );
  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('ticket_delete')
      .setLabel('🗑️ Delete Ticket')
      .setStyle(ButtonStyle.Danger),
  );
  return isStaff ? [row1, row2] : [row1];
}

module.exports = {
  name: 'ticket',
  async executePrefix(message, args) {
    const result = await createTicketChannel(message.guild, message.author, message.client);
    await message.delete().catch(() => {});

    if (result.error) {
      return message.author.send(result.error).catch(() => {});
    }

    const { channel } = result;
    const staff = await isMod(message.member);
    await channel.send({
      content: `${message.author}`,
      embeds: [getTicketEmbed(message.author)],
      components: getCloseButtons(staff),
    });
  },

  async handleTicketButton(interaction, client) {
    const { customId, channel, member } = interaction;
    const topicUserId = channel.topic?.replace(/^ticket-(\d+).*$/, '$1') || '';

    if (customId === 'ticket_close') {
      const isTicketCreator = member.id === topicUserId;
      const staff = await isMod(member);
      if (!isTicketCreator && !staff) {
        return interaction.reply({ content: "This isn't your ticket.", ephemeral: true });
      }
      await interaction.deferReply();
      await channel.permissionOverwrites.edit(topicUserId, { SendMessages: false });
      await channel.setTopic(`ticket-${topicUserId} | CLOSED`);
      const embed = EmbedBuilder.from(interaction.message.embeds[0])
        .setColor(0xFFCBF6)
        .setDescription('This ticket is closed.');
      const disabledRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('ticket_closed')
          .setLabel('🔒 Closed')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true),
      );
      const rows = [disabledRow];
      if (staff) {
        rows.push(new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('ticket_delete')
            .setLabel('🗑️ Delete Ticket')
            .setStyle(ButtonStyle.Danger),
        ));
      }
      await interaction.message.edit({ embeds: [embed], components: rows });
      return interaction.editReply({ content: 'Ticket closed.', ephemeral: true });
    }

    if (customId === 'ticket_delete') {
      if (!await isMod(member)) {
        return interaction.reply({ content: 'Only staff can delete tickets.', ephemeral: true });
      }
      await interaction.reply({ content: 'Deleting ticket channel...', ephemeral: true });
      activeTickets.delete(channel.id);
      await channel.delete().catch(() => {});
    }
  },
};
