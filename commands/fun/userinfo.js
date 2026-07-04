const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
async function buildEmbed(member) {
  const user = member.user;
  const roles = member.roles.cache.filter(r => r.name !== '@everyone').sort((a,b) => b.position - a.position).map(r => r.toString()).slice(0, 10).join(', ') || 'None';
  return new EmbedBuilder().setColor(member.displayHexColor || 0xFFCBF6).setTitle(`👤 ${user.tag}`)
    .setThumbnail(user.displayAvatarURL({ size: 256 }))
    .addFields(
      { name: 'ID', value: user.id, inline: true },
      { name: 'Nickname', value: member.nickname ?? 'None', inline: true },
      { name: 'Account Created', value: `<t:${Math.floor(user.createdTimestamp/1000)}:R>`, inline: true },
      { name: 'Joined Server', value: `<t:${Math.floor(member.joinedTimestamp/1000)}:R>`, inline: true },
      { name: `Roles (${member.roles.cache.size - 1})`, value: roles }
    ).setTimestamp();
}
module.exports = {
  name: 'userinfo',
  data: new SlashCommandBuilder().setName('userinfo').setDescription('Get info about a user')
    .addUserOption(opt => opt.setName('user').setDescription('User (defaults to you)').setRequired(false)),
  async execute(interaction) {
    const member = interaction.options.getMember('user') ?? interaction.member;
    await interaction.reply({ embeds: [await buildEmbed(member)] });
  },
  async executePrefix(message) {
    const member = message.mentions.members.first() ?? message.member;
    await message.reply({ embeds: [await buildEmbed(member)] });
  },
};
