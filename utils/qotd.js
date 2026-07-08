const { EmbedBuilder } = require('discord.js');
const { channels } = require('../config');

const questions = [
  'if you could instantly delete one smell from existence, what would it be',
  'what is a hill you would actually die on, not just a reddit take',
  'what is something you did as a kid that you thought was sneaky but definitely was not',
  'if you had to change your name to a vegetable, which one fits you',
  'what is the worst texture known to mankind',
  'if your life had a smell, what would it smell like right now',
  'what is the most specific thing that makes you irrationally angry',
  'if you could only wear one colour for the rest of your life, what are you picking',
  'what is the weirdest hill you have seen someone die on online',
  'if you could steal one fictional character\'s wardrobe, who',
  'what is a memory that makes you cringe so hard you physically react',
  'if you had to eat one meal for the rest of your life that is not your favourite, what',
  'what is something people flex that is actually not impressive',
  'if your pet could talk for one day, what is the first thing they would roast you for',
  'what is the most overhyped thing in existence right now',
  'if you could merge two animals into one, what would you make',
  'what is the most backhanded compliment you have ever received',
  'if you had a theme song that played every time you entered a room, what would it be',
  'what is a skill you have that is completely useless but you are weirdly proud of',
  'if you could erase one trend from history, what',
  'what is the most chaotic thing you have witnessed in a discord server',
  'if you had to describe your vibe using only weather, what weather',
  'what is the worst take you have ever had that you look back on and cringe',
  'if you could swap lives with an animal for a day, which animal',
  'what is something that was cool when you were younger but is embarrassing now',
  'if you could add any feature to the human body, what would it be',
  'what is the most irrational fear you have that you know is dumb',
  'if you had a warning label, what would it actually say',
  'what is a small thing that ruins your entire mood instantly',
  'if you could instantly master a language you do not speak, which one',
  'what is the most controversial food opinion you have',
  'if you could only listen to one genre of music for the rest of your life, what',
  'what is something you believed for way too long as a kid',
  'if you had to be haunted by one ghost for the rest of your life, who would you pick',
  'what is the most underrated sound',
  'if you could relive one day of your life with no changes, only to experience it again, what day',
  'what is a word you just think sounds nice',
  'if your personality was a font, what font would it be',
  'what is something you do not understand the appeal of',
  'if you could press a button and instantly be a master at one hobby, what',
  'what is the most specific niche subculture you have ever encountered',
  'if you could have dinner with any fictional character, who',
  'what is something that was hugely popular but you never got into',
  'if you could teleport but only to places you have already been, where would you go right now',
  'what is the worst gift you have ever received',
  'if you could ask a fish one question and it would answer honestly, what',
  'what is the most embarrassing phase you went through',
  'if your brain was a room, what would it look like right now',
  'what is a song that makes you feel things no matter how many times you hear it',
  'if you could be invisible for a day but you could not touch anything, what would you do',
  'what is the most useless fact you know off the top of your head',
  'if you had to describe your life as a genre of music, what',
  'what is the best dream you have ever had',
  'if you could see one statistic about your life, what would you want to know',
  'what is a smell that takes you back to a specific moment instantly',
  'if you could design a holiday, what would it be called and what would people do',
  'what is the most niche talent you have',
  'if you could be a professional in any field overnight, what field',
  'what is the best piece of advice you have ever ignored',
  'if you could ask your future self one thing, what',
  'what is the worst pain you have ever felt',
  'if you could rename yourself to any word in the dictionary, what',
  'what is a hill you thought you would die on but changed your mind about',
  'if you could live in any decade for a week, which',
  'what is something you secretly judge people for',
  'if your life was a tv show, what would the title sequence look like',
  'what is the most peaceful moment you have ever experienced',
  'if you could have a conversation with any inanimate object in your room, which',
  'what is the weirdest thing you have ever found',
  'if you could instantly cure one phobia you have, which',
  'what is the most random thing that makes you emotional',
  'if you could have unlimited supplies of one mundane thing, what',
  'what is something you think is beautiful that most people think is ugly',
  'if you could watch one movie again for the first time, what',
  'what is a tradition you actually love',
  'if you could be any mythical creature, what and why',
  'what is the most specific thing that gives you nostalgia',
  'if you could pause time for everyone except yourself, what would you do',
  'what is something you are tired of pretending to care about',
  'if you could swap brains with someone for a day to see how they think, who',
  'what is the most interesting dream you have ever had',
  'if you could make one rule that everyone on earth had to follow, what',
  'what is a sound that instantly relaxes you',
  'if you could have one superpower that is considered useless, what would you pick',
  'what is the best conversation you have ever overheard',
  'if you could be any size for a day, what size',
  'what is something you find fascinating that bores everyone else',
  'if you could know the answer to one mystery, what',
  'what is your most controversial take on a popular thing',
  'if you could change one thing about the way you were raised, what',
  'what is the most beautiful word you know and why',
  'if you could spend a day in someone else\'s body, who would you pick',
  'what is the most memorable compliment you have ever received',
  'if you could be remembered for one sentence, what would it say',
  'what is the worst thing to say at a funeral',
  'if you had to describe yourself using only three nouns, what',
  'what is the most specific thing you collect or hoard',
  'if you could add one extra hour to the day, when would you put it',
  'what is the weirdest thing you have ever googled',
  'if you could instantly know what any animal is thinking, which animal',
  'what is a problem you wish more people cared about',
  'if you could live in the universe of any game, which',
  'what is the most interesting fact you have learned this year',
  'if you could have a second chance at one conversation, what would you say differently',
  'what is the best thing that happened to you this week',
  'if you could make your brain shut up for five minutes, what method works best',
];

let asked = new Set();
let lastDate = null;

function pickQuestion() {
  const remaining = questions.filter(q => !asked.has(q));
  if (remaining.length === 0) {
    asked.clear();
    return questions[Math.floor(Math.random() * questions.length)];
  }
  const chosen = remaining[Math.floor(Math.random() * remaining.length)];
  asked.add(chosen);
  return chosen;
}

function getTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

async function postQOTD(client) {
  const channel = client.channels.cache.get(channels.qotd);
  if (!channel) return;

  const question = pickQuestion();

  const embed = new EmbedBuilder()
    .setColor(0xFFCBF6)
    .setDescription(
      '❀ ˚ .  𓇢𓆸 ϙᴏᴛᴅ 𓆸𓇢  . ˚ ❀\n\n' +
      question +
      '\n\n‧₊ ⊹ ༺ answer away ༻ ⊹ ₊‧'
    )
    .setImage('https://media.discordapp.net/attachments/1515420062461329420/1524497582666027028/C8CAD1F0-E767-4AE0-89E6-6B067D7EB0D0.gif')
    .setFooter({ text: '𓇢𓆸 daily 𓆸𓇢' })
    .setTimestamp();

  await channel.send({ embeds: [embed] }).catch(() => {});
}

function getMinutesUntil(hours, minutes) {
  const now = new Date();
  const target = new Date(now);
  target.setUTCHours(hours, minutes, 0, 0);
  if (target <= now) target.setUTCDate(target.getUTCDate() + 1);
  return target - now;
}

function init(client) {
  const postAt = () => {
    postQOTD(client);
  };

  const ms = getMinutesUntil(8, 0); // 8 AM UTC = 10 AM CEST
  setTimeout(() => {
    postAt();
    setInterval(postAt, 24 * 60 * 60 * 1000);
  }, ms);

  const firstPostTime = new Date(Date.now() + ms);
  console.log(`QOTD scheduled daily at 10 AM Europe (posted at 8 AM UTC) — first post ${firstPostTime.toLocaleString('en-GB', { timeZone: 'Europe/Berlin' })} (${Math.round(ms / 60000)} min from now)`);
}

module.exports = { init };
