// Import required dependencies
import Discord, { GatewayIntentBits, ActivityType } from "discord.js";
import keepAlive from './server.js';
import fetch from 'node-fetch';
import fs from 'fs';

// Import functions from wwoApiFunction.js
import { processMessages, welcome, sendMessageonDiscordChat, getPlayerUsername } from './wwoApiFunction.js';

// Register slash commands
import registerCommands from './register-commands.js';

// Import function from clan-activity.js
import { fetchMembers, fetchMembersWithXPChange, formatMembersListWithXPChange, getDaysSinceLastCheck, calculateXPChange } from './clan-activity.js';

// Discord client initialization
const client = new Discord.Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

// environment variables
const token = process.env['token'];
const wwokey = "bot " + process.env['WWOKEY'];
const clanId = process.env['wwoClanId'];
const channelId = process.env['channelId'];

// Bot setup
client.once('ready', () => {
    client.user.setActivity({
        name: 'Made by FoRoKo',
        type: ActivityType.Streaming,
        url: "https://www.youtube.com/watch?v=ZguL6LYswu8"
    });
    registerCommands(client);
    processMessages.init(client);
    console.log('bot is up');
});

// Slash command
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'aktywnosc') {
        const membersList = await fetchMembersWithXPChange();
        await interaction.reply(membersList);
    }
});

// Handle new messages in the designated Discord channel
client.on('messageCreate', async message => {
    if (message.channel.id === channelId) {
        if (message.content.startsWith('[Wilki') || message.content.includes('Witamy **')) return;
        else {
            sendMessageonWwoChat(message);
        }
    }
});

// Send message to WWO chat
function sendMessageonWwoChat(message) {
    const content = message.content;
    const username = message.member.nickname || message.author.username;
    let messageFormated = `[DISCORD ${username}] ${content}`;
    fetch(`https://api.wolvesville.com/clans/${clanId}/chat`, {
        method: 'POST',
        headers: {
            'Authorization': wwokey,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            message: messageFormated,
        })
    })
    .then(() => {
        console.log(`message ${content} sent!`);
    })
    .catch((error) => {
        console.error('message sending error:', error);
    });
}

// Login the Discord bot with the provided token
client.login(token);

// Keep the server alive
keepAlive();
