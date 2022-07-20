import { generateKeys, sign, verify } from "./ecdsa";
import * as secp256r1 from "./secp256r1";
import { createHash, webcrypto as crypto } from "crypto";
import * as bigintconversion from "bigint-conversion";
import { concatUint8Array } from "./buffer";

const { d: privateKey, point: publicKey } = generateKeys(
	secp256r1.curve,
	secp256r1.generator,
	secp256r1.n
);

console.log("a");
console.log(secp256r1.curve.a);

console.log("b");
console.log(secp256r1.curve.b);

console.log("n");
console.log(secp256r1.curve.p);

console.log("generator");
console.log(secp256r1.generator.x.toString(10));
console.log(secp256r1.generator.y.toString(10));
console.log("");

console.log(privateKey.toString(10));
console.log(
	"04" +
		bigintconversion.bigintToHex(publicKey.x) +
		bigintconversion.bigintToHex(publicKey.y)
);

console.log(publicKey.x.toString(10));
console.log(publicKey.y.toString(10));

console.log(secp256r1.generator.x.toString(10));
console.log(secp256r1.generator.y.toString(10));

function str2ab(str: string) {
	var array = new Uint8Array(str.length);
	for (var i = 0; i < str.length; i++) {
		array[i] = str.charCodeAt(i);
	}
	return array.buffer;
}

let v = str2ab("Hello, World!");

const vHash = createHash("sha256").update(Buffer.from(v)).digest().buffer;

const signature = sign(
	bigintconversion.bufToBigint(vHash),
	privateKey,
	secp256r1.curve,
	secp256r1.generator,
	secp256r1.n
);

console.log(
	bigintconversion.bigintToHex(signature.r) +
		bigintconversion.bigintToHex(signature.s)
);

console.log(
	verify(
		bigintconversion.bufToBigint(vHash),
		publicKey,
		signature,
		secp256r1.curve,
		secp256r1.generator,
		secp256r1.n
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
	console.log(jwkPublicKey);
	console.log(jwkPrivateKey);
	const webCryptoKeyPair = await crypto.subtle.generateKey(
		{
			name: "ECDSA",
			namedCurve: "P-256",
		},
		true,
		["sign", "verify"]
	);
	const generatedJwkPublicKey = await crypto.subtle.exportKey(
		"jwk",
		webCryptoKeyPair.publicKey
	);
	const generatedJwkPrivateKey = await crypto.subtle.exportKey(
		"jwk",
		webCryptoKeyPair.privateKey
	);
	console.log(generatedJwkPublicKey);
	console.log(generatedJwkPrivateKey);
	const webCryptoImportedPrivateKey = await crypto.subtle.importKey(
		"jwk",
		jwkPrivateKey,
		{
			name: "ECDSA",
			namedCurve: "P-256",
		},
		false,
		["sign"]
	);
	const webCryptoImportedPublicKey = await crypto.subtle.importKey(
		"jwk",
		jwkPublicKey,
		{
			name: "ECDSA",
			namedCurve: "P-256",
		},
		true,
		["verify"]
	);
	const webCryptoSignatureCustom = await crypto.subtle.sign(
		{
			name: "ECDSA",
			hash: { name: "SHA-256" },
		},
		webCryptoImportedPrivateKey,
		v
	);
	const webCryptoSignature = await crypto.subtle.sign(
		{
			name: "ECDSA",
			hash: { name: "SHA-256" },
		},
		webCryptoKeyPair.privateKey,
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
			webCryptoImportedPublicKey,
			signatureBuf,
			v
		)
	);
	console.log(
		await crypto.subtle.verify(
			{ name: "ECDSA", hash: { name: "SHA-256" } },
			webCryptoImportedPublicKey,
			webCryptoSignatureCustom,
			v
		)
	);
	console.log(
		await crypto.subtle.verify(
			{ name: "ECDSA", hash: { name: "SHA-256" } },
			webCryptoKeyPair.publicKey,
			webCryptoSignature,
			v
		)
	);
}

start().catch((e) => {
	console.error(e);
	process.exit(1);
});
