const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { roles } = require('../../config');
const { isMod, noPermPrefix } = require('../../utils/permissions');

module.exports = {
  name: 'verifypanel',
  async executePrefix(message, args) {
    if (!(await isMod(message.member))) return noPermPrefix(message);

    const embed = new EmbedBuilder()
      .setColor(0xFFCBF6)
      .setTitle('Verification')
      .setDescription(
        'Click the button below to verify and access all channels.'
      )
      .setFooter({ text: message.guild.name })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('verify_button')
        .setLabel('Verify')
        .setStyle(ButtonStyle.Success),
    );

    await message.delete().catch(() => {});
    await message.channel.send({ embeds: [embed], components: [row] });
  },

  async handleVerifyButton(interaction, client) {
    if (!interaction.member) {
      return interaction.reply({ content: 'This can only be used in a server.', ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });

    const memberRole = interaction.guild.roles.cache.get(roles.member);
    const unverifiedRole = interaction.guild.roles.cache.get(roles.unverified);

    if (!memberRole) {
      return interaction.editReply({ content: "Can't find the member role — tell an admin." });
    }

    if (interaction.member.roles.cache.has(roles.member)) {
      return interaction.editReply({ content: "You're already verified." });
    }

    if (unverifiedRole && interaction.member.roles.cache.has(roles.unverified)) {
      await interaction.member.roles.remove(unverifiedRole).catch(() => {});
    }
    await interaction.member.roles.add(memberRole).catch(() => {});

    await interaction.editReply({ content: "You're verified. Welcome!" });
  },
};
