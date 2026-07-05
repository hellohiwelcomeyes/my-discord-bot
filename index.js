const { Client, GatewayIntentBits, Collection, Partials } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: __dirname + '/.env' });
const { prefix } = require('./config');

const http = require('http');
http.createServer((req, res) => res.end('ok')).listen(process.env.PORT || 3000);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.commands = new Collection();
client.allCommands = [];

const commandFolders = fs.readdirSync(path.join(__dirname, 'commands'), { withFileTypes: true });
for (const dirent of commandFolders) {
  if (!dirent.isDirectory()) continue;
  const folder = dirent.name;
  const files = fs.readdirSync(path.join(__dirname, 'commands', folder)).filter(f => f.endsWith('.js'));
  for (const file of files) {
    const command = require(`./commands/${folder}/${file}`);
    if (command.data?.name) {
      client.commands.set(command.data.name, command);
      client.allCommands.push(command.data.toJSON());
    } else if (command.name) {
      client.commands.set(command.name, command);
    }
  }
}

const eventFiles = fs.readdirSync(path.join(__dirname, 'events')).filter(f => f.endsWith('.js'));
for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

client.on('messageCreate', async message => {
  if (message.author.bot) return;

  const wasFiltered = await automod.handleFilteredMessage(message, client);
  if (wasFiltered) return;

  if (!message.content.toLowerCase().startsWith(prefix.toLowerCase())) return;

  const args = message.content.slice(prefix.length).trim().split(/\s+/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName);
  if (!command || !command.executePrefix) return;

  try {
    await command.executePrefix(message, args);
  } catch (err) {
    console.error(`Error in ${prefix}${commandName}:`, err);
    message.reply('❌ Something went wrong running that command.');
  }
});

const logger = require('./utils/logger');
logger.init(client);

const antiraid = require('./utils/antiraid');
antiraid.init(client);

const automod = require('./utils/automod');

client.login(process.env.TOKEN);
