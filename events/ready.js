const { REST, Routes, ActivityType } = require('discord.js');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(`✅ Logged in as ${client.user.tag}`);
    client.user.setActivity('Stalking /blsm', { type: ActivityType.Watching });
    try {
      const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
      const { guildId } = require('../config');
      await rest.put(Routes.applicationGuildCommands(client.user.id, guildId), { body: client.allCommands });
      console.log(`✅ Registered ${client.allCommands.length} slash commands`);
    } catch (err) {
      console.error('Failed to register commands:', err);
    }
  },
};
