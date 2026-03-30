import { useState } from "react";
import type { BenchmarkResult } from "../benchmark/runner";
import { formatBytes, formatMicroseconds, formatRatio } from "../lib/format";

interface ResultsPanelProps {
	jsonResult?: BenchmarkResult;
	cueParseResult?: BenchmarkResult;
	cueDeserializeTsResult?: BenchmarkResult;
	cueFastDeserializeResult?: BenchmarkResult;
	cueDeserializeWasmResult?: BenchmarkResult;
	msgpackResult?: BenchmarkResult;
	jsonZodResult?: BenchmarkResult;
	msgpackZodResult?: BenchmarkResult;
	jsonOutput?: unknown;
	cueParseOutput?: unknown;
	cueDeserializeTsOutput?: unknown;
	cueFastDeserializeOutput?: unknown;
	cueDeserializeWasmOutput?: unknown;
	msgpackOutput?: unknown;
}

function StatRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
	return (
		<div className="flex justify-between py-0.5">
			<span className="text-zinc-500">{label}</span>
			<span className={highlight ? "font-semibold text-white" : "text-zinc-300"}>{value}</span>
		</div>
	);
}

type RankStatus = "fastest" | "slowest" | "neutral";

function ResultCard({
	title,
	result,
	status,
}: { title: string; result: BenchmarkResult; status: RankStatus }) {
	const borderColor =
		status === "fastest"
			? "border-green-500/50"
			: status === "slowest"
				? "border-red-500/30"
				: "border-zinc-700";
	const badge =
		status === "fastest" ? (
			<span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-medium text-green-400">
				Fastest
			</span>
		) : status === "slowest" ? (
			<span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-medium text-red-400">
				Slowest
			</span>
		) : null;

	return (
		<div className={`rounded-lg border ${borderColor} bg-zinc-900 p-3`}>
			<div className="mb-2 flex items-center justify-between gap-2">
				<h3 className="text-xs font-semibold text-zinc-200 leading-tight">{title}</h3>
				{badge}
			</div>
			<div className="space-y-0 text-xs">
				<StatRow label="Median" value={formatMicroseconds(result.median)} highlight />
				<StatRow label="Mean" value={formatMicroseconds(result.mean)} />
				<StatRow label="Min" value={formatMicroseconds(result.min)} />
				<StatRow label="Max" value={formatMicroseconds(result.max)} />
				<StatRow label="Payload" value={formatBytes(result.payloadBytes)} />
				<StatRow label="Iters" value={result.iterations.toLocaleString()} />
			</div>
		</div>
	);
}

interface RankedEntry {
	key: string;
	label: string;
	result: BenchmarkResult;
}

function rankResults(entries: RankedEntry[]): Map<string, RankStatus> {
	const sorted = [...entries].sort((a, b) => {
		const aMedian = a.result.median ?? a.result.mean;
		const bMedian = b.result.median ?? b.result.mean;
		return aMedian - bMedian;
	});
	const ranks = new Map<string, RankStatus>();
	for (let i = 0; i < sorted.length; i++) {
		if (i === 0) {
			ranks.set(sorted[i].key, "fastest");
		} else if (i === sorted.length - 1) {
			ranks.set(sorted[i].key, "slowest");
		} else {
			ranks.set(sorted[i].key, "neutral");
		}
	}
	return ranks;
}

function RatioLine({
	label,
	median,
	baselineMedian,
}: { label: string; median: number; baselineMedian: number }) {
	const slower = median > baselineMedian;
	const ratio = formatRatio(median, baselineMedian);
	const equivalent = Math.abs(median - baselineMedian) < 0.01;

	return (
		<p className="text-sm text-zinc-400">
			<span className="font-semibold text-white">{label}</span>{" "}
			{equivalent ? (
				<span className="font-semibold text-zinc-400">~equivalent</span>
			) : (
				<>
					<span className={`font-semibold ${slower ? "text-red-400" : "text-green-400"}`}>
						{ratio}
					</span>{" "}
					{slower ? "slower" : "faster"}
				</>
			)}
		</p>
	);
}

export function ResultsPanel({
	jsonResult,
	cueParseResult,
	cueDeserializeTsResult,
	cueFastDeserializeResult,
	cueDeserializeWasmResult,
	msgpackResult,
	jsonZodResult,
	msgpackZodResult,
	jsonOutput,
	cueParseOutput,
	cueDeserializeTsOutput,
	cueFastDeserializeOutput,
	cueDeserializeWasmOutput,
	msgpackOutput,
}: ResultsPanelProps) {
	const [showOutput, setShowOutput] = useState(false);

	const hasAnyResult = jsonResult || cueParseResult || cueDeserializeTsResult || cueFastDeserializeResult || cueDeserializeWasmResult || msgpackResult || jsonZodResult || msgpackZodResult;

	if (!hasAnyResult) {
		return (
			<div className="flex h-full items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/50 p-8">
				<p className="text-sm text-zinc-600">Run a benchmark to see results</p>
			</div>
		);
	}

	// Build list of available results
	const entries: RankedEntry[] = [];
	if (jsonResult) entries.push({ key: "json", label: "JSON.parse", result: jsonResult });
	if (cueParseResult) entries.push({ key: "cueParse", label: "CUE Parse (AST)", result: cueParseResult });
	if (cueDeserializeTsResult) entries.push({ key: "cueDeserializeTs", label: "CUE Deserialize (TS)", result: cueDeserializeTsResult });
	if (cueFastDeserializeResult) entries.push({ key: "cueFastDeserialize", label: "CUE Fast Deserialize", result: cueFastDeserializeResult });
	if (cueDeserializeWasmResult) entries.push({ key: "cueDeserializeWasm", label: "CUE Deserialize (WASM)", result: cueDeserializeWasmResult });
	if (msgpackResult) entries.push({ key: "msgpack", label: "MsgPack Decode", result: msgpackResult });
	if (jsonZodResult) entries.push({ key: "jsonZod", label: "JSON + Zod", result: jsonZodResult });
	if (msgpackZodResult) entries.push({ key: "msgpackZod", label: "MsgPack + Zod", result: msgpackZodResult });

	const ranks = rankResults(entries);

	// Baseline for ratio summary
	const jsonMedianFallback = jsonResult ? (jsonResult.median ?? jsonResult.mean) : 0;

	return (
		<div className="flex flex-col gap-4">
			{/* Ratio summary relative to JSON.parse baseline */}
			{jsonResult && entries.length > 1 && (
				<div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4 text-center space-y-1">
					<p className="mb-1 text-xs font-medium uppercase tracking-wider text-zinc-500">
						Speed relative to JSON.parse
					</p>
					{entries
						.filter((e) => e.key !== "json")
						.map((e) => (
							<RatioLine
								key={e.key}
								label={e.label}
								median={e.result.median ?? e.result.mean}
								baselineMedian={jsonMedianFallback}
							/>
						))}
				</div>
			)}

			{/* Responsive grid of result cards */}
			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
				{entries.map((e) => (
					<ResultCard
						key={e.key}
						title={e.label}
						result={e.result}
						status={ranks.get(e.key) ?? "neutral"}
					/>
				))}
			</div>

			{/* Collapsible parsed output */}
			{(jsonOutput !== undefined ||
				cueParseOutput !== undefined ||
				cueDeserializeTsOutput !== undefined ||
				cueFastDeserializeOutput !== undefined ||
				cueDeserializeWasmOutput !== undefined ||
				msgpackOutput !== undefined) && (
				<div>
					<button
						type="button"
						onClick={() => setShowOutput(!showOutput)}
						className="mb-2 text-sm text-zinc-500 transition-colors hover:text-zinc-300"
					>
						{showOutput ? "Hide" : "Show"} parsed output
					</button>
					{showOutput && (
						<div className="flex flex-col gap-4">
							{/* Parsed objects group */}
							<div>
								<p className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
									Parsed Objects (plain values)
								</p>
								<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-2">
									{jsonOutput !== undefined && (
										<div className="rounded-lg border border-zinc-700 bg-zinc-900 p-3">
											<p className="mb-2 text-xs font-medium text-zinc-500">JSON.parse</p>
											<pre className="max-h-48 overflow-auto font-mono text-xs text-zinc-400">
												{JSON.stringify(jsonOutput, null, 2)}
											</pre>
										</div>
									)}
									{cueDeserializeTsOutput !== undefined && (
										<div className="rounded-lg border border-zinc-700 bg-zinc-900 p-3">
											<p className="mb-2 text-xs font-medium text-zinc-500">CUE Deserialize (TS)</p>
											<pre className="max-h-48 overflow-auto font-mono text-xs text-zinc-400">
												{JSON.stringify(cueDeserializeTsOutput, null, 2)}
											</pre>
										</div>
									)}
									{cueFastDeserializeOutput !== undefined && (
										<div className="rounded-lg border border-zinc-700 bg-zinc-900 p-3">
											<p className="mb-2 text-xs font-medium text-zinc-500">CUE Fast Deserialize</p>
											<pre className="max-h-48 overflow-auto font-mono text-xs text-zinc-400">
												{JSON.stringify(cueFastDeserializeOutput, null, 2)}
											</pre>
										</div>
									)}
									{cueDeserializeWasmOutput !== undefined && (
										<div className="rounded-lg border border-zinc-700 bg-zinc-900 p-3">
											<p className="mb-2 text-xs font-medium text-zinc-500">CUE Deserialize (WASM)</p>
											<pre className="max-h-48 overflow-auto font-mono text-xs text-zinc-400">
												{JSON.stringify(cueDeserializeWasmOutput, null, 2)}
											</pre>
										</div>
									)}
									{msgpackOutput !== undefined && (
										<div className="rounded-lg border border-zinc-700 bg-zinc-900 p-3">
											<p className="mb-2 text-xs font-medium text-zinc-500">MsgPack Decoded</p>
											<pre className="max-h-48 overflow-auto font-mono text-xs text-zinc-400">
												{JSON.stringify(msgpackOutput, null, 2)}
											</pre>
										</div>
									)}
								</div>
							</div>
							{/* AST group */}
							{cueParseOutput !== undefined && (
								<div>
									<p className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
										AST Output
									</p>
									<div className="rounded-lg border border-zinc-700 bg-zinc-900 p-3">
										<p className="mb-2 text-xs font-medium text-zinc-500">CUE Parse (AST)</p>
										<pre className="max-h-64 overflow-auto font-mono text-xs text-zinc-400">
											{JSON.stringify(cueParseOutput, null, 2)}
										</pre>
									</div>
								</div>
							)}
						</div>
					)}
				</div>
			)}
		</div>
	);
}
