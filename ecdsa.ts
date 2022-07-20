import { randIntInRange } from "./bigint";
import EllipticCurve, { Point } from "./elliptic-curve";
import { fastModularInverse, modulo } from "./modular-arithmetic";

export function generateKeys(
	curve: EllipticCurve,
	generator: Point,
	n: bigint
): {
	d: bigint;
	point: Point;
} {
	const d = randIntInRange(n);
	return {
		d,
		point: curve.scalarMultiplyPoint(d, generator),
	};
}

export function sign(
	hash: bigint,
	privateKey: bigint,
	curve: EllipticCurve,
	generator: Point,
	n: bigint
): { r: bigint; s: bigint } {
	const k = randIntInRange(n);
	const r = curve.scalarMultiplyPoint(k, generator).x;
	const s = modulo(fastModularInverse(k, n) * (hash + r * privateKey), n);

	return { r, s };
}

export function verify(
	hash: bigint,
	publicKey: Point,
	signature: {
		r: bigint;
		s: bigint;
	},
	curve: EllipticCurve,
	generator: Point,
	n: bigint
): boolean {
	const s1 = fastModularInverse(signature.s, n);
	const point = curve.addPoint(
		curve.scalarMultiplyPoint(hash * s1, generator),
		curve.scalarMultiplyPoint(signature.r * s1, publicKey)
	);

	return point.x === signature.r;
}
