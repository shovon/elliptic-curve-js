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

export function fastModularInverse(a: bigint, m: bigint): bigint {
	const { result: g, x } = extendedGcd(a, m);
	if (g != 1n) {
		throw new Error("Inverse does not exist!");
	}

	return ((x % m) + m) % m;
}

export function modulo(a: bigint, m: bigint) {
	return ((a % m) + m) % m;
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

export function tonelli(n: bigint, p: bigint): [bigint, bigint] | null {
	const modPowP = (n: bigint, e: bigint) => modPow(n, e, p);
	const legendreP = (n: bigint) => legendre(n, p);

	if (legendreP(n) !== 1n) {
		return null;
	}

	let q = p - 1n;
	let s = 0n;

	while (modulo(q, 2n) === 0n) {
		s = s + 1n;
		q = q >> 1n;
	}

	if (s === 1n) {
		const r1 = modPowP(n, (p + 1n) / 4n);
		return [r1, p - r1];
	}

	let z = 2n;
	while (legendreP(z) !== p - 1n) {
		z = z + 1n;
	}

	let c = modPowP(z, q);
	let r = modPowP(n, (q + 1n) / 2n);
	let t = modPowP(n, q);
	let m = s;

	while (true) {
		if (t === 1n) {
			return [r, p - r];
		}
		let i = 0n;
		let zz = t;
		while (zz != 1n && i < m - 1n) {
			zz = modulo(zz * zz, p);
			i = i + 1n;
		}
		let b = c;
		let e = m - i - 1n;
		while (e > 0n) {
			b = modulo(b * b, p);
			e = e - 1n;
		}
		r = modulo(r * b, p);
		c = modulo(b * b, p);
		t = modulo(t * c, p);
		m = i;
	}
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
