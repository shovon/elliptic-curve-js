import { fastModularInverse, modulo, tonelli } from "./modular-arithmetic";

export type Point = {
	x: bigint;
	y: bigint;
};

/**
 * Creates an elliptic curve
 */
export default class EllipticCurve {
	private _a: bigint;
	private _b: bigint;
	private _p: bigint;

	constructor(a: bigint, b: bigint, p: bigint) {
		this._a = a;
		this._b = b;
		this._p = p;
	}

	static pointEquals(a: Point, b: Point) {
		return a.x === b.x && a.y === b.y;
	}

	isInCurve(point: Point): boolean {
		const result = tonelli(
			point.x ** 3n + this._a * point.x + this._b,
			this._p
		);
		if (!result) {
			return false;
		}

		const [r1, r2] = result;
		return r1 === point.y || r2 === point.y;
	}

	addPoint(a: Point, b: Point): Point {
		if (!this.isInCurve(a)) {
			return b;
		}

		if (!this.isInCurve(b)) {
			return a;
		}

		if (!EllipticCurve.pointEquals(a, b)) {
			const delta = (b.y - a.y) * fastModularInverse(b.x - a.x, this._p);
			const x = modulo(delta * delta - a.x - b.x, this._p);
			const y = modulo(delta * (a.x - x) - a.y, this._p);
			return {
				x,
				y,
			};
		}

		const factor =
			(3n * a.x * a.x + this._a) * fastModularInverse(2n * a.y, this._p);

		const x = factor * factor - 2n * a.x;
		const y = factor * (a.x - x) - a.y;

		return {
			x: modulo(x, this._p),
			y: modulo(y, this._p),
		};
	}

	negatePoint(a: Point): Point {
		return { x: modulo(a.x, this._p), y: modulo(-a.y, this._p) };
	}

	subtractPoint(a: Point, b: Point): Point {
		return this.addPoint(a, this.negatePoint(b));
	}

	scalarMultiplyPoint(count: bigint, point: Point): Point {
		let r0: Point = { x: 0n, y: 1n };
		let r1: Point = point;

		const binary = count.toString(2);
		let index = binary.length;
		while (index >= 0) {
			if (binary[index] === "1") {
				r0 = this.addPoint(r0, r1);
				r1 = this.addPoint(r1, r1);
			} else {
				r1 = this.addPoint(r0, r1);
				r0 = this.addPoint(r0, r0);
			}
			index--;
		}

		return r0;
	}

	get a(): bigint {
		return this._a;
	}

	get b(): bigint {
		return this._b;
	}

	get p(): bigint {
		return this._p;
	}
}
