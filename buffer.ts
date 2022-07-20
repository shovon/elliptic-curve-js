export function concatUint8Array(a: Uint8Array, b: Uint8Array): Uint8Array {
	const merged = new Uint8Array(a.length + b.length);
	merged.set(a);
	merged.set(b, a.length);
	return merged;
}
