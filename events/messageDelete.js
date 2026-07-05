const { channels } = require('../config');
const logger = require('../utils/logger');
const snipe = require('../utils/snipe');

module.exports = {
  name: 'messageDelete',
  async execute(message, client) {
    if (message.author?.bot) return;
    if (message.channel.id === channels.logs) return;
    if (message.channel.id === channels.welcome) return;

    snipe.set(message);

    logger.addLog('deletes', {
      channelId: message.channel.id,
      channelName: message.channel?.name,
      author: message.author?.tag || 'Unknown',
      content: message.content,
      timestamp: Date.now(),
    });
  },
};
