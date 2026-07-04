const { channels, prefix } = require('../config');
const logger = require('../utils/logger');

const greetings = ['hello', 'hi', 'hey', 'sup', 'yo', 'wassup', 'whats up', 'howdy', 'hii', 'heyy'];

const insults = [
  'fuck you', 'suck', 'dumb', 'stupid', 'trash', 'bad bot', 'ugly',
  'die', 'kill yourself', 'cringe', 'shit bot', 'useless', 'stfu',
  'shut up', 'nobody asked', 'worst bot',
];

const replies = [
  'what', 'yo', 'sup', 'hey', '...', 'busy', 'not now',
  'hm?', 'yo whats up', 'sup gang', 'what it do', 'ion know',
];

const comebacks = [
  'u first :smirk:', 'cry more', 'ok buddy :skull:', 'l + ratio',
  'says you', 'shut up', 'who asked', 'didnt ask',
  'npc behavior', 'ions', 'bro your input is not needed :pray:',
  "mate shut the fuck up", 'stay mad', "big talk for someone typing at a bot",
  'this is not the comeback you think it is', 'side character dialogue',
  'dawg who asked', 'cap', 'fr? no one cares',
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
