/// <reference types="vite/client" />

declare module "*.cue?raw" {
	const content: string;
	export default content;
}

declare module "*.json?raw" {
	const content: string;
	export default content;
}
