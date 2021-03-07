const Discord = require("discord.js");
const ytdl = require("ytdl-core");

const prefix = "!";

const client = new Discord.Client();

const queue = new Map();

client.once("ready", () => {
  console.log("Ready!");
});

client.once("reconnecting", () => {
  console.log("Reconnecting!");
});

client.once("disconnect", () => {
  console.log("Disconnect!");
});

client.on('message', message => {
  if (message.content === 'Aaron') {
    message.channel.send('Pishi Aaron');
  }
}),
  client.on('message', message => {
    if (message.content === 'hoy es viernes!') {
      message.channel.send('CHINGA A TU PUTA MADRE RICKY');
    }
  }),
  client.on('message', message => {
    if (message.content === 'hoy es sabado!') {
      message.channel.send('POLLO CHINGAS A TODA TU PUTAMADRE');
    }
  }),
  client.on('message', message => {
    if (message.content === 'hoy es domingo!') {
      message.channel.send('LES INFORMAMOS QUE EL USUARIO ARAÑA CHINGA A TODA SU PUTA MADRE');
    }
  }),
  client.on('message', message => {
    if (message.content === 'hoy es lunes!') {
      message.channel.send('CHINGA A TU PUTA MADRE MORRITO');
    }
  }),
  client.on('message', message => {
    if (message.content === 'jueves') {
      message.channel.send('Feliz jueves!');
    }
  }),
  client.on('message', message => {
    if (message.content === 'cumple') {
      message.channel.send('!p https://www.youtube.com/watch?v=s6gLh6mf0Ig');
    }
  }),
  client.on("message", async message => {
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;

    const serverQueue = queue.get(message.guild.id);

    if (message.content.startsWith(`${prefix}p`)) {
      execute(message, serverQueue);
      return;
    } else if (message.content.startsWith(`${prefix}s`)) {
      skip(message, serverQueue);
      return;
    } else if (message.content.startsWith(`${prefix}st`)) {
      stop(message, serverQueue);
      return;
    } else {
      message.channel.send("Escribe bien el comando puñeta!");
    }
  });

async function execute(message, serverQueue) {
  const args = message.content.split(" ");

  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel)
    return message.channel.send(
      "Tienes que estar en un canal de voz!, ya de pasada, comeme los cojones pa"
    );
  const permissions = voiceChannel.permissionsFor(message.client.user);
  if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
    return message.channel.send(
      "I need the permissions to join and speak in your voice channel!"
    );
  }

  const songInfo = await ytdl.getInfo(args[1]);
  const song = {
    title: songInfo.title,
    url: songInfo.video_url
  };

  if (!serverQueue) {
    const queueContruct = {
      textChannel: message.channel,
      voiceChannel: voiceChannel,
      connection: null,
      songs: [],
      volume: 5,
      playing: true
    };

    queue.set(message.guild.id, queueContruct);

    queueContruct.songs.push(song);

    try {
      var connection = await voiceChannel.join();
      queueContruct.connection = connection;
      play(message.guild, queueContruct.songs[0]);
    } catch (err) {
      console.log(err);
      queue.delete(message.guild.id);
      return message.channel.send(err);
    }
  } else {
    serverQueue.songs.push(song);
    return message.channel.send(`${song.title} Ha sido añadida pa!`);
  }
}

function skip(message, serverQueue) {
  if (!message.member.voice.channel)
    return message.channel.send(
      "Metete a un canal puñin!"
    );
  if (!serverQueue)
    return message.channel.send("No puedo eskipear si no hay rola pa!");
  serverQueue.connection.dispatcher.end();
}

function stop(message, serverQueue) {
  if (!message.member.voice.channel)
    return message.channel.send(
      "Tienes que estar en un canal de voz para stoppear pa!"
    );
  serverQueue.songs = [];
  serverQueue.connection.dispatcher.end();
}

function play(guild, song) {
  const serverQueue = queue.get(guild.id);
  if (!song) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    return;
  }

  const dispatcher = serverQueue.connection
    .play(ytdl(song.url))
    .on("finish", () => {
      serverQueue.songs.shift();
      play(guild, serverQueue.songs[0]);
    })
    .on("error", error => console.error(error));
  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
  serverQueue.textChannel.send(`Ahora tremenda rola: **${song.title}**`);
}

client.login(process.env.token);
