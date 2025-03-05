import "dotenv/config";
import { REST, Routes } from "discord.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import config from "./config.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const commands: any[] = [];
// Grab all the command folders from the commands directory you created earlier
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

const clientId = config.bot.clientId;
const token = config.bot.token;
const guildId = config.bot.guildId;

console.log(
	"==================================\n",
	{ clientId, token, guildId },
	"\n=================================="
);

for (const folder of commandFolders) {
	// Grab all the command files from the commands directory you created earlier
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs
		.readdirSync(commandsPath)
		.filter((file) => file.endsWith(".ts"));
	// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const fileURL = new URL(`file://${filePath}`).toString();
		const command = await import(fileURL);

		if (command.data && command.execute) {
			console.log(`Loading command: ${command.data.name}`);
			commands.push(command.data.toJSON());
		} else {
			console.log(
				`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
			);
		}
	}
}

// Construct and prepare an instance of the REST module
if (!clientId || !token || !guildId) {
	console.error(
		`[ERROR] Missing a required "clientId", "token" or "guildId" environment variable.`
	);
	process.exit(1);
}

const rest = new REST().setToken(token);

// and deploy your commands!
(async () => {
	try {
		console.log(
			`Started refreshing ${commands.length} application (/) commands.`
		);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data: any = await rest.put(
			Routes.applicationGuildCommands(clientId, guildId),
			{ body: commands }
		);

		console.log(
			`Successfully reloaded ${data.length} application (/) commands.`
		);
	} catch (error) {
		console.error("Error during command deployment:", error);
	}
})();
