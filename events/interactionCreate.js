const { handleTicketButton } = require('../commands/moderation/ticket');
const verify = require('../commands/moderation/verify');
const rr = require('../utils/reactionroles');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      try {
        await command.execute(interaction);
      } catch (err) {
        console.error(`Error in /${interaction.commandName}:`, err);
        const reply = { content: '❌ Something went wrong.', ephemeral: true };
        if (interaction.replied || interaction.deferred) await interaction.followUp(reply);
        else await interaction.reply(reply);
      }
      return;
    }

    if (interaction.isButton()) {
      // role panel buttons: rr_<msgId>_<roleId>
      if (interaction.customId.startsWith('rr_')) {
        const parts = interaction.customId.split('_');
        const msgId = parts[1];
        const roleId = parts.slice(2).join('_');
        const panel = await rr.getPanel(msgId);
        if (!panel) return interaction.reply({ content: 'panel not found', ephemeral: true });

        const member = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);
        if (!member) return interaction.reply({ content: 'could not find you', ephemeral: true });

        if (member.roles.cache.has(roleId)) {
          await member.roles.remove(roleId).catch(() => {});
          await interaction.reply({ content: 'role removed :)', ephemeral: true });
        } else {
          await member.roles.add(roleId).catch(() => {});
          await interaction.reply({ content: 'role given :)', ephemeral: true });
        }
        return;
      }

      if (interaction.customId === 'verify_button') {
        return await verify.handleVerifyButton(interaction, client);
      }
      return await handleTicketButton(interaction, client);
    }
  },
};
