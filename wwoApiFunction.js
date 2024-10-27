import fetch from 'node-fetch';
import fs from 'fs';
import Discord from "discord.js";
import dotenv from 'dotenv';
dotenv.config();
let client;

export function init(discordClient) {
    client = discordClient;
}

// environment variables
const wwokey = "bot " + process.env['WWOKEY'];
const clanId = process.env['wwoClanId'];
const channelId = process.env['channelId'];
const errorChannelId = process.env['errorChannelId'];
let lastMsgId = null;

const LAST_MESSAGE_FILE = 'last_message_date.txt';
let lastMessageDate = new Date(0);

// Check if last message file exists, read the last message date if available
if (fs.existsSync(LAST_MESSAGE_FILE)) {
	const lastMessageDateStr = fs.readFileSync(LAST_MESSAGE_FILE, 'utf-8');
	lastMessageDate = new Date(lastMessageDateStr);
}

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
    .then((response) => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then((data) => processMessages(data))
    .catch((error) => {
		sendErrorToDiscord(error.message);
    });
}, 10000); // get messages once per 10s

export function sendErrorToDiscord(error) {
	const channel = client.channels.cache.get(errorChannelId);
	channel.send(`<@343083547499954186>!!! <@1078716201993252865> Ma problem!: ${error}`);
}
// Process received messages
export function processMessages(data) {
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

// Welcomer
export function welcome(message) {
	const username = message.msg.split('join&username=')[1];
	const channel = client.channels.cache.get(channelId);
	channel.send(`Witamy **${username}**!`);
	var welcome = `Witamy ${username}! Zapraszamy na serwer discord https://discord.gg/XDygxsS.`;
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
			console.log(`message ${welcome} sent!`);
		})
		.catch((error) => {
			console.error('message sending error:', error);
		});
}

// Send message to Discord chat
export function sendMessageonDiscordChat(message) {
	const channel = client.channels.cache.get(channelId);
	getPlayerUsername(message.playerId).then((username) => {
		channel.send(`[Wilki ${username}] ${message.msg}`);
	});
}

// Fetch player's username from WWO API
export function getPlayerUsername(playerId) {
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
