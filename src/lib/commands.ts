import path from "path";
import fs from "fs";
import { Client } from "discord.js";

const addCommand = (client: Client, command: any, filePath: string) => {
	if (command.data && command.execute) {
		client.commands.set(command.data.name, command.execute);
		console.log(`Registered command: ${command.data.name}`);
	} else {
		console.log(
			`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
		);
	}
}

export async function loadCommands(__dirname: string, client: Client) {
	const foldersPath = path.join(__dirname, "commands");
	const commandFolders = fs.readdirSync(foldersPath);

	for (const folder of commandFolders) {
		const commandsPath = path.join(foldersPath, folder);
		const commandFiles = fs
			.readdirSync(commandsPath)
			.filter((file) => file.endsWith(".ts"));

		for (const file of commandFiles) {
			const filePath = path.join(commandsPath, file);
			const fileURL = new URL(`file://${filePath}`).toString();
			const command = await import(fileURL);

			addCommand(client, command, filePath);
		}
	}
}