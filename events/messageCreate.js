const { channels } = require('../config');
const logger = require('../utils/logger');

module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if (message.author.bot) return;
    if (message.channel.id === channels.logs) return;
    if (message.channel.id === channels.welcome) return;

    logger.addLog('messages', {
      channelId: message.channel.id,
      channelName: message.channel.name,
      author: message.author.tag,
      content: message.content,
      timestamp: Date.now(),
    });
  },
};
