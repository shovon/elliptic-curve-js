import EllipticCurve, { Point } from "./elliptic-curve";

export const curve = new EllipticCurve(0n, 7n, 17n);

export const n = 18n;

export const generator: Point = { x: 15n, y: 13n };
