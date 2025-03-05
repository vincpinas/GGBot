import { SlashCommandBuilder, ChatInputCommandInteraction, ApplicationCommandOptionType } from "discord.js";
import McBot from "../../structs/MinecraftBot.ts";
import { BotOptions } from "../../../types";
import config from "../../config.ts";

const command = new SlashCommandBuilder()
	.setName("afk")
	.setDescription("Get a minecraft bot to go afk for you")
	.addStringOption((option) =>
		option
			.setName("login")
			.setDescription("Format: username:password")
			.setRequired(true)
	)
    .addStringOption((option) => 
        option
            .setName("server")
            .setDescription("Format: host:port")
            .setRequired(true)
    )
    .addAttachmentOption((option) => 
        option
    .setName("actions")
    .setDescription("Filetype must be JSON! use /afkactions for help generating the file")
    .setRequired(true)
    )
    .addStringOption((option) => 
        option
            .setName("version")
            .setDescription("Defaults to " + config.minecraft.defaultVersion)
            .setRequired(false)
    )

async function execute(interaction: ChatInputCommandInteraction) {
    const client = interaction.client;
    const options = interaction.options;

    const botOptions: BotOptions = {};
    
    command.options.forEach(option => {
        const opt = option.toJSON();

        if(opt.type === ApplicationCommandOptionType.Attachment) {
            options.getAttachment(opt.name)
        }
        else botOptions[opt.name] = options.getString(opt.name);
    });

    const bot = new McBot(interaction, botOptions);

    // Add bot to the bot collection object on the client.
    interaction.reply("Created new bot under UID: " + bot.uid);
}

export { command as data, execute };
