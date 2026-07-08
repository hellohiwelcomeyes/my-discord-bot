const { channels, prefix } = require('../config');
const logger = require('../utils/logger');

const greetings = ['hello', 'hi', 'hey', 'sup', 'yo', 'wassup', 'whats up', 'howdy', 'hii', 'heyy', 'good morning', 'good evening', 'morning'];

const insults = [
  'fuck', 'suck', 'dumb', 'stupid', 'trash', 'ugly', 'die', 'cringe',
  'useless', 'stfu', 'shut up', 'hate', 'worst', 'kill yourself',
  'nobody asked', 'bad bot', 'shitbot', 'shit bot', 'annoying',
  'dislike', 'terrible', 'awful', 'horrible', 'pathetic', 'lame',
  'garbage', 'wack', 'kys', 'stink',
];

const greetReplies = [
  'hey !! what do you need? (..◜ᴗ◝..)',
  'heyy what\'s up (´｡• ᵕ •｡`)',
  'hi !! (,,>ヮ<,,)',
  'yo !! how can i help you? („• ֊ •„)',
  'sup gang ( ˶°ㅁ°) !!',
  'hello !! o(≧▽≦)o',
  'hey hey (｡•̀ᴗ-)✧',
  'heyo !! (ﾉ◕ヮ◕)ﾉ*:･ﾟ✧',
];

const insultReplies = [
  'aw did i hurt your feelings? (￣ω￣;)',
  'ok buddy whatever you say (￣▽￣)ゞ',
  'says you lmao (￢_￢;)',
  'the audacity .. (￢_￢)',
  'mate i literally do not care (´-ω-`)',
  'your input has been noted and discarded (￣ー￣)',
  'all that talk and for what (´-﹏-`；)',
  'who asked fr (；´Д`A',
  'npc behavior detected (￣ω￣;)',
  'u good? like genuinely (；・∀・)',
  'side character dialogue (￣ε￣)',
  'this is not the roast u think it is σ(￣∇￣;)',
  'the audacity is insane (〃￣ω￣〃)ゞ',
  'ok !! (￣▽￣)ノ',
  'tell me how u really feel (｀▽´)',
];

const emojiReplies = [
  '(..◜ᴗ◝..)',
  '(´｡• ᵕ •｡`)',
  '(,,>ヮ<,,)',
  '(„• ֊ •„)',
  '( ˶°ㅁ°) !!',
  'o(≧▽≦)o',
  '(｡•̀ᴗ-)✧',
  '(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧',
  '(￣ω￣;)',
  '(￢_￢;)',
  '(´-ω-`)',
  '(；´Д`A',
  '(；・∀・)',
  'σ(￣∇￣;)',
  '(｀▽´)',
  '(⌒‿⌒)',
  '☆〜（ゝ。∂）',
  'ヽ(●´∀`●)ﾉ',
  '(´▽`ʃ♡ƪ)',
  'ᕦ(ò_óˇ)ᕤ',
  '(￣▽￣)ノ',
  '＼(^o^)／',
  '(T_T)',
  '(╥﹏╥)',
  '(≧∇≦)/',
  '(◕‿◕)♡',
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
        return message.reply(insultReplies[Math.floor(Math.random() * insultReplies.length)]);
      }
      const isGreeting = greetings.some(g => content.includes(g));
      if (isGreeting) {
        return message.reply(greetReplies[Math.floor(Math.random() * greetReplies.length)]);
      }
      if (content.includes('love') || content.includes('ily') || content.includes('<3') || content.includes('♥')) {
        return message.reply('aww ilyt !! (´▽`ʃ♡ƪ)');
      }
      if (content.includes('bye') || content.includes('gtg') || content.includes('goodnight') || content.includes('gn')) {
        return message.reply('bye bye !! (´｡• ᵕ •｡`)');
      }
      if (content.includes('thank') || content.includes('ty') || content.includes('tysm')) {
        return message.reply('np !! („• ֊ •„)');
      }
      if (content.includes('help') || content.includes('commands') || content.includes('cmd')) {
        return message.reply('try `!ahelp` or `/help` !! (..◜ᴗ◝..)');
      }
      if (content.includes('bad') || content.includes('sucks') || content.includes('worst')) {
        return message.reply('ouch okay .. (´-ω-`)');
      }
      if (content.includes('good') || content.includes('best') || content.includes('amazing') || content.includes('great')) {
        return message.reply('ty !! :D (｡•̀ᴗ-)✧');
      }
      return message.reply(emojiReplies[Math.floor(Math.random() * emojiReplies.length)]);
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
