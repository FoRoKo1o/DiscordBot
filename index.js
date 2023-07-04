// Import required dependencies
const Discord = require("discord.js");
const keepAlive = require(`./server`);
const fetch = require('node-fetch');
const fs = require('fs');
const {
	ActivityType
} = require("discord.js");

// Import funkcji rejestracji komend
const registerCommands = require('./register-commands');

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

const LAST_MESSAGE_FILE = 'last_message_date.txt';
let lastMessageDate = new Date(0);

// Check if last message file exists, read the last message date if available
if (fs.existsSync(LAST_MESSAGE_FILE)) {
	const lastMessageDateStr = fs.readFileSync(LAST_MESSAGE_FILE, 'utf-8');
	lastMessageDate = new Date(lastMessageDateStr);
}
// Global variable to store the previous XP values
let previousXPData = {};

// Fetch messages from WWO API at regular intervals
setInterval(() => {
	fetch(`https://api.wolvesville.com/clans/${clanId}/chat`, {
			method: 'GET',
			headers: {
				'Authorization': wwokey,
				'Content-Type': 'application/json',
				'Accept': 'application/json'
			}
		})
		.then((response) => response.json())
		.then((data) => processMessages(data));
}, 10000); // get messages once per 10s

// Process received messages
function processMessages(data) {
	const newMessages = data.filter(message => new Date(message.date) > lastMessageDate);
	newMessages.forEach(message => {
		if (message.playerId != null && !message.isSystem) {
			sendMessageonDiscordChat(message);
		} else if (message.isSystem && message.msg.includes('join&username=')) {
			welcome(message);
		}
	});
	if (newMessages.length > 0) {
		lastMessageDate = new Date(newMessages[0].date);
		fs.writeFileSync(LAST_MESSAGE_FILE, lastMessageDate.toISOString());
	}
}
//welcomer
function welcome(message) {
	const username = message.msg.split('join&username=')[1];
	const channel = client.channels.cache.get(channelId);
	channel.send(`Witamy **${username}**!`);
	var welcome = `Witamy ${username} w klanie Quack* Poland! Razem stworzymy niezapomniane chwile. 
W razie pytań pisz do:
Foroko, Grafin, Agama, Beathrice Preferowany kontakt: Discord https://discord.gg/XDygxsS.
Udanych łowów!`;
	fetch(`https://api.wolvesville.com/clans/${clanId}/chat`, {
			method: 'POST',
			headers: {
				'Authorization': wwokey,
				'Content-Type': 'application/json',
				'Accept': 'application/json'
			},
			body: JSON.stringify({
				message: welcome,
			})
		})
		.then(() => {
			console.log(`message ${welcome} send!`);
		})
		.catch((error) => {
			console.error('message sending error:', error);
		});
}
// Send message to Discord chat
function sendMessageonDiscordChat(message) {
	const channel = client.channels.cache.get(channelId);
	//if (message.playerId != null && !message.isSystem) {
	getPlayerUsername(message.playerId).then((username) => {
		channel.send(`[Wilki ${username}] ${message.msg}`);
	});
	//}
}

// Fetch player's username from WWO API
function getPlayerUsername(playerId) {
	return fetch(`https://api.wolvesville.com/players/${playerId}`, {
			method: 'GET',
			headers: {
				'Authorization': wwokey,
				'Content-Type': 'application/json',
				'Accept': 'application/json'
			}
		})
		.then((response) => response.json())
		.then((data) => data.username);
}

// Perform actions when the bot is ready
client.once('ready', () => {
	client.user.setActivity({
		name: 'Made by FoRoKo',
		type: ActivityType.Streaming,
		url: "https://www.youtube.com/watch?v=ZguL6LYswu8",
	});
  registerCommands(client);
	console.log('bot is up');
});

// Fetch members from WWO API
async function fetchMembers() {
  const response = await fetch(`https://api.wolvesville.com/clans/${clanId}/members`, {
    method: 'GET',
    headers: {
      'Authorization': wwokey,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });
  const members = await response.json();
  return members;
}
// Fetch members from WWO API and calculate XP change
async function fetchMembersWithXPChange() {
  const response = await fetch(`https://api.wolvesville.com/clans/${clanId}/members`, {
    method: 'GET',
    headers: {
      'Authorization': wwokey,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });
  const members = await response.json();
  const formattedList = formatMembersListWithXPChange(members);

  // Save previousXPData to a file
  fs.writeFileSync('previous_xp_data.json', JSON.stringify(members));

  return formattedList;
}


// Format the members list with XP change into a readable format
function formatMembersListWithXPChange(members) {
  let formattedList = `Members List (last checked ${getDaysSinceLastCheck()} days ago):\n`;
  const today = new Date();

  const maxLength = Math.max(...members.map((member) => member.username.length));

  members
    .filter((member) => !['Beathrice', 'Grafin', 'FoRoKo', 'Agama'].includes(member.username))
    .sort((a, b) => new Date(a.lastOnline) - new Date(b.lastOnline))
    .forEach((member, index) => {
      const lastOnline = new Date(member.lastOnline);
      const daysSinceLastLogin = Math.floor((today - lastOnline) / (1000 * 60 * 60 * 24));

      const username = member.username.padEnd(maxLength, ' ');
      const xpChange = calculateXPChange(member.playerId, member.xp);
      formattedList += `${username}  ${daysSinceLastLogin} d XP +${xpChange}\n`;

      
      // Update the previous XP data
      previousXPData[member.playerId] = member.xp;
    });
  // Save previousXPData to a file
  fs.writeFileSync('previous_xp_data.json', JSON.stringify(previousXPData));
  return '```\n' + formattedList + '\n```';
}

// Get the number of days since the last check
function getDaysSinceLastCheck() {
  const LAST_CHECK_FILE = 'last_check_date.txt';
  let lastCheckDate = new Date(0);

  // Check if the last check file exists, read the last check date if available
  if (fs.existsSync(LAST_CHECK_FILE)) {
    const lastCheckDateStr = fs.readFileSync(LAST_CHECK_FILE, 'utf-8');
    lastCheckDate = new Date(lastCheckDateStr);
  }

  const today = new Date();
  const timeDifference = today.getTime() - lastCheckDate.getTime();
  const daysSinceLastCheck = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

  // Save today's date as the new last check date
  fs.writeFileSync(LAST_CHECK_FILE, today.toISOString());

  return daysSinceLastCheck;
}



// Calculate XP change based on previous XP data
function calculateXPChange(playerId, currentXP) {
  if (previousXPData.hasOwnProperty(playerId)) {
    const previousXP = previousXPData[playerId];
    const xpChange = currentXP - previousXP;
    return xpChange;
  } else {
    // No previous XP data available
    return 'N/A';
  }
}

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