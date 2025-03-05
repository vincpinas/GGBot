import {
	SlashCommandBuilder,
	GuildMember,
	ChatInputCommandInteraction,
	PermissionsBitField,
} from "discord.js";
import {
	joinVoiceChannel,
	createAudioPlayer,
	VoiceConnectionStatus,
	entersState,
	NoSubscriberBehavior,
} from "@discordjs/voice";

import { makeResource, initPlayDl, search } from "../../lib/audio.ts";

const command = new SlashCommandBuilder()
	.setName("play")
	.setDescription("Play music from YouTube or SoundCloud")
	.addStringOption((option) =>
		option
			.setName("search")
			.setDescription("Can be a url or songname")
			.setRequired(true)
	);

async function execute(interaction: ChatInputCommandInteraction) {
	const member = interaction.member as GuildMember;
	const voiceChannel = member.voice.channel;

	if (!voiceChannel) {
		return interaction.reply({
			content: "You need to be in a voice channel to play music!",
			ephemeral: true,
		});
	}

	// Check bot permissions
	const permissions = voiceChannel.permissionsFor(interaction.client.user);
	if (
		!permissions?.has(PermissionsBitField.Flags.Connect) ||
		!permissions.has(PermissionsBitField.Flags.Speak)
	) {
		return interaction.reply({
			content: "I need permissions to join and speak in your voice channel!",
			ephemeral: true,
		});
	}

	await interaction.deferReply();

	const searchTerm = interaction.options.getString("search");

	if (!searchTerm) return;

	initPlayDl();

	// Create connection first
	const connection = joinVoiceChannel({
		channelId: voiceChannel.id,
		guildId: voiceChannel.guild.id,
		adapterCreator: voiceChannel.guild.voiceAdapterCreator,
		selfDeaf: false,
		selfMute: false,
	});

	console.log(`Connected to channel: ${voiceChannel.name}`);

	const searchResult = await search(searchTerm);
	const resource = await makeResource(searchResult);

	const player = createAudioPlayer({
		behaviors: {
			noSubscriber: NoSubscriberBehavior.Play,
		},
	});

	// Add error handling for the player
	player.on("stateChange", (oldState, newState) => {
		console.log(
			`Player state changed from ${oldState.status} to ${newState.status}`
		);
	});

	player.on("error", async (error) => {
		console.error("Player error:", error);
		connection.destroy();
		await interaction.editReply(
			`**An error occurred while trying to play**  ${resource.info.title}`
		);
	});

	player.play(resource.audioResource);
	connection.subscribe(player);

	await interaction.editReply({
		content: `***Now playing   •***   **[${resource.info.title}](${searchResult.permalink})**`,
		embeds: [{
			image: {
				url: searchResult.thumbnail,
			},
		}],
	});

	connection.on(VoiceConnectionStatus.Disconnected, async () => {
		try {
			await Promise.race([
				entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
				entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
			]);
		} catch (error) {
			connection.destroy();
		}
	});
}

export { command as data, execute };
