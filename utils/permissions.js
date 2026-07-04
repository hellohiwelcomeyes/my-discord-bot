const { ownerRoles, modRoleIds } = require('../config');

async function resolveMember(member) {
  if (!member?.guild) return member;
  try {
    return await member.guild.members.fetch({ user: member.id });
  } catch {
    return member;
  }
}

async function isOwner(member) {
  const m = await resolveMember(member);
  return m?.roles?.cache?.some?.(role => ownerRoles.includes(role.id)) ?? false;
}

async function isMod(member) {
  const m = await resolveMember(member);
  const cache = m?.roles?.cache;
  if (!cache) {
    console.log(`[PERM DEBUG] No roles cache for ${m?.user?.tag || m?.id}`);
    return false;
  }
  const roleIds = [...cache.keys()];
  if (roleIds.some(id => ownerRoles.includes(id))) return true;
  const matched = roleIds.filter(id => modRoleIds.includes(id));
  if (matched.length === 0) {
    const names = cache.map(r => `${r.name} (${r.id})`).join(', ');
    console.log(`[PERM DEBUG] ${m.user?.tag} roles: ${names}`);
    console.log(`[PERM DEBUG] Allowed mod role IDs: ${modRoleIds.join(', ')}`);
  }
  return matched.length > 0;
}

async function noPermSlash(interaction) {
  return interaction.reply({
    content: 'not for you',
    ephemeral: true,
  });
}

async function noPermPrefix(message) {
  return message.reply('not for you');
}

module.exports = { isOwner, isMod, noPermSlash, noPermPrefix };
