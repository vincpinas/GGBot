import dotenv from "dotenv";
import ytdl from "ytdl-core";
import { Client, MessageEmbed } from "discord.js";
import { random } from "./helpers";
import { PREFIX, VERSION } from "./const";

const client = new Client({ partials: ["MESSAGE", "REACTION"] });
const servers = {};

const SexyImagesData = [
	"src/images/ratsmodu.jpg",
	"src/images/thanass.jpg",
	"src/images/minionmeme.jpg",
	"src/images/tumblr_inlinefrog.jpg",
	"src/images/notevenstat.png",
	"src/images/travispain.jpg",
	"src/images/adiosamigos.jpg",
	"src/images/yareyare.jpg",
	"src/images/latom.jpg",
	"src/images/propermoan.jpg",
	"src/images/egirlgreen.jpg",
	"src/images/vr_porn_262x145.png",
	"src/images/help_me.PNG",
	"src/images/bigboicat.jpg",
	"src/images/Knipsadasdasdsel.png",
	"src/images/c38d6c1.jpg",
	"src/images/",
];

// CLIENT READY AND BOT ACTIVITY
client.on("ready", () => {
	console.log("Connected as " + client.user.tag);

	client.user.setActivity("Whale Sounds", { type: "LISTENING" });
});

// CUSTOM COMMANDS.
client.on("message", async (message) => {
	if (message.author.bot) return;
	if (message.content.startsWith(PREFIX)) {
		const [CMD_NAME, ...args] = message.content
			.trim()
			.substring(PREFIX.length)
			.split(/\s+/);

		if (CMD_NAME.toLowerCase() === "portfolio") {
			const portfolioEmbed = new MessageEmbed()
				.setColor(args[0])
				.setTitle(`${message.author.username}'s portfolio`)
				.setURL(args[1])
				.setAuthor(`${message.author.username}`)
				.setDescription(args.slice(2, args.length).join(" "))
				.setTimestamp()
				.setFooter(`check it out!`, message.author.avatarURL());

			message.channel.send(portfolioEmbed);
			message.delete();
		} else if (CMD_NAME.toLowerCase() === "portfolioformat") {
			message.channel.send(
				`@everyone Please format your portfolio embed in the following way: *${PREFIX}}Portfolio 'Colorcode' 'Url' 'Description'*`
			);
		}
	}
});

// CUSTOM MESSAGE RESPONSES.
client.on("message", (message) => {
	if (message.author.bot) return;
	// Je Moeder Response
	if (message.content.toUpperCase() === "JE MOEDER") {
		message.channel.send(`shut yo lame ass up ${message.author.username}`);
	}

	// Who are You?
	if (message.content.toUpperCase() === "WHO ARE YOU?") {
		const thisguild = message.guild;
		const owner = thisguild.owner.user.username;
		message.channel.send(`I'm V.I.D.A the personal assistant of ${owner}`);
	}

	// Current Version
	if (
		message.content.toUpperCase() === "CURRENT VERSION?" ||
		message.content.toUpperCase() === "CURRENT V?" ||
		message.content.toUpperCase() === "WHAT IS THE CURRENT VERSION?" ||
		message.content.toUpperCase() === "WHAT IS THE CURRENT V?"
	) {
		message.channel.send(`My current version is ${VERSION}`);
	}

	if (message.content.toUpperCase() === "SEXY?") {
		let imageobject = random(SexyImagesData);
		message.channel.send({ files: [imageobject] });
	}
});

// Music Commands
client.on("message", async (message) => {
	if (message.author.bot) return;
	if (!message.content.startsWith(PREFIX)) return;

	const voiceChannel = message.member.voice.channel;
	const args = message.content.substring(PREFIX.length).split(" ");

	args[0] = args[0].toLowerCase();

	switch (args[0]) {
		case "play":
			// Check if a youtube link was passed in or not.
			const regex = /^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/g;
			let linkver = args[1].match(regex);

			if (linkver == null)
				return message.channel.send(
					`Please pass in a valid YouTube link, ${message.author.username}`
				);

			// Play Function
			const play = (connection, message) => {
				var server = servers[message.guild.id];

				server.dispatcher = connection.play(
					ytdl(server.queue[0], { filter: "audioonly" })
				);

				server.queue.shift();

				server.dispatcher.on("finish", () => {
					if (server.queue[0]) {
						play(connection, message);
					} else {
						connection.disconnect();
					}
				});
			};

			// Aditional Necessary checks and setup.
			if (!args[1])
				return message.channel.send(
					`I'm sorry ${message.author.username}, you still need to provide a link.`
				);

			if (!voiceChannel)
				return message.channel.send(
					`${message.author.username} you need to be in a voice channel to play music.`
				);

			if (!servers[message.guild.id])
				servers[message.guild.id] = {
					queue: [],
				};

			var server = servers[message.guild.id];

			server.queue.push(args[1]);

			// If not in the voice channel yet, join and exec the func otherwise, do everything except this.
			if (!message.guild.voice)
				voiceChannel.join().then((connection) => {
					play(connection, message);
				});

			break;

		case "skip":
			var server = servers[message.guild.id];
			try {
				if (!message.member.voice.channel)
					return message.channel.send(
						`I'm sorry ${message.author.username} but you're not a channel like you are supposed to be.`
					);
				if (server.dispatcher) server.dispatcher.end();
			} catch (err) {
				console.log(err);
				message.channel.send(
					`There is currently no available dispatcher for this server, please start by using the play command before trying to skip.`
				);
			}
			break;

		case "queue":
			var server = servers[message.guild.id];
			try {
				if (server.queue.length === 0) {
					message.channel.send(`There is currently nothing in the queue.`);
				} else {
					message.channel.send(`Next up:`);
					server.queue.map(async (item, index) => {
						let count = index + 1;
						let info = await ytdl.getBasicInfo(server.queue[index]);
						message.channel.send(
							`${count}. ${info.videoDetails.media.song} by ${info.videoDetails.media.artist}`
						);
					});
				}
			} catch (err) {
				message.channel.send(
					`There is currently no queue, please use the play command to start adding songs.`
				);
			}
			break;

		case "stop":
			var server = servers[message.guild.id];
			if (message.guild.voice) {
				for (let i = server.queue.length - 1; i >= 0; i--)
					server.queue.splice(i, 1);
			}

			server.dispatcher.end();
			message.channel.send(`The queue has been stopped.`);
			break;
	}
});

// CLIENT LOGIN
client.login(process.env.BOT_TOKEN);
