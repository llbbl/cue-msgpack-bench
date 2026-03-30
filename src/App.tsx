import { useCallback, useEffect, useState } from "react";
import { examples } from "./benchmark/examples";
import type { Example } from "./benchmark/examples";
import { decodeMsgpack } from "./benchmark/msgpack";
import {
	runCueBenchmark,
	runCueDeserializeTsBenchmark,
	runCueFastDeserializeBenchmark,
	runCueDeserializeWasmBenchmark,
	runJsonBenchmark,
	runJsonZodBenchmark,
	runMsgpackBenchmark,
	runMsgpackZodBenchmark,
} from "./benchmark/runner";
import type { BenchmarkResult } from "./benchmark/runner";
import { BenchmarkRunner } from "./components/BenchmarkRunner";
import { CueInput } from "./components/CueInput";
import { ResultsPanel } from "./components/ResultsPanel";
import { parse, deserializeTs, fastDeserialize, deserialize, initWasm } from "cue-ts";

export default function App() {
	const [selectedExample, setSelectedExample] = useState<Example>(examples[0]);
	const [cueText, setCueText] = useState(examples[0].cueText);
	const [iterations, setIterations] = useState(1_000);
	const [isRunning, setIsRunning] = useState(false);
	const [wasmReady, setWasmReady] = useState(false);
	const [jsonResult, setJsonResult] = useState<BenchmarkResult>();
	const [cueParseResult, setCueParseResult] = useState<BenchmarkResult>();
	const [cueDeserializeTsResult, setCueDeserializeTsResult] = useState<BenchmarkResult>();
	const [cueFastDeserializeResult, setCueFastDeserializeResult] = useState<BenchmarkResult>();
	const [cueDeserializeWasmResult, setCueDeserializeWasmResult] = useState<BenchmarkResult>();
	const [msgpackResult, setMsgpackResult] = useState<BenchmarkResult>();
	const [jsonZodResult, setJsonZodResult] = useState<BenchmarkResult>();
	const [msgpackZodResult, setMsgpackZodResult] = useState<BenchmarkResult>();
	const [jsonOutput, setJsonOutput] = useState<unknown>();
	const [cueParseOutput, setCueParseOutput] = useState<unknown>();
	const [cueDeserializeTsOutput, setCueDeserializeTsOutput] = useState<unknown>();
	const [cueFastDeserializeOutput, setCueFastDeserializeOutput] = useState<unknown>();
	const [cueDeserializeWasmOutput, setCueDeserializeWasmOutput] = useState<unknown>();
	const [msgpackOutput, setMsgpackOutput] = useState<unknown>();
	const [selectedExampleId, setSelectedExampleId] = useState<string | undefined>(examples[0].id);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		initWasm()
			.then(() => setWasmReady(true))
			.catch((err) =>
				setError(`WASM init failed: ${err instanceof Error ? err.message : String(err)}`),
			);
	}, []);

	const handleExampleSelect = useCallback((example: Example) => {
		setCueText(example.cueText);
		setSelectedExample(example);
		setSelectedExampleId(example.id);
	}, []);

	const handleCueTextChange = useCallback((value: string) => {
		setCueText(value);
		setSelectedExampleId(undefined);
	}, []);

	const handleRun = useCallback(
		async (iters: number) => {
			setIsRunning(true);
			setError(null);

			try {
				// Run all benchmarks sequentially — each wrapped so one failure doesn't block others
				const jsonRes = await runJsonBenchmark(selectedExample.jsonText, iters);
				setJsonResult(jsonRes);

				try { const r = await runCueBenchmark(cueText, iters); setCueParseResult(r); } catch { setCueParseResult(undefined); }
				try { const r = await runCueDeserializeTsBenchmark(cueText, iters); setCueDeserializeTsResult(r); } catch { setCueDeserializeTsResult(undefined); }
				try { const r = await runCueFastDeserializeBenchmark(cueText, iters); setCueFastDeserializeResult(r); } catch { setCueFastDeserializeResult(undefined); }
				try {
					const r = wasmReady ? await runCueDeserializeWasmBenchmark(cueText, iters) : undefined;
					setCueDeserializeWasmResult(r);
				} catch { setCueDeserializeWasmResult(undefined); }

				const msgpackRes = await runMsgpackBenchmark(selectedExample.msgpackData, iters);
				setMsgpackResult(msgpackRes);

				// Zod validation benchmarks (only for schema examples)
				if (selectedExample.zodSchema) {
					try { const r = await runJsonZodBenchmark(selectedExample.jsonText, selectedExample.zodSchema, iters); setJsonZodResult(r); } catch { setJsonZodResult(undefined); }
					try { const r = await runMsgpackZodBenchmark(selectedExample.msgpackData, selectedExample.zodSchema, iters); setMsgpackZodResult(r); } catch { setMsgpackZodResult(undefined); }
				} else {
					setJsonZodResult(undefined);
					setMsgpackZodResult(undefined);
				}

				// Capture parsed outputs for display (each independent so one failure doesn't block others)
				try { setJsonOutput(JSON.parse(selectedExample.jsonText)); } catch { /* skip */ }
				try { setCueParseOutput(parse(cueText)); } catch { /* skip */ }
				try { setCueDeserializeTsOutput(deserializeTs(cueText)); } catch { /* skip */ }
				try { setCueFastDeserializeOutput(fastDeserialize(cueText)); } catch { /* skip */ }
				try { setCueDeserializeWasmOutput(wasmReady ? deserialize(cueText, { engine: "wasm" }) : undefined); } catch { /* skip */ }
				try { setMsgpackOutput(decodeMsgpack(selectedExample.msgpackData)); } catch { /* skip */ }
			} catch (err) {
				setError(err instanceof Error ? err.message : String(err));
			} finally {
				setIsRunning(false);
			}
		},
		[cueText, selectedExample, wasmReady],
	);

	const handleReset = useCallback(() => {
		setJsonResult(undefined);
		setCueParseResult(undefined);
		setCueDeserializeTsResult(undefined);
		setCueFastDeserializeResult(undefined);
		setCueDeserializeWasmResult(undefined);
		setMsgpackResult(undefined);
		setJsonZodResult(undefined);
		setMsgpackZodResult(undefined);
		setJsonOutput(undefined);
		setCueParseOutput(undefined);
		setCueDeserializeTsOutput(undefined);
		setCueFastDeserializeOutput(undefined);
		setCueDeserializeWasmOutput(undefined);
		setMsgpackOutput(undefined);
		setError(null);
	}, []);

	return (
		<div className="min-h-screen bg-zinc-950 text-zinc-100">
			<div className="mx-auto max-w-7xl px-6 py-10">
				{/* Header */}
				<header className="mb-10 text-center">
					<h1 className="text-3xl font-bold tracking-tight text-white">
						CUE vs MessagePack vs JSON Benchmark
					</h1>
					<p className="mt-2 text-sm text-zinc-500">
						Compare 6 parsing/deserialization strategies in the browser
						{!wasmReady && (
							<span className="ml-2 text-yellow-500">(WASM loading...)</span>
						)}
					</p>
				</header>

				{/* Error banner */}
				{error && (
					<div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
						<strong>Error:</strong> {error}
					</div>
				)}

				{/* Main layout */}
				<div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
					{/* Left column: Input + Controls */}
					<div className="flex flex-col gap-6">
						<CueInput
							value={cueText}
							onChange={handleCueTextChange}
							examples={examples}
							onExampleSelect={handleExampleSelect}
							selectedExampleId={selectedExampleId}
						/>
						<BenchmarkRunner
							onRun={handleRun}
							onReset={handleReset}
							isRunning={isRunning}
							selectedIterations={iterations}
							onIterationsChange={setIterations}
						/>
					</div>

					{/* Right column: Results */}
					<ResultsPanel
						jsonResult={jsonResult}
						cueParseResult={cueParseResult}
						cueDeserializeTsResult={cueDeserializeTsResult}
						cueFastDeserializeResult={cueFastDeserializeResult}
						cueDeserializeWasmResult={cueDeserializeWasmResult}
						msgpackResult={msgpackResult}
						jsonZodResult={jsonZodResult}
						msgpackZodResult={msgpackZodResult}
						jsonOutput={jsonOutput}
						cueParseOutput={cueParseOutput}
						cueDeserializeTsOutput={cueDeserializeTsOutput}
						cueFastDeserializeOutput={cueFastDeserializeOutput}
						cueDeserializeWasmOutput={cueDeserializeWasmOutput}
						msgpackOutput={msgpackOutput}
					/>
				</div>
			</div>
		</div>
	);
}
