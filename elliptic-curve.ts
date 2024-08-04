import {
	fastModularInverse,
	modPow,
	modulo,
	tonelli,
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

	addPoint(a: Point | null, b: Point | null): Point | null {
		// TODO: something not being a curve should yield an error, not return null.
		//   null is the point at infinity; anything else is a failure.

		if (a === null || !this.isInCurve(a)) {
			return b;
		}

		if (b === null || !this.isInCurve(b)) {
			return a;
		}

		let delta: bigint;

		if (!EllipticCurve.pointEquals(a, b)) {
			if (b.x - a.x === 0n) {
				return null;
			}
			delta = modulo(
				modulo(b.y - a.y, this._p) *
					fastModularInverse(modulo(b.x - a.x, this._p), this._p),
				this._p
			);
		} else {
			if (a.y === 0n) {
				return null;
			}
			delta = modulo(
				(3n * a.x * a.x + this._a) *
					fastModularInverse(modulo(2n * a.y, this._p), this._p),
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

	negatePoint(a: Point | null): Point | null {
		if (!a) return a;
		return { x: modulo(a.x, this._p), y: modulo(-a.y, this._p) };
	}

	subtractPoint(a: Point | null, b: Point | null): Point | null {
		return this.addPoint(a, this.negatePoint(b));
	}

	scalarMultiplyPoint(count: bigint, point: Point | null): Point | null {
		let r0: typeof point = null;
		let r1 = point;
		const bits = count.toString(2).split("").reverse();
		for (let i = bits.length - 1; i >= 0; i--) {
			if (bits[i] === "1") {
				r0 = this.addPoint(r0, r1);
				r1 = this.addPoint(r1, r1);
			} else {
				r1 = this.addPoint(r0, r1);
				r0 = this.addPoint(r0, r0);
			}
		}

		return r0;
	}

	findY(x: bigint): [bigint, bigint] | null {
		const rhsPositive = tonelli(
			modulo(
				modPow(x, 3n, this._p) + modulo(this._a * x, this._p) + this._b,
				this._p
			),
			this._p
		);
		if (rhsPositive === null) return null;
		return [rhsPositive, modulo(-rhsPositive, this._p)];
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
