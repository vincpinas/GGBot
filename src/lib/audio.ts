import playdl from "play-dl";
import { Resource, ResourceInfo, SearchResult } from "../../types";
import { createAudioResource } from "@discordjs/voice";
import { StreamType } from "@discordjs/voice";
import config from "../config.ts";

export function initPlayDl() {
	playdl.setToken({
		youtube: {
			cookie: config.audio.youtubeCookie,
		},
		useragent: [
			"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
		],
		soundcloud: {
			client_id: config.audio.soundCloudId,
		},
	});

	return playdl;
}

export async function search(searchTerm: string): Promise<SearchResult> {
	const result: SearchResult = {
		source: "",
		url: "",
		permalink: "",
		thumbnail: ""
	}

	if (searchTerm.includes("http://") || searchTerm.includes("https://")) {
		result.url = searchTerm;
	} else {
		const searchResults = await playdl.search(searchTerm, {
			limit: 1,
			source: { soundcloud: "tracks" },
			fuzzy: true
		});
		if (searchResults.length > 0) {
			const firstResult = searchResults[0];
			console.log(firstResult)

			result.url = firstResult.url;
			result.permalink = firstResult.permalink;
			result.thumbnail = firstResult.thumbnail;
		}
	}

	if (result.url.includes("spotify")) result.source = "spotify";
	else if (result.url.includes("youtube")) result.source = "youtube";
	else result.source = "soundcloud";

	return result;
}

async function getInfo(searchResult: SearchResult): Promise<ResourceInfo> {
	const source = searchResult.source;
	const url = searchResult.url;
	const info = {
		title: "",
	};

	if (source === "youtube") {
		const data = await playdl.video_basic_info(url);

		info.title = data.video_details.title ?? "";
	} else if (source === "soundcloud") {
		const data = await playdl.soundcloud(url);

		info.title = `${data.user.name !== "" ? data.user.name : "Unknown"} - ${data.name}`;
	}

	return new Promise((resolve) => {
		resolve(info);
	});
}

export async function makeResource(
	searchResult: SearchResult
): Promise<Resource> {
	let stream, type;

	const info = await getInfo(searchResult);

	const dlStream = await playdl.stream(searchResult.url, config.audio.defaultPlayDlOptions);
	stream = dlStream.stream;
	type = dlStream.type;

	if (!stream) throw new Error("No stream found");

	const resource = createAudioResource(stream, {
		inlineVolume: true,
		silencePaddingFrames: 50,
		inputType: type,
	});

	resource.volume?.setVolume(1.0);

	return {
		audioResource: resource,
		stream,
		type: type || StreamType.Arbitrary,
		info: info,
		source: searchResult.source,
	};
}
