const { channels, prefix } = require('../config');
const logger = require('../utils/logger');

const greetings = ['hello', 'hi', 'hey', 'sup', 'yo', 'wassup', 'whats up', 'howdy', 'hii', 'heyy'];

const insults = [
  'fuck you', 'suck', 'dumb', 'stupid', 'trash', 'bad bot', 'ugly',
  'die', 'kill yourself', 'cringe', 'shit bot', 'useless', 'stfu',
  'shut up', 'nobody asked', 'worst bot',
];

const replies = [
  'what', 'yo', 'sup', 'hey', '...', 'busy', 'not now :)',
  'hm?', 'yo whats up', 'sup gang',
];

const comebacks = [
  'u first :)', 'cry more', 'ok buddy :skull:', 'l + ratio',
  'says you', 'touch grass', 'who asked', 'didnt ask',
  'imagine being this pressed', 'your opinion has been noted and discarded :pray:',
  'mad bc bad', 'stay mad', "you're literally typing to a bot :skull:",
];

module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if (message.author.bot) return;
    if (message.channel.id === channels.logs) return;
    if (message.channel.id === channels.welcome) return;

    const content = message.content.toLowerCase().trim();

    if (message.mentions.has(client.user) && !content.startsWith(prefix)) {
      const isInsult = insults.some(i => content.includes(i));
      if (isInsult) {
        return message.reply(comebacks[Math.floor(Math.random() * comebacks.length)]);
      }
      const isGreeting = greetings.some(g => content.includes(g));
      if (isGreeting) {
        return message.reply(replies[Math.floor(Math.random() * replies.length)]);
      }
      return message.reply('?');
    }

    logger.addLog('messages', {
      channelId: message.channel.id,
      channelName: message.channel.name,
      author: message.author.tag,
      content: message.content,
      timestamp: Date.now(),
    });
  },
};
