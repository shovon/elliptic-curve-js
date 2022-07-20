import EllipticCurve, { Point } from "./elliptic-curve";

export const curve = new EllipticCurve(
	0xffffffff00000001000000000000000000000000fffffffffffffffffffffffcn,
	0x5ac635d8aa3a93e7b3ebbd55769886bc651d06b0cc53b0f63bce3c3e27d2604bn,
	// 0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551n,
	0xffffffff00000001000000000000000000000000ffffffffffffffffffffffffn
);

export const generator: Point = {
	x: 0x6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296n,
	y: 0x4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5n,
};
