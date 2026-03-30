import { decode, encode } from "@msgpack/msgpack";

export function encodeMsgpack(data: unknown): Uint8Array {
	return encode(data);
}

export function decodeMsgpack(packed: Uint8Array): unknown {
	return decode(packed);
}
