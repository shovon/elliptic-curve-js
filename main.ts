import { curve, generator } from "./toy";

// for (let i = 0n; i < curve.p; i++) {
// 	const yCoordinates = curve.findY(i);
// 	if (yCoordinates) {
// 		console.log([i, yCoordinates[0]]);
// 		if (yCoordinates[0] !== 0n) {
// 			console.log([i, yCoordinates[1]]);
// 		}
// 	} else {
// 		console.log(`None for x = ${i}`);
// 	}
// }

for (let i = 1n; i < 19n; i++) {
	console.log(i, curve.scalarMultiplyPoint(i, generator));
}

// console.log(curve.scalarMultiplyPoint(17n, generator));
// console.log(curve.scalarMultiplyPoint(2n, { x: 3n, y: 0n }));
