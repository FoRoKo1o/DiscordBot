# DiscordBot
This is a simple Discord bot that allows members of a Wolvesville clan to chat with each other in real-time, even when they're not in the game. The bot uses the Discord.js library to send and receive messages from a designated channel in a Discord server, and the Wolvesville API to fetch and post messages to the game's chat. The bot is hosted on https://replit.com/@FoRoKo/WilkiBot, a cloud-based development and hosting platform, and kept alive 24/7 using uptimerobot.com, a free uptime monitoring service.

# Installation
To use this bot, you'll need to have Node.js and npm installed on your system. Once you've got those set up, you can follow these steps to get the bot up and running:

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
* clan ID - can be obtained by using GET /clans/search?name={name}
* Discord channel ID - that the bot will listen to

Start the bot by running node index.js in the project directory.

# Usage
Once the bot is running, it will automatically fetch new messages from the Wolvesville chat every 10 seconds and send them to the designated Discord channel. Likewise, any messages posted in the Discord channel will be forwarded to the Wolvesville chat.
Whenever a new player joins, the clan bot will post a welcome message in game chat and also post a short message in Discord.

# Future Updates
The following updates are planned for future versions of the bot:

* Making the code more readable.
* Adding an automod function that kicks inactive players.
* Allowing members to buy clan quests via Discord pools.
* Optimizing RAM usage by saving messages to a file.
# Credits
This bot was made by FoRoKo#5660. Thanks to the Discord.js and Wolvesville.js libraries for making this project possible!
