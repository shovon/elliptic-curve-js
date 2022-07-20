import { randIntInRange } from "./bigint";
import EllipticCurve, { Point } from "./elliptic-curve";
import { fastModularInverse, modulo } from "./modular-arithmetic";

export function generateKeys(
	curve: EllipticCurve,
	generator: Point
): {
	d: bigint;
	point: Point;
} {
	const d = randIntInRange(curve.p);
	return {
		d,
		point: curve.scalarMultiplyPoint(d, generator),
	};
}

export function sign(
	hash: bigint,
	privateKey: bigint,
	curve: EllipticCurve,
	generator: Point
): { r: bigint; s: bigint } {
	const k = randIntInRange(curve.p);
	const r = curve.scalarMultiplyPoint(k, generator).x;
	const s = modulo(
		fastModularInverse(k, curve.p) * (hash + r * privateKey),
		curve.p
	);

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
	generator: Point
): boolean {
	const s1 = fastModularInverse(signature.s, curve.p);
	const point = curve.addPoint(
		curve.scalarMultiplyPoint(hash * s1, generator),
		curve.scalarMultiplyPoint(signature.r * s1, publicKey)
	);

	return point.x === signature.r;
}
