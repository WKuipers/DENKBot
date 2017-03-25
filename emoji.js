const fs = require('fs');
const async = require('async');

var emoji = {};

const read_emojifile = (filename, callback) => {
  fs.readFile('emoji/' + filename, 'utf8', (err, data) => {
    if (err){
      callback(filename + 'could not be read');
    }
    else {
      emoji[filename.slice(0, -5)] = JSON.parse(data);
      callback();
    }
  });
};

fs.readdir('emoji', (err, files) => {
  if (!err) {
    async.each(files, read_emojifile, (err) => {
      if(err) {
        console.error(err);
      }
    });
  }
});

exports.messageHandler = message => {
  if (message.author === message.client.user || !message.guild || !message.guild.available){
    return;
  }
  const content = message.content;
  const guildid = message.guild.id;
  if (!emoji[guildid]) {
    emoji[guildid] = {}
  }
  if (content.startsWith('!react')) {
    add(message);
  }
  const triggersFound = Object.keys(emoji[guildid]).filter(trigger => {
    return content.toLowerCase().includes(trigger)
  })
  if (triggersFound.length > 0){
    triggersFound.map( trigger => 
      message.react(emoji[guildid][trigger])
    )
      .reduce( (promise, next) => promise.then(next), Promise.resolve());
  }
};

function add(message) {
  const content = message.content;
  const emojiResp = content.substr(7).split(';', 2);
  const guildid = message.guild.id;
  if(emojiResp.length != 2){
    return message.reply('wrong syntax for !react.\nuse !react trigger;emoji');
  }
  if (emojiResp[1][0] == '<') {
    emojiResp[1] = emojiResp[1].slice(1,-1);
  }
  return message.react(emojiResp[1])
    .then( success => {
      emoji[guildid][emojiResp[0].toLowerCase()] = emojiResp[1];
    })
    .then( () => {
      fs.writeFile('emoji/' + guildid + '.json',
        JSON.stringify(emoji[guildid]), err => console.error
    )})
    .catch( error => {
      console.log(error);
      return message.reply('that\'s not a valid emoji.');
    });
}
