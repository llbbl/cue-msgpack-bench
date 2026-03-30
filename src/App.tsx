import { useCallback, useState } from "react";
import { examples } from "./benchmark/examples";
import type { Example } from "./benchmark/examples";
import { decodeMsgpack } from "./benchmark/msgpack";
import { runCueBenchmark, runJsonBenchmark, runMsgpackBenchmark } from "./benchmark/runner";
import type { BenchmarkResult } from "./benchmark/runner";
import { BenchmarkRunner } from "./components/BenchmarkRunner";
import { CueInput } from "./components/CueInput";
import { ResultsPanel } from "./components/ResultsPanel";
import { parse } from "cue-ts";

export default function App() {
	const [selectedExample, setSelectedExample] = useState<Example>(examples[0]);
	const [cueText, setCueText] = useState(examples[0].cueText);
	const [iterations, setIterations] = useState(1_000);
	const [isRunning, setIsRunning] = useState(false);
	const [jsonResult, setJsonResult] = useState<BenchmarkResult>();
	const [cueResult, setCueResult] = useState<BenchmarkResult>();
	const [msgpackResult, setMsgpackResult] = useState<BenchmarkResult>();
	const [jsonOutput, setJsonOutput] = useState<unknown>();
	const [cueOutput, setCueOutput] = useState<unknown>();
	const [msgpackOutput, setMsgpackOutput] = useState<unknown>();
	const [selectedExampleId, setSelectedExampleId] = useState<string | undefined>(examples[0].id);
	const [error, setError] = useState<string | null>(null);

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
				const jsonRes = await runJsonBenchmark(selectedExample.jsonText, iters);
				const cueRes = await runCueBenchmark(cueText, iters);
				const msgpackRes = await runMsgpackBenchmark(selectedExample.msgpackData, iters);

				setJsonResult(jsonRes);
				setCueResult(cueRes);
				setMsgpackResult(msgpackRes);

				// Capture parsed outputs for display
				setJsonOutput(JSON.parse(selectedExample.jsonText));
				setCueOutput(parse(cueText));
				setMsgpackOutput(decodeMsgpack(selectedExample.msgpackData));
			} catch (err) {
				setError(err instanceof Error ? err.message : String(err));
			} finally {
				setIsRunning(false);
			}
		},
		[cueText, selectedExample],
	);

	const handleReset = useCallback(() => {
		setJsonResult(undefined);
		setCueResult(undefined);
		setMsgpackResult(undefined);
		setJsonOutput(undefined);
		setCueOutput(undefined);
		setMsgpackOutput(undefined);
		setError(null);
	}, []);

	return (
		<div className="min-h-screen bg-zinc-950 text-zinc-100">
			<div className="mx-auto max-w-6xl px-6 py-10">
				{/* Header */}
				<header className="mb-10 text-center">
					<h1 className="text-3xl font-bold tracking-tight text-white">
						CUE vs MessagePack vs JSON Benchmark
					</h1>
					<p className="mt-2 text-sm text-zinc-500">
						Compare CUE parsing, MessagePack decoding, and JSON.parse in the browser
					</p>
				</header>

				{/* Error banner */}
				{error && (
					<div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
						<strong>Error:</strong> {error}
					</div>
				)}

				{/* Main layout */}
				<div className="grid gap-8 lg:grid-cols-2">
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
						cueResult={cueResult}
						msgpackResult={msgpackResult}
						jsonOutput={jsonOutput}
						cueOutput={cueOutput}
						msgpackOutput={msgpackOutput}
					/>
				</div>
			</div>
		</div>
	);
}
