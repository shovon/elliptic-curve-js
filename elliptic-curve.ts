import {
	fastModularInverse,
	modPow,
	modulo,
	// tonelli,
} from "./modular-arithmetic";

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
		const lhs = modPow(point.y, 2n, this._p);
		const rhs = modPow(point.x, 3n, this._p) + this._a * point.x + this._b;

		return modulo(lhs, this._p) === modulo(rhs, this._p);
	}

	addPoint(a: Point, b: Point): Point {
		if (!this.isInCurve(a)) {
			return b;
		}

		if (!this.isInCurve(b)) {
			return a;
		}

		let delta: bigint;

		if (!EllipticCurve.pointEquals(a, b)) {
			delta = modulo(
				modulo(b.y - a.y, this._p) *
					fastModularInverse(modulo(b.x - a.x, this._p), this._p),
				this._p
			);
		} else {
			delta = modulo(
				(3n * a.x * a.x + this._a) * fastModularInverse(2n * a.y, this._p),
				this._p
			);
		}

		const x = modulo(delta * delta - a.x - b.x, this._p);
		const y = modulo(delta * (a.x - x) - a.y, this._p);

		return {
			x,
			y,
		};
	}

	negatePoint(a: Point): Point {
		return { x: modulo(a.x, this._p), y: modulo(-a.y, this._p) };
	}

	subtractPoint(a: Point, b: Point): Point {
		return this.addPoint(a, this.negatePoint(b));
	}

	scalarMultiplyPoint(count: bigint, point: Point): Point {
		const bits = count.toString(2).split("").reverse();

		let result = { x: 0n, y: 1n };
		let temp = point;

		if (!this.isInCurve(temp)) {
			throw new Error("Should be in curve!");
		}

		for (const bit of bits) {
			if (bit === "1") {
				result = this.addPoint(result, temp);
			}
			temp = this.addPoint(temp, temp);
		}

		return result;
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
