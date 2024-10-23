import dotenv from 'dotenv';
import { REST, Routes } from 'discord.js';
dotenv.config();
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

export default async function registerCommands(client) {
    try {
        console.log('Registering slash commands');
        await rest.put(
            Routes.applicationGuildCommands(appId, ServerId),
            { body: commands }
        );
        console.log('Registering done');
    } catch (error) {
        console.log('Error while registering commands:', error);
    }
}