const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const responses = [
  '🟢 It is certain.','🟢 It is decidedly so.','🟢 Without a doubt.','🟢 Yes, definitely.',
  '🟢 You may rely on it.','🟢 As I see it, yes.','🟢 Most likely.','🟢 Outlook good.',
  '🟢 Yes.','🟢 Signs point to yes.','🟡 Reply hazy, try again.','🟡 Ask again later.',
  '🟡 Better not tell you now.','🟡 Cannot predict now.','🟡 Concentrate and ask again.',
  '🔴 Don\'t count on it.','🔴 My reply is no.','🔴 My sources say no.',
  '🔴 Outlook not so good.','🔴 Very doubtful.',
];
function buildEmbed(question, user) {
  return new EmbedBuilder()    .setColor(0xFFCBF6).setTitle('🎱 8-Ball')
    .addFields({ name: 'Question', value: question }, { name: 'Answer', value: responses[Math.floor(Math.random() * responses.length)] })
    .setFooter({ text: `Asked by ${user}` }).setTimestamp();
}
module.exports = {
  name: '8ball',
  data: new SlashCommandBuilder().setName('8ball').setDescription('Ask the magic 8-ball')
    .addStringOption(opt => opt.setName('question').setDescription('Your question').setRequired(true)),
  async execute(interaction) {
    await interaction.reply({ embeds: [buildEmbed(interaction.options.getString('question'), interaction.user.tag)] });
  },
  async executePrefix(message, args) {
    const question = args.join(' ');
    if (!question) return message.reply('Ask a question. Usage: `!a8ball will I win?`');
    await message.reply({ embeds: [buildEmbed(question, message.author.tag)] });
  },
};
