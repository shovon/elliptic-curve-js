import * as bigintConversion from "bigint-conversion";
import { webcrypto as crypto } from "node:crypto";
import { concatUint8Array } from "./buffer";

export function randIntInRange(range: bigint): bigint {
	const buf = bigintConversion.bigintToBuf(range, true) as ArrayBuffer;
	const u8a = new Uint8Array(buf).slice(1);
	const randVal = crypto.getRandomValues(u8a);
	if (!u8a[0]) {
		throw new Error("A fatal error occurred");
	}
	return bigintConversion.bufToBigint(
		concatUint8Array(
			new Uint8Array([(Math.random() * (u8a[0] - 0b10000000)) | 0]),
			randVal
		)
	);
}
