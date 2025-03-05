import { AudioResource, StreamType } from "@discordjs/voice";
import { Collection } from "discord.js";
import { InfoData, SoundCloud } from "play-dl";
import Stream from "stream";

declare module "discord.js" {
	interface Client {
		commands: Collection<string, any>;
		queue: Collection<string, Resource>;
		bots: Collection<string, McBot>;
	}
}

declare type ResourceInfo = {
	title: string;
}

declare interface Resource {
	source: any;
	audioResource: AudioResource;
	stream: Stream.Readable;
	type: StreamType
	info: ResourceInfo
}

declare interface SearchResult {
	source: string;
	url: string;
	permalink: string;
	thumbnail: string;
}

declare type BotOptions = {
	[key: string]: string | null;
}

declare type BotAction = {
	event?: string;
	chat?: string;
	delay: number = 200;
}