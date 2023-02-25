const Discord = require("discord.js")
const keepAlive = require(`./server`);

const client = new Discord.Client({
  intents: [
    Discord.GatewayIntentBits.Guilds,
    Discord.GatewayIntentBits.GuildMessages,
    Discord.GatewayIntentBits.MessageContent,
  ]
});

const token = process.env['token'];
const wwokey = "bot " + process.env['WWOKEY'];
const clanId = process.env['wwoClanId'];
const channelId = process.env['channelId'];
//todo make id fetch every x second
let lastMsgId = null;

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
}, 10000); // pobieraj wiadomości co 10 sekund

let lastMessageDate = new Date(0);

function processMessages(data) {
  const newMessages = data.filter(message => new Date(message.date) > lastMessageDate);
  newMessages.forEach(message => {
    sendMessageonDiscordChat(message);
  });
  if (newMessages.length > 0) {
    lastMessageDate = new Date(newMessages[0].date); // ustaw nową datę ostatniej wiadomości
  }
}
function sendMessageonDiscordChat(message) {
  const channel = client.channels.cache.get(channelId);
  if (message.playerId != null) {
    getPlayerUsername(message.playerId).then((username) => {
      channel.send(`[Wilki ${username}] ${message.msg}`);
    });
  }
}

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

client.once('ready', () => {
  client.user.setActivity('klanowy bocik by FoRoKo')
  console.log('bot is up');
});

client.on('messageCreate', async message =>{
  if(message.channel.id === channelId) {
    if(message.content.startsWith('[Wilki')) return;
    else{
      sendMessageonWwoChat(message);
    }
  }
});

function sendMessageonWwoChat(message){
  const content = message.content;
  const username = message.author.username;
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
      console.log(`Wiadomość ${content} wysłana!`);
      // wykonaj inne działania po wysłaniu wiadomości, np. odświeżenie listy wiadomości
    })
    .catch((error) => {
      console.error('Błąd wysyłania wiadomości:', error);
    });
}
client.login(token);
keepAlive();