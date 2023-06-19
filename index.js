// Import required dependencies
const Discord = require("discord.js");
const keepAlive = require(`./server`);
const fs = require('fs');
const { ActivityType } = require("discord.js");

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
    sendMessageonDiscordChat(message);
  });
  if (newMessages.length > 0) {
    lastMessageDate = new Date(newMessages[0].date);
    fs.writeFileSync(LAST_MESSAGE_FILE, lastMessageDate.toISOString());
  }
}

// Send message to Discord chat
function sendMessageonDiscordChat(message) {
  const channel = client.channels.cache.get(channelId);
  if (message.playerId != null && !message.isSystem) {
    getPlayerUsername(message.playerId).then((username) => {
      channel.send(`[Wilki ${username}] ${message.msg}`);
    });
  }
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
  console.log('bot is up');
});

// Handle new messages in the designated Discord channel
client.on('messageCreate', async message => {
  if (message.channel.id === channelId) {
    if (message.content.startsWith('[Wilki')) return;
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
