const { handleTicketButton } = require('../commands/moderation/ticket');
const verify = require('../commands/moderation/verify');

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
      if (interaction.customId === 'verify_button') {
        return await verify.handleVerifyButton(interaction, client);
      }
      return await handleTicketButton(interaction, client);
    }
  },
};
