import { generateKeys, sign, verify } from "./ecdsa";
import * as secp256r1 from "./secp256r1";
import { webcrypto as crypto } from "crypto";
import * as bigintconversion from "bigint-conversion";

const { d: privateKey, point: publicKey } = generateKeys(
	secp256r1.curve,
	secp256r1.generator
);

console.log(publicKey);

let v = new Uint8Array(256 / 8);
v = crypto.getRandomValues(v);

const signature = sign(
	bigintconversion.bufToBigint(v),
	privateKey,
	secp256r1.curve,
	secp256r1.generator
);

console.log(
	verify(
		bigintconversion.bufToBigint(v),
		publicKey,
		signature,
		secp256r1.curve,
		secp256r1.generator
	)
);
