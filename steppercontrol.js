function calcSteps (orPos, nextPos) {
	var degrees = nextPos - orPos;
	var steps = map(degrees);
	return steps;

	//negative step value = ccw
}

function map(x) {
	console.log(x);
	  return x  * (2038 / 360);
}

exports.map = map;
exports.calcSteps = calcSteps;