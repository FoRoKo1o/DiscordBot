// Import required dependencies
const Discord = require("discord.js");
const keepAlive = require(`./server`);

//const fetch = require('node-fetch');
import fetch from 'node-fetch'; // test

const fs = require('fs');
const {
	ActivityType
} = require("discord.js");

// Import functions from wwoApiFunction.js
const {
    processMessages,
    welcome,
    sendMessageonDiscordChat,
    getPlayerUsername,
} = require('./wwoApiFunction');
const wwoApiFunction = require('./wwoApiFunction');

// Register slash commands
const registerCommands = require('./register-commands');

// Import function from clan-activity.js
const {
    fetchMembers,
    fetchMembersWithXPChange,
    formatMembersListWithXPChange,
    getDaysSinceLastCheck,
    calculateXPChange
} = require('./clan-activity');
const clanactivity = require('./clan-activity');

// Discord client initialization
const client = new Discord.Client({
	intents: [
		Discord.GatewayIntentBits.Guilds,
		Discord.GatewayIntentBits.GuildMessages,
		Discord.GatewayIntentBits.MessageContent,
	]
});

// environment variables
const token = process.env['token'];
const wwokey = "bot " + process.env['WWOKEY'];
const clanId = process.env['wwoClanId'];
const channelId = process.env['channelId'];
let lastMsgId = null;

// Perform actions when the bot is ready
client.once('ready', () => {
	client.user.setActivity({
		name: 'Made by FoRoKo',
		type: ActivityType.Streaming,
		url: "https://www.youtube.com/watch?v=ZguL6LYswu8",
	});
  registerCommands(client);
  wwoApiFunction.init(client);
  clanactivity.init(client);
	console.log('bot is up');
});

//slash command
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
			console.log(`message ${content} send!`);
		})
		.catch((error) => {
			console.error('message sending error:', error);
		});
}
// Login the Discord bot with the provided token
client.login(token);

// Keep the server alive
keepAlive();
