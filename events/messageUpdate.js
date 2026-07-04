const { channels } = require('../config');
const logger = require('../utils/logger');

module.exports = {
  name: 'messageUpdate',
  async execute(oldMessage, newMessage, client) {
    if (newMessage.author?.bot) return;
    if (newMessage.channel.id === channels.logs) return;
    if (newMessage.channel.id === channels.welcome) return;
    if (oldMessage.content === newMessage.content) return;

    logger.addLog('edits', {
      channelId: newMessage.channel.id,
      channelName: newMessage.channel?.name,
      author: newMessage.author?.tag || 'Unknown',
      before: oldMessage.content,
      after: newMessage.content,
      timestamp: Date.now(),
    });
  },
};
