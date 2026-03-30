import { parse, deserializeTs, deserialize, fastDeserialize, compileSchema, stripDefinitions } from "cue-ts";
import type { z } from "zod";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import { decodeMsgpack } from "./msgpack";

export interface BenchmarkResult {
	format: "cue" | "cue-deserialize-ts" | "cue-deserialize-wasm" | "cue-fast-deserialize" | "cue-compiled" | "msgpack" | "json" | "json-zod" | "msgpack-zod" | "json-ajv-compiled" | "json-ajv-interpret";
	iterations: number;
	median: number;
	mean: number;
	min: number;
	max: number;
	payloadBytes: number;
}

const MEASURE_BATCH = 50; // operations per timing measurement
const YIELD_BATCH = 200; // operations between UI yields
const WARMUP_ITERATIONS = MEASURE_BATCH * 2; // 100 warmup iterations

function calculateStats(times: number[]): {
	median: number;
	mean: number;
	min: number;
	max: number;
} {
	const sorted = [...times].sort((a, b) => a - b);
	const mid = Math.floor(sorted.length / 2);
	const median =
		sorted.length % 2 !== 0
			? sorted[mid]
			: (sorted[mid - 1] + sorted[mid]) / 2;
	const mean = times.reduce((a, b) => a + b, 0) / times.length;
	return { median, mean, min: sorted[0], max: sorted[sorted.length - 1] };
}

async function runBatched(
	operation: () => void,
	iterations: number,
): Promise<number[]> {
	const times: number[] = [];
	let completed = 0;

	while (completed < iterations) {
		const yieldEnd = Math.min(completed + YIELD_BATCH, iterations);

		while (completed < yieldEnd) {
			const measureEnd = Math.min(completed + MEASURE_BATCH, yieldEnd);
			const count = measureEnd - completed;

			const start = performance.now();
			for (let i = 0; i < count; i++) {
				operation();
			}
			const elapsed = performance.now() - start;
			times.push((elapsed * 1000) / count); // microseconds per operation

			completed = measureEnd;
		}

		await new Promise<void>((r) => setTimeout(r, 0)); // yield to UI
	}

	return times;
}

export async function runCueBenchmark(cueText: string, iterations: number): Promise<BenchmarkResult> {
	const payloadBytes = new TextEncoder().encode(cueText).byteLength;

	// Warm up
	for (let i = 0; i < WARMUP_ITERATIONS; i++) {
		parse(cueText);
	}

	const times = await runBatched(() => parse(cueText), iterations);

	return { format: "cue", iterations, payloadBytes, ...calculateStats(times) };
}

export async function runMsgpackBenchmark(msgpackData: Uint8Array, iterations: number): Promise<BenchmarkResult> {
	const payloadBytes = msgpackData.byteLength;

	// Warm up
	for (let i = 0; i < WARMUP_ITERATIONS; i++) {
		decodeMsgpack(msgpackData);
	}

	const times = await runBatched(() => decodeMsgpack(msgpackData), iterations);

	return { format: "msgpack", iterations, payloadBytes, ...calculateStats(times) };
}

export async function runJsonBenchmark(jsonString: string, iterations: number): Promise<BenchmarkResult> {
	const payloadBytes = new TextEncoder().encode(jsonString).byteLength;

	// Warm up
	for (let i = 0; i < WARMUP_ITERATIONS; i++) {
		JSON.parse(jsonString);
	}

	const times = await runBatched(() => JSON.parse(jsonString), iterations);

	return { format: "json", iterations, payloadBytes, ...calculateStats(times) };
}

export async function runCueDeserializeTsBenchmark(cueText: string, iterations: number): Promise<BenchmarkResult> {
	const payloadBytes = new TextEncoder().encode(cueText).byteLength;

	// Warm up
	for (let i = 0; i < WARMUP_ITERATIONS; i++) {
		deserializeTs(cueText);
	}

	const times = await runBatched(() => deserializeTs(cueText), iterations);

	return { format: "cue-deserialize-ts", iterations, payloadBytes, ...calculateStats(times) };
}

export async function runCueFastDeserializeBenchmark(cueText: string, iterations: number): Promise<BenchmarkResult> {
	const payloadBytes = new TextEncoder().encode(cueText).byteLength;

	// Warm up
	for (let i = 0; i < WARMUP_ITERATIONS; i++) {
		fastDeserialize(cueText);
	}

	const times = await runBatched(() => fastDeserialize(cueText), iterations);

	return { format: "cue-fast-deserialize", iterations, payloadBytes, ...calculateStats(times) };
}

export async function runCueDeserializeWasmBenchmark(cueText: string, iterations: number): Promise<BenchmarkResult> {
	const payloadBytes = new TextEncoder().encode(cueText).byteLength;

	// Warm up
	for (let i = 0; i < WARMUP_ITERATIONS; i++) {
		deserialize(cueText, { engine: "wasm" });
	}

	const times = await runBatched(() => deserialize(cueText, { engine: "wasm" }), iterations);

	return { format: "cue-deserialize-wasm", iterations, payloadBytes, ...calculateStats(times) };
}

export async function runJsonZodBenchmark(jsonString: string, zodSchema: z.ZodType, iterations: number): Promise<BenchmarkResult> {
	const payloadBytes = new TextEncoder().encode(jsonString).byteLength;

	// Warm up
	for (let i = 0; i < WARMUP_ITERATIONS; i++) {
		zodSchema.parse(JSON.parse(jsonString));
	}

	const times = await runBatched(() => zodSchema.parse(JSON.parse(jsonString)), iterations);

	return { format: "json-zod", iterations, payloadBytes, ...calculateStats(times) };
}

export async function runMsgpackZodBenchmark(msgpackData: Uint8Array, zodSchema: z.ZodType, iterations: number): Promise<BenchmarkResult> {
	const payloadBytes = msgpackData.byteLength;

	// Warm up
	for (let i = 0; i < WARMUP_ITERATIONS; i++) {
		zodSchema.parse(decodeMsgpack(msgpackData));
	}

	const times = await runBatched(() => zodSchema.parse(decodeMsgpack(msgpackData)), iterations);

	return { format: "msgpack-zod", iterations, payloadBytes, ...calculateStats(times) };
}

export async function runJsonAjvCompiledBenchmark(jsonString: string, schema: Record<string, unknown>, iterations: number): Promise<BenchmarkResult> {
	const payloadBytes = new TextEncoder().encode(jsonString).byteLength;

	// Compile schema ONCE before benchmark
	const ajv = new Ajv({ allErrors: true });
	addFormats(ajv);
	const validate = ajv.compile(schema);

	// Warm up
	for (let i = 0; i < WARMUP_ITERATIONS; i++) {
		validate(JSON.parse(jsonString));
	}

	const times = await runBatched(() => validate(JSON.parse(jsonString)), iterations);

	return { format: "json-ajv-compiled", iterations, payloadBytes, ...calculateStats(times) };
}

export async function runJsonAjvInterpretBenchmark(jsonString: string, schema: Record<string, unknown>, iterations: number): Promise<BenchmarkResult> {
	const payloadBytes = new TextEncoder().encode(jsonString).byteLength;

	// Warm up
	for (let i = 0; i < WARMUP_ITERATIONS; i++) {
		const ajv = new Ajv({ allErrors: true });
		addFormats(ajv);
		const validate = ajv.compile(schema);
		validate(JSON.parse(jsonString));
	}

	const times = await runBatched(() => {
		const ajv = new Ajv({ allErrors: true });
		addFormats(ajv);
		const validate = ajv.compile(schema);
		validate(JSON.parse(jsonString));
	}, iterations);

	return { format: "json-ajv-interpret", iterations, payloadBytes, ...calculateStats(times) };
}

export async function runCueCompiledBenchmark(cueText: string, iterations: number): Promise<BenchmarkResult> {
	// Pre-compile schema AND strip definitions ONCE (not timed)
	const validator = compileSchema(cueText);
	const dataOnlyText = stripDefinitions(cueText);
	const payloadBytes = new TextEncoder().encode(dataOnlyText).byteLength;

	// Warm up
	for (let i = 0; i < WARMUP_ITERATIONS; i++) {
		const data = fastDeserialize(dataOnlyText);
		validator.validate(data);
	}

	const times = await runBatched(() => {
		const data = fastDeserialize(dataOnlyText);
		validator.validate(data);
	}, iterations);

	return { format: "cue-compiled", iterations, payloadBytes, ...calculateStats(times) };
}
