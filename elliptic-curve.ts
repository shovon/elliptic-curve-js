import { fastModularInverse, modulo } from "./modular-arithmetic";

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

  addPoint(a: Point, b: Point): Point {
    if (!EllipticCurve.pointEquals(a, b)) {
      const delta = (b.y - a.y) * fastModularInverse(b.x - a.x, this._p);
      const x = modulo(delta * delta - a.x - b.x, this._p);
      const y = modulo(delta * (a.x - x) - a.y, this._p);
      return {
        x,
        y,
      };
    }

    return { x: 0n, y: 0n };
  }

  negatePoint(a: Point): Point {
    return { x: modulo(a.x, this._p), y: modulo(a.y, this._p) };
  }

  subtractPoint(a: Point, b: Point): Point {
    return this.addPoint(a, this.negatePoint(b));
  }

  scalarMultiplyPoint(count: bigint, point: Point): Point {}

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
