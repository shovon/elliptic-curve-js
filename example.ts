import { generateKeys, sign, verify } from "./ecdsa";
import * as secp256r1 from "./secp256r1";
import { createHash, webcrypto as crypto } from "crypto";
import * as bigintconversion from "bigint-conversion";
import { concatUint8Array } from "./buffer";

const { d: privateKey, point: publicKey } = generateKeys(
	secp256r1.curve,
	secp256r1.generator
);

console.log(publicKey);

let v = new Uint8Array(256 / 8);
v = crypto.getRandomValues(v);

const vHash = createHash("sha256").update(v).digest().buffer;

const signature = sign(
	bigintconversion.bufToBigint(vHash),
	privateKey,
	secp256r1.curve,
	secp256r1.generator
);

console.log(
	verify(
		bigintconversion.bufToBigint(vHash),
		publicKey,
		signature,
		secp256r1.curve,
		secp256r1.generator
	)
);

console.log(bigintconversion.bigintToBuf(publicKey.x).byteLength);
console.log(bigintconversion.bigintToBuf(publicKey.y).byteLength);

const jwkPublicKey = {
	crv: "P-256",
	kty: "EC",
	x: Buffer.from(bigintconversion.bigintToBuf(publicKey.x)).toString("base64"),
	y: Buffer.from(bigintconversion.bigintToBuf(publicKey.y)).toString("base64"),
};

console.log(jwkPublicKey.x.length);
console.log(jwkPublicKey.y.length);

const jwkPrivateKey = {
	crv: "P-256",
	kty: "EC",
	d: Buffer.from(bigintconversion.bigintToBuf(privateKey)).toString("base64"),
	x: jwkPublicKey.x,
	y: jwkPublicKey.y,
};

async function start() {
	const webCryptoPrivateKey = await crypto.subtle.importKey(
		"jwk",
		jwkPrivateKey,
		{
			name: "ECDSA",
			namedCurve: "P-256",
		},
		false,
		["sign"]
	);

	const webCryptoPublicKey = await crypto.subtle.importKey(
		"jwk",
		jwkPublicKey,
		{
			name: "ECDSA",
			namedCurve: "P-256",
		},
		true,
		["verify"]
	);

	const webCryptoSignature = await crypto.subtle.sign(
		{
			name: "ECDSA",
			hash: { name: "SHA-256" },
		},
		webCryptoPrivateKey,
		v
	);

	const signatureBuf = concatUint8Array(
		new Uint8Array(bigintconversion.bigintToBuf(signature.r)),
		new Uint8Array(bigintconversion.bigintToBuf(signature.s))
	);

	console.log(
		signatureBuf.byteLength,
		Buffer.from(signatureBuf).toString("base64")
	);

	console.log(
		await crypto.subtle.verify(
			{
				name: "ECDSA",
				hash: { name: "SHA-256" },
			},
			webCryptoPublicKey,
			signatureBuf,
			v
		)
	);

	console.log(
		await crypto.subtle.verify(
			{ name: "ECDSA", hash: { name: "SHA-256" } },
			webCryptoPublicKey,
			webCryptoSignature,
			v
		)
	);
}

start().catch((e) => {
	console.error(e);
	process.exit(1);
});
