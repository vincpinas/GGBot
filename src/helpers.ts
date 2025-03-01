// Choose a random item in the Data list passed as a parameter.
export function random(data) {
	let index = Math.floor(Math.random() * data.length);
	return data[index];
}