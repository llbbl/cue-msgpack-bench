/**
 * Format microseconds into a human-readable string.
 * Displays as μs, ms, or s depending on magnitude.
 */
export function formatMicroseconds(us: number): string {
	if (us < 1000) {
		return `${us.toFixed(1)} μs`;
	}
	if (us < 1_000_000) {
		return `${(us / 1000).toFixed(2)} ms`;
	}
	return `${(us / 1_000_000).toFixed(3)} s`;
}

/**
 * Format bytes into a human-readable string.
 * Displays as B, KB, or MB depending on magnitude.
 */
export function formatBytes(bytes: number): string {
	if (bytes < 1024) {
		return `${bytes} B`;
	}
	if (bytes < 1024 * 1024) {
		return `${(bytes / 1024).toFixed(1)} KB`;
	}
	return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Format a ratio between two numbers as a "Nx faster" style string.
 * Returns the ratio of the larger to the smaller value.
 */
export function formatRatio(a: number, b: number): string {
	if (a === 0 && b === 0) return "~equivalent";
	if (a === 0) return "∞x";
	if (b === 0) return "∞x";
	const ratio = a > b ? a / b : b / a;
	return `${ratio.toFixed(1)}x`;
}
