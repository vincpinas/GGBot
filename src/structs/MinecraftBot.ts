import { ChatInputCommandInteraction, Client } from "discord.js";
import { randomUUID } from "crypto";
import { BotOptions, BotAction } from "../../types";
import config from "../config.ts";

export default class MinecraftBot {
    uid: string;
    client: Client;

    version: string = config.minecraft.defaultVersion;
    username: string | undefined;
    password: string | undefined;
    host: string | undefined;
    port: string | undefined;

    owner: string;

    actions: BotAction[] = [];


    constructor(interaction: ChatInputCommandInteraction, botOptions: BotOptions) {
        this.uid = randomUUID();
        this.client = interaction.client;

        this.owner = interaction.member?.user.id || "";

        if(!botOptions.login || !botOptions.server) {
            interaction.reply("Login and/or server paramater is missing");
            return this;
        }

        [this.username, this.password] = this.extractParams(botOptions.login, ":");
        [this.host, this.port] = this.extractParams(botOptions.server, ":")

        if(botOptions.version) this.version = botOptions.version;

        this.init();
    }

    init() {
        this.client.bots.set(this.uid, this);
    }

    // Methods
    // =====================================

    async addActions() {
        // Implementation
    }

    async runActions() {
        // Implementation
    }


    // Utility
    // =====================================

    extractParams(optionString: string, seperator: string) {
        const result = optionString.split(seperator).map(part => part.trim());
    
        return result;
    }
}