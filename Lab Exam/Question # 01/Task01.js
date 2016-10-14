
function calculateNormal(pixelValues)
{
	//For 1st vertex

	//Dense to less dense material
	var gx = pixelValues[3] - pixelValues[4];
	var gy = pixelValues[6] - pixelValues[1];

	console.log("( " + gx + ", " + gy + " )");
}

function main() {
	/*
		0 1 2
		3 * 4
		5 6 7
	*/
	pixelValues = [5,3,20,7,9,4,10,6];

	calculateNormal(pixelValues);
}