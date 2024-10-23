// Import required dependencies
import dotenv from 'dotenv';
import Discord, { GatewayIntentBits, ActivityType } from "discord.js";
import keepAlive from './server.js';
import { init as initProcessMessages, processMessages, welcome, sendMessageonDiscordChat, getPlayerUsername } from './wwoApiFunction.js';
import registerCommands from './register-commands.js';
import { init, fetchMembers, fetchMembersWithXPChange, formatMembersListWithXPChange, getDaysSinceLastCheck, calculateXPChange } from './clan-activity.js';


dotenv.config();

// Discord client initialization
const client = new Discord.Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

// Initialize process messages with the client
initProcessMessages(client);

// environment variables
const token = process.env['token'];
const name = process.env['name'];
const wwoClanId = process.env['wwoClanId'];
const channelId = process.env['channelId'];
const wwokey = "bot " + process.env['WWOKEY'];
const appId = process.env['appId'];
const clanId = process.env['wwoClanId'];
const ServerId = process.env['ServerId'];

// Bot setup
client.once('ready', () => {
    client.user.setActivity({
        name: 'Made by FoRoKo',
        type: ActivityType.Streaming,
        url: "https://www.youtube.com/watch?v=ZguL6LYswu8"
    });
    registerCommands(client);
	//init(client);
    console.log('Bot is up');
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
    let messageFormatted = `[DISCORD ${username}] ${content}`;
    fetch(`https://api.wolvesville.com/clans/${clanId}/chat`, {
        method: 'POST',
        headers: {
            'Authorization': wwokey,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            message: messageFormatted,
        })
    })
    .then(response => {
        // Sprawdź, czy odpowiedź jest w porządku
        if (!response.ok) {
            // Zapisz, co się stało
            console.error(`Error: ${response.status} ${response.statusText}`);
            return response.text(); // lub response.json() w zależności od sytuacji
        }
        return response.json();
    })
    .then(data => {
        console.log(`Message ${content} sent!`, data);
    })
    .catch((error) => {
        console.error('Message sending error:', error);
    });
}


// Login the Discord bot with the provided token
client.login(token);

// Keep the server alive
keepAlive();
