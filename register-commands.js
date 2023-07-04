const { REST, Routes } = require('discord.js');

const commands = [
  {
    name: 'aktywnosc',
    description: 'sprawdź aktywność w klanie',
  },
];
const token = process.env['token'];
const appId = process.env['appId'];
const ServerId = process.env['ServerId'];
const rest = new REST({ version: '10' }).setToken(token);

async function registerCommands(client) {
  try {
    console.log('Registering slash commands');
    await rest.put(
      Routes.applicationGuildCommands(appId, ServerId),
      { body: commands }
    );
    console.log('Registering done');
  } catch (error) {
    console.log('error');
  }
}

module.exports = registerCommands;