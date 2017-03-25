const Discord = require('discord.js');
const triggerResp = require('./triggerResp');
const emoji = require('./emoji');

if(!process.env.DISCORD_TOKEN){
  throw 'DISCORD_TOKEN environment variable not set';
}
const bot = new Discord.Client();


bot.on('ready', () => {
  console.log('READY');
});

bot.on('message', triggerResp.messageHandler);
bot.on('message', emoji.messageHandler);

bot.login(process.env.DISCORD_TOKEN)
