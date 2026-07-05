const rr = require('../utils/reactionroles');

module.exports = {
  name: 'messageReactionRemove',
  async execute(reaction, user, client) {
    if (user.bot) return;

    if (reaction.partial) {
      try { await reaction.fetch(); } catch { return; }
    }

    const panel = rr.getPanel(reaction.message.id);
    if (!panel) return;

    const emojiKey = reaction.emoji.id || reaction.emoji.name;
    const roleId = panel.roles[emojiKey];
    if (!roleId) return;

    const guild = client.guilds.cache.get(panel.guildId);
    if (!guild) return;

    const member = await guild.members.fetch(user.id).catch(() => null);
    if (!member) return;

    await member.roles.remove(roleId).catch(() => {});
  },
};