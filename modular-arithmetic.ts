export function extendedGcd(
	a: bigint,
	b: bigint
): { result: bigint; x: bigint; y: bigint } {
	if (a === 0n) {
		return { result: b, x: 0n, y: 1n };
	}

	const { result, x: x1, y: y1 } = extendedGcd(b % a, a);

	return { result, x: y1 - (b / a) * x1, y: x1 };
}

export function modulo(a: bigint, m: bigint) {
	return ((a % m) + m) % m;
}

export function fastModularInverse(a: bigint, m: bigint): bigint {
	const { result: g, x } = extendedGcd(a, m);
	if (g != 1n) {
		throw new Error("Inverse does not exist!");
	}

	return modulo(x, m);
}

export function modPow(a: bigint, e: bigint, n: bigint): bigint {
	let accum = 1n;
	let apow2 = a;

	while (e > 0n) {
		if (e & 1n) {
			accum = modulo(accum * apow2, n);
		}
		apow2 = modulo(apow2 * apow2, n);
		e = e >> 1n;
	}

	return accum;
}

export function legendre(a: bigint, p: bigint): bigint {
	return modPow(a, (p - 1n) / 2n, p);
}

export function tonelli(n: bigint, p: bigint): bigint | null {
	if (n === 0n) return 0n;

	let s = 0n;
	let q = p - 1n;

	while (q % 2n === 0n) {
		q = q >> 1n;
		s++;
	}

	if (s === 1n) {
		let r = modPow(n, (p + 1n) / 4n, p);
		if (modulo(r * r, p) === n) return r;
		return null;
	}

	let z = 1n;
	while (modPow(++z, (p - 1n) / 2n, p) !== p - 1n) {}
	let c = modPow(z, q, p);
	let r = modPow(n, (q + 1n) / 2n, p);
	let t = modPow(n, q, p);
	let m = s;
	while (t !== 1n) {
		let tt = t;
		let i = 0n;
		while (tt !== 1n) {
			tt = modulo(tt * tt, p);
			++i;
			if (i === m) return null;
		}
		let b = modPow(c, modPow(2n, m - i - 1n, p - 1n), p);
		let b2 = modulo(b * b, p);
		r = modulo(r * b, p);
		t = modulo(t * b2, p);
		c = b2;
		m = i;
	}

	if (modulo(r * r, p) === n) return r;
	return null;
}

// {
//   const ttest: [bigint, bigint][] = [
//     [10n, 13n],
//     [56n, 101n],
//     [1030n, 10009n],
//     [44402n, 100049n],
//     [665820697n, 1000000009n],
//     [881398088036n, 1000000000039n],
//     [41660815127637347468140745042827704103445750172002n, 10n ** 50n + 577n],
//   ];

//   for (const [n, p] of ttest) {
//     const result = tonelli(n, p);

//     console.log(`n = ${n} p = ${p} \n\t r1 = ${r1} r2 = ${r2}`);
//   }
// }
