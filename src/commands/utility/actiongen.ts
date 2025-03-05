import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js"
import config from "../../config.ts";

const command = new SlashCommandBuilder()
	.setName("actiongen")
	.setDescription("Minecraft Bot action helper")

async function execute(interaction: ChatInputCommandInteraction) {
    const client = interaction.client;
    const options = interaction.options;
}

export { command as data, execute };
