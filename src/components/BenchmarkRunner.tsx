const ITERATION_OPTIONS = [100, 1_000, 10_000] as const;

interface BenchmarkRunnerProps {
	onRun: (iterations: number) => void;
	onReset: () => void;
	isRunning: boolean;
	selectedIterations: number;
	onIterationsChange: (iterations: number) => void;
}

export function BenchmarkRunner({
	onRun,
	onReset,
	isRunning,
	selectedIterations,
	onIterationsChange,
}: BenchmarkRunnerProps) {
	return (
		<div className="flex flex-col gap-4">
			<div>
				<p className="mb-2 text-sm font-medium text-zinc-400">Iterations</p>
				<div className="flex gap-2">
					{ITERATION_OPTIONS.map((count) => (
						<button
							type="button"
							key={count}
							onClick={() => onIterationsChange(count)}
							className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
								selectedIterations === count
									? "border-violet-500 bg-violet-500/20 text-violet-300"
									: "border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300"
							}`}
						>
							{count.toLocaleString()}
						</button>
					))}
				</div>
			</div>
			<div className="flex gap-3">
				<button
					type="button"
					onClick={() => onRun(selectedIterations)}
					disabled={isRunning}
					className="flex-1 rounded-lg bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{isRunning ? "Running..." : "Run Benchmark"}
				</button>
				<button
					type="button"
					onClick={onReset}
					disabled={isRunning}
					className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm font-medium text-zinc-400 transition-colors hover:border-zinc-600 hover:text-zinc-300 disabled:cursor-not-allowed disabled:opacity-50"
				>
					Reset
				</button>
			</div>
		</div>
	);
}
