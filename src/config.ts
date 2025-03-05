import "dotenv/config";
import { ActivityType } from "discord.js";

const config = {
    bot: {
        token: process.env.BOT_TOKEN,
        clientId: process.env.CLIENT_ID,
        guildId: process.env.GUILD_ID,
        version: "1.0.0",
        prefix: "$",
        presence: { name: "Jerkmate Ranked", type: ActivityType.Competing },
    },
    minecraft: {
        defaultVersion: "1.20.4"
    },
    audio: {
        soundCloudId: process.env.SOUNDCLOUD_ID || "",
        youtubeCookie: process.env.YOUTUBE_COOKIE || "",
        defaultPlayDlOptions: {
            discordPlayerCompatibility: true,
            seek: 0,
            quality: 0,
        }
    }
}

export default config;