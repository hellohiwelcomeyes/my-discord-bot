const { EmbedBuilder } = require('discord.js');
const { channels } = require('../config');

const questions = [
  "What is the most underrated movie you've ever seen?",
  "If you could instantly master any skill, what would it be?",
  "What is a small thing that made you happy recently?",
  "If you could time travel but only once, where would you go?",
  'What is the weirdest food combination you secretly enjoy?',
  "If your life had a soundtrack, what song would be playing right now?",
  "What is a hill you're willing to die on?",
  "If animals could talk, which one do you think would be the rudest?",
  'What fictional place would you most want to visit?',
  "If you could swap lives with someone for a day, who would it be?",
  'What is something you thought was cool as a kid but is actually cringe now?',
  "What's the best piece of advice you've ever received?",
  'If you had to describe your personality using only emojis, what would you use?',
  "What's a hobby you've always wanted to pick up?",
  "If you could instantly learn any language, which one?",
  "What is the most useless talent you have?",
  'What would you do if you won the lottery tomorrow?',
  "If you could be any fictional character for a week, who?",
  "What's the most spontaneous thing you've ever done?",
  "If you had to eat one food for the rest of your life, what would it be?",
  'What is something you wish more people understood about you?',
  "If you could erase one memory to experience it again for the first time, which?",
  "What is your go-to comfort show or movie?",
  "If you could change one thing about the world, what would it be?",
  "What's the best dream you've ever had?",
  'If mirrors could talk, what would they say about you?',
  "What is your most irrational fear?",
  "If you could teleport anywhere right now, where?",
  "What's a book that changed your perspective on something?",
  'What is the most interesting conversation you\'ve overheard?',
  "If you were a ghost, where would you haunt?",
  "What's something you do that you know is bad for you but do anyway?",
  "If your pet could talk, what would they say about you?",
  "What is a skill everyone should learn?",
  "If you could be famous for something, what would it be?",
  "What's the most beautiful place you've ever seen?",
  'What does your perfect day look like?',
  "If you had a personal motto, what would it be?",
  "What is the most nostalgic smell to you?",
  "If you could have any superpower, what would it be?",
  "What's a movie that made you cry?",
  "If you could redecorate your room for free, what would you change?",
  "What is something you're currently stressed about?",
  'If you could have dinner with any historical figure, who?',
  "What is your favorite way to relax after a long day?",
  "If you could go back 5 years and tell yourself one thing, what?",
  "What's something you find overrated?",
  "If you had to live in a different decade, which one?",
  "What is your most used emoji and why?",
  "If you could be an expert in any field instantly, which field?",
  "What's the worst fashion trend you've participated in?",
  "If you could only listen to one album forever, which one?",
  "What is a simple pleasure you never get tired of?",
  "If you could ask your future self one question, what?",
  "What is the most courageous thing you've ever done?",
  "If you could design a holiday, what would it celebrate?",
  "What's something that always makes you laugh?",
  'If you could rename yourself, what would you choose?',
  "What is your earliest childhood memory?",
  "If you had to describe your life as a genre, what would it be?",
  "What's a piece of technology you wish existed?",
  "If you could be any animal for a day, what would you be?",
  "What is the most memorable compliment you've received?",
  "If you could master any instrument, which one?",
  "What's the best decision you've ever made?",
  "If you could visit any planet, which one?",
  "What is something you wish you had learned earlier?",
  "If your life was a TV show, what would the title be?",
  "What is your favorite season and why?",
  "If you could have unlimited supplies of one thing, what?",
  "What's a quote that you live by?",
  "If you could be any age forever, what age?",
  "What is the most adventurous food you've tried?",
  "If you could be invisible for a day, what would you do?",
  "What is something that instantly improves your mood?",
  "If you had to write a book, what would it be about?",
  "What's the most interesting documentary you've watched?",
  "If you could communicate with one type of animal, which?",
  "What is your favorite thing about the current season?",
  "If you could add one feature to the human body, what?",
  "What is something you believed for too long as a kid?",
  "If you could instantly teleport to any memory, where?",
  "What's the most peaceful sound to you?",
  "If you had a warning label, what would it say?",
  "What is a tradition you love?",
  "If you could have any view from your window, what?",
  "What is something that surprises people about you?",
  "If you could switch brains with someone for a day, who?",
  "What is the kindest thing someone has done for you?",
  "If you could ask an AI anything, what would you ask?",
  "What's a small goal you want to achieve this week?",
  "If you could experience a different culture, which one?",
  "What is the most beautiful word you know?",
  "If you could be any element (earth, water, fire, air), which?",
  "What is something you would tell your younger self?",
  "If you could relive any day, which one?",
  "What's the best thing that happened to you this month?",
  "If you could have any job in the world, what?",
  "What is a memory you want to forget?",
  "If you could pause time, what would you do?",
  "What's something you're looking forward to?",
  "If you could cure one disease, which one?",
  "What is your biggest pet peeve?",
  "If you could be any color, what color would you be and why?",
  "What is something you wish more people talked about?",
  "If you could visit any fictional universe, which one?",
  "What is the most interesting fact you know?",
  "If you could have a second chance at one thing, what?",
  "What is your favorite way to be creative?",
  "If you could live anywhere in the world, where?",
  "What is the most thoughtful gift you've given or received?",
  "If you could swap places with a celebrity for a day, who?",
  "What do you think happens after we die?",
  "If you could hear anyone's thoughts, who would you listen to?",
  "What is a problem you wish you could solve?",
  "If you could be remembered for one thing, what?",
  "What is the most beautiful thing you've ever seen in nature?",
  "If you could add one holiday to the calendar, what?",
  "What is something you've never told anyone?",
  "If you could make one rule everyone had to follow, what?",
  "What song describes your current mood?",
  "If you could have a conversation with your pet, what would you ask?",
  "What is a secret talent you have?",
  "If you could witness any historical event, which?",
  "What is something that always makes you feel nostalgic?",
  "If you could be any mythical creature, which one?",
  "What is your favorite form of art?",
  "If you could meet any fictional character, who?",
  "What is the worst pain you've ever felt?",
  "If you could live in any fictional house, which one?",
  "What is something you find beautiful that others might not?",
  "If you could instantly know the answer to one mystery, which?",
  "What is the most important lesson life has taught you?",
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
  return new Date().toISOString().split('T')[0];
}

async function postQOTD(client) {
  const channel = client.channels.cache.get(channels.qotd);
  if (!channel) return;

  const question = pickQuestion();

  const embed = new EmbedBuilder()
    .setColor(0xFFCBF6)
    .setDescription(
      '────── ✦⠂⠂୨୧ ──────\n' +
      'ϙᴜᴇꜱᴛɪᴏɴ ᴏꜰ ᴛʜᴇ ᴅᴀʏ\n\n' +
      question +
      '\n\n────── ୨୧⠂⠂✦ ──────'
    )
    .setTimestamp();

  await channel.send({ embeds: [embed] }).catch(() => {});
}

function init(client) {
  const checkInterval = 60 * 60 * 1000;
  setInterval(async () => {
    const today = getTodayStr();
    if (today !== lastDate) {
      lastDate = today;
      await postQOTD(client);
    }
  }, checkInterval);

  lastDate = getTodayStr();
  setTimeout(async () => {
    await postQOTD(client);
  }, 5000);
}

module.exports = { init, postQOTD };
