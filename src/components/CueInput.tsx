import type { Example } from "../benchmark/examples";

interface CueInputProps {
	value: string;
	onChange: (value: string) => void;
	examples: Example[];
	onExampleSelect: (example: Example) => void;
	selectedExampleId?: string;
}

export function CueInput({ value, onChange, examples, onExampleSelect, selectedExampleId }: CueInputProps) {
	return (
		<div className="flex flex-col gap-3">
			<div className="flex items-center justify-between">
				<label htmlFor="cue-input" className="text-sm font-medium text-zinc-400">
					CUE Input
				</label>
				<select
					className="rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-300 outline-none transition-colors focus:border-violet-500"
					onChange={(e) => {
						const example = examples.find((ex) => ex.id === e.target.value);
						if (example) onExampleSelect(example);
					}}
					value={selectedExampleId ?? ""}
				>
					<option value="" disabled>
						Load example...
					</option>
					{examples.map((ex) => (
						<option key={ex.id} value={ex.id}>
							{ex.name}
						</option>
					))}
				</select>
			</div>
			<textarea
				id="cue-input"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				className="h-56 w-full resize-none rounded-lg border border-zinc-700 bg-zinc-900 p-4 font-mono text-sm text-zinc-200 outline-none transition-colors placeholder:text-zinc-600 focus:border-violet-500"
				placeholder="Enter CUE text here..."
				spellCheck={false}
			/>
		</div>
	);
}
