import {
	Client,
	GatewayIntentBits,
	Events,
	Collection,
	Interaction,
	MessageFlags,
	Partials,
} from "discord.js";
import { loadCommands } from "./lib/commands.js";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { Resource } from "../types.js";
import McBot from "./structs/MinecraftBot.js";
import config from "./config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.DirectMessages,
	],
	partials: [Partials.Channel, Partials.Message],
});

client.commands = new Collection();
client.queue = new Collection();
client.bots = new Collection();

await loadCommands(__dirname, client);

// LISTEN FOR AND EXECUTE COMMANDS
client.on(Events.InteractionCreate, async (interaction: Interaction) => {
	if (!interaction.isChatInputCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({
				content: "There was an error while executing this command!",
				flags: MessageFlags.Ephemeral,
			});
		} else {
			await interaction.reply({
				content: "There was an error while executing this command!",
				flags: MessageFlags.Ephemeral,
			});
		}
	}
});

// CLIENT READY AND BOT PRESENCE
client.once(Events.ClientReady, (readyClient) => {
	console.log("Ready!, Connected as " + client.user?.tag);

	client.user?.setPresence({
		activities: [config.bot.presence],
	});
});

// CLIENT LOGIN
client.login(config.bot.token);
