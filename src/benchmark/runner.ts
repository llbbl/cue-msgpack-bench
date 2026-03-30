import { parse } from "cue-ts";
import { decodeMsgpack } from "./msgpack";

export interface BenchmarkResult {
	format: "cue" | "msgpack" | "json";
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
