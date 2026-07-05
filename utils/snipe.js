const cache = new Map();

function set(message) {
  if (!message.content && !message.attachments?.size) return;
  cache.set(message.channel.id, {
    author: message.author?.tag || 'Unknown',
    content: message.content || '*attachment*',
    image: message.attachments?.first()?.url || null,
    timestamp: Date.now(),
  });
}

function get(channelId) {
  return cache.get(channelId) || null;
}

module.exports = { set, get };