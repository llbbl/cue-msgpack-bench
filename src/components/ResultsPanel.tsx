import { useState } from "react";
import type { BenchmarkResult } from "../benchmark/runner";
import { formatBytes, formatMicroseconds, formatRatio } from "../lib/format";

interface ResultsPanelProps {
	jsonResult?: BenchmarkResult;
	cueResult?: BenchmarkResult;
	msgpackResult?: BenchmarkResult;
	jsonOutput?: unknown;
	cueOutput?: unknown;
	msgpackOutput?: unknown;
}

function StatRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
	return (
		<div className="flex justify-between py-1">
			<span className="text-zinc-500">{label}</span>
			<span className={highlight ? "font-semibold text-white" : "text-zinc-300"}>{value}</span>
		</div>
	);
}

type RankStatus = "fastest" | "middle" | "slowest";

function ResultCard({
	title,
	result,
	status,
}: { title: string; result: BenchmarkResult; status: RankStatus }) {
	const borderColor =
		status === "fastest"
			? "border-green-500/50"
			: status === "middle"
				? "border-yellow-500/30"
				: "border-red-500/30";
	const badge =
		status === "fastest" ? (
			<span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-medium text-green-400">
				Fastest
			</span>
		) : status === "middle" ? (
			<span className="rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs font-medium text-yellow-400">
				Middle
			</span>
		) : (
			<span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-medium text-red-400">
				Slowest
			</span>
		);

	return (
		<div className={`rounded-lg border ${borderColor} bg-zinc-900 p-4`}>
			<div className="mb-3 flex items-center justify-between">
				<h3 className="text-sm font-semibold text-zinc-200">{title}</h3>
				{badge}
			</div>
			<div className="space-y-0.5 text-sm">
				<StatRow label="Median" value={formatMicroseconds(result.median)} highlight />
				<StatRow label="Mean" value={formatMicroseconds(result.mean)} />
				<StatRow label="Min" value={formatMicroseconds(result.min)} />
				<StatRow label="Max" value={formatMicroseconds(result.max)} />
				<StatRow label="Payload" value={formatBytes(result.payloadBytes)} />
				<StatRow label="Iterations" value={result.iterations.toLocaleString()} />
			</div>
		</div>
	);
}

function rankResults(
	jsonMedian: number,
	cueMedian: number,
	msgpackMedian: number,
): { json: RankStatus; cue: RankStatus; msgpack: RankStatus } {
	const entries: { key: "json" | "cue" | "msgpack"; median: number }[] = [
		{ key: "json", median: jsonMedian },
		{ key: "cue", median: cueMedian },
		{ key: "msgpack", median: msgpackMedian },
	];
	entries.sort((a, b) => a.median - b.median);

	const result: Record<string, RankStatus> = {};
	result[entries[0].key] = "fastest";
	result[entries[1].key] = "middle";
	result[entries[2].key] = "slowest";

	return result as { json: RankStatus; cue: RankStatus; msgpack: RankStatus };
}

export function ResultsPanel({
	jsonResult,
	cueResult,
	msgpackResult,
	jsonOutput,
	cueOutput,
	msgpackOutput,
}: ResultsPanelProps) {
	const [showOutput, setShowOutput] = useState(false);

	if (!jsonResult || !cueResult || !msgpackResult) {
		return (
			<div className="flex h-full items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/50 p-8">
				<p className="text-sm text-zinc-600">Run a benchmark to see results</p>
			</div>
		);
	}

	const ranks = rankResults(jsonResult.median, cueResult.median, msgpackResult.median);

	// Use mean as fallback when medians are both 0
	const cueMedian = cueResult.median || cueResult.mean;
	const jsonMedianFallback = jsonResult.median || jsonResult.mean;
	const msgpackMedian = msgpackResult.median || msgpackResult.mean;

	const cueVsJson = formatRatio(cueMedian, jsonMedianFallback);
	const msgpackVsJson = formatRatio(msgpackMedian, jsonMedianFallback);
	const cueVsMsgpack = formatRatio(cueMedian, msgpackMedian);

	const cueSlowerThanJson = cueMedian > jsonMedianFallback;
	const msgpackSlowerThanJson = msgpackMedian > jsonMedianFallback;

	return (
		<div className="flex flex-col gap-4">
			{/* Speed comparison summary */}
			<div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4 text-center space-y-1">
				<p className="text-sm text-zinc-400">
					<span className="font-semibold text-white">CUE parse</span> is{" "}
					<span className={`font-semibold ${cueSlowerThanJson ? "text-red-400" : "text-green-400"}`}>
						{cueVsJson}
					</span>{" "}
					{cueSlowerThanJson ? "slower" : "faster"} than JSON.parse
				</p>
				<p className="text-sm text-zinc-400">
					<span className="font-semibold text-white">MsgPack decode</span> is{" "}
					<span className={`font-semibold ${msgpackSlowerThanJson ? "text-red-400" : "text-green-400"}`}>
						{msgpackVsJson}
					</span>{" "}
					{msgpackSlowerThanJson ? "slower" : "faster"} than JSON.parse
				</p>
				<p className="text-sm text-zinc-400">
					<span className="font-semibold text-white">CUE</span> vs{" "}
					<span className="font-semibold text-white">MsgPack</span>:{" "}
					<span className="font-semibold text-violet-400">{cueVsMsgpack}</span> difference
				</p>
			</div>

			{/* Side-by-side results */}
			<div className="grid grid-cols-3 gap-3">
				<ResultCard title="JSON.parse" result={jsonResult} status={ranks.json} />
				<ResultCard title="CUE Parse" result={cueResult} status={ranks.cue} />
				<ResultCard title="MsgPack Decode" result={msgpackResult} status={ranks.msgpack} />
			</div>

			{/* Collapsible parsed output */}
			{(jsonOutput !== undefined || cueOutput !== undefined || msgpackOutput !== undefined) && (
				<div>
					<button
						type="button"
						onClick={() => setShowOutput(!showOutput)}
						className="mb-2 text-sm text-zinc-500 transition-colors hover:text-zinc-300"
					>
						{showOutput ? "Hide" : "Show"} parsed output
					</button>
					{showOutput && (
						<div className="grid grid-cols-3 gap-3">
							<div className="rounded-lg border border-zinc-700 bg-zinc-900 p-3">
								<p className="mb-2 text-xs font-medium text-zinc-500">JSON Parsed</p>
								<pre className="max-h-64 overflow-auto font-mono text-xs text-zinc-400">
									{JSON.stringify(jsonOutput, null, 2)}
								</pre>
							</div>
							<div className="rounded-lg border border-zinc-700 bg-zinc-900 p-3">
								<p className="mb-2 text-xs font-medium text-zinc-500">CUE AST</p>
								<pre className="max-h-64 overflow-auto font-mono text-xs text-zinc-400">
									{JSON.stringify(cueOutput, null, 2)}
								</pre>
							</div>
							<div className="rounded-lg border border-zinc-700 bg-zinc-900 p-3">
								<p className="mb-2 text-xs font-medium text-zinc-500">MsgPack Decoded</p>
								<pre className="max-h-64 overflow-auto font-mono text-xs text-zinc-400">
									{JSON.stringify(msgpackOutput, null, 2)}
								</pre>
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
