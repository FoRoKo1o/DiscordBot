# DiscordBot
This is a simple Discord bot that allows members of a Wolvesville clan to chat with each other in real-time, even when they're not in the game. The bot uses the Discord.js library to send and receive messages from a designated channel in a Discord server, and the Wolvesville API to fetch and post messages to the game's chat. The bot is hosted on Linux Alpine VPS.

# Installation
To use this bot, you'll need to have Node.js and npm installed on your system. Once you have Node.js and npm installed, follow these steps to get the bot up and running:

* Clone this repository to your local machine.
* Install the required dependencies by running npm install in the project directory.
* Set up your environment variables by creating a .env file in the project directory with the following contents:

```
token=YOUR_DISCORD_BOT_TOKEN
WWOKEY=YOUR_WOLVESVILLE_API_KEY
wwoClanId=YOUR_WOLVESVILLE_CLAN_ID
channelId=YOUR_DISCORD_CHANNEL_ID
```

Replace the values with your own:

* Discord bot token - from discord.com/developers
* Wolvesville API key - available in game menu
* clan ID - clan ID - can be obtained by using GET /clans/search?name={name}
* Discord channel ID - that the bot will listen to

# Running bot
Under Linux
1. `git clone https://github.com/FoRoKo1o/DiscordBot.git`
1. `cd DiscordBot`
1. Create a `.env` file and add the environment variables as described in the [Installation](#installation) section.
1. `npm install`
1. `nohup node index.js &` - run the bot in the background

To stop the bot:
1. List all Node.js process IDs by running `ps aux | grep node`


Output:
```
username  1234  0.0  1.2  123456  12345 ?  S    12:34   0:00 node index.js
username  5678  0.0  0.0  123456  12345 pts/0 S+   12:34   0:00 grep node
```

2. Find PID of desired process - in this case `1234`
3. Kill process `kill 1234`

# Usage
Once the bot is running, it will automatically fetch new messages from the Wolvesville chat every 10 seconds and send them to the designated Discord channel. Likewise, any messages posted in the Discord channel will be forwarded to the Wolvesville chat.

# Features
* Whenever a new player joins, the clan bot will post a welcome message in game chat and also post a short message in Discord.
* Includes a Discord slash command "/aktywnosc". This command displays detailed information about clan members, including offline days and XP change since the last check.


# Future Updates
The following updates are planned for future versions of the bot:

* Adding an automod function that kicks inactive players.
* Allowing members to buy clan quests via Discord polls.

# Credits
* This bot was made by [FoRoKo](https://github.com/FoRoKo1o/) using [Discord.js](https://discord.js.org/) and [Wolvesville.js](https://wolvesville.js.org/) libraries.
* Bot hosted by [Mikrus VPS](https://mikr.us/)