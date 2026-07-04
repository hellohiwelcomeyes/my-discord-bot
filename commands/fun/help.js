module.exports = {
  name: 'help',
  async executePrefix(message, args) {
    const text =
      '**Commands**\n' +
      '`!a8ball <q>` — ask\n' +
      '`!aavatar [@u]` — avatar\n' +
      '`!acoinflip` — flip\n' +
      '`!aroll [XdY]` — roll\n' +
      '`!aserverinfo` — server\n' +
      '`!auserinfo [@u]` — info\n' +
      '`!aticket` — support';
    await message.reply(text);
  },
};
