import { encode } from "@msgpack/msgpack";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";

const examplesDir = join(import.meta.dir, "../src/benchmark/examples");
const jsonFiles = readdirSync(examplesDir).filter((f) => f.endsWith(".json"));

for (const file of jsonFiles) {
	const jsonPath = join(examplesDir, file);
	const data = JSON.parse(readFileSync(jsonPath, "utf-8"));
	const packed = encode(data);

	// Write raw .msgpack binary
	const msgpackPath = jsonPath.replace(/\.json$/, ".msgpack");
	writeFileSync(msgpackPath, packed);

	// Write .msgpack.ts with Uint8Array export for Vite consumption
	const tsPath = jsonPath.replace(/\.json$/, ".msgpack.ts");
	const bytes = Array.from(new Uint8Array(packed));
	const tsContent = [
		"// Auto-generated - do not edit. Run `bun run ./scripts/generate-msgpack.ts` to regenerate.",
		`export default new Uint8Array([${bytes.join(",")}]);`,
		"",
	].join("\n");
	writeFileSync(tsPath, tsContent);

	const name = basename(file, ".json");
	process.stdout.write(
		`Generated ${name}.msgpack (${packed.byteLength} bytes) + ${name}.msgpack.ts\n`,
	);
}
