
function biLinearInterpolation(vertices, colors, point)
{
	//Interpolate between top two vertices
	point1 = [];
	color1 = colors[0];
	color2 = colors[1];

	for(var i = 0; i < 3; i+=1)
	{
		var temp = ((point[0] - vertices[0][0]) / (vertices[1][0] - vertices[0][0])) * (color2[i] - color1[i]) + color1[i];
		point1.push(temp);
	}
	console.log(point1);

	//Interpolate between bottom two vertices
	point2 = [];
	color1 = colors[2];
	color2 = colors[3];

	for(var i = 0; i < 3; i+=1)
	{
		var temp = ((point[0] - vertices[2][0]) / (vertices[3][0] - vertices[2][0])) * (color2[i] - color1[i]) + color1[i];
		point2.push(temp);
	}
	console.log(point2);

	//Interpolate between the two previously interpolated points
	point3 = [];
	color1 = point1;
	color2 = point2;

	for(var i = 0; i < 3; i+=1)
	{
		var temp = ((point[1] - vertices[0][1]) / (vertices[3][1] - vertices[0][1])) * (color2[i] - color1[i]) + color1[i];
		point3.push(temp);
	}

	console.log(point3);
}

function main() {
	/*
	vertices = [
				[-0.5, 0.5], [0.5, 0.5], [-0.5, -0.5], [0.5, -0.5]
			   ];

	colors = [
			  [1,0,0], [0,1,0], [0,0,1], [1,1,1]
			 ];

	point = [];
	point[0] = 0.5;
	point[1] = 0.5;
	*/

	vertices = [
				[14,20], [15,20], [14,21], [15,21]
			   ];

	colors = [
			  [91,0,0], [210,0,0], [162,0,0], [95,0,0]
			 ];

	point = [];
	point[0] = 14.5;
	point[1] = 20.2;

	biLinearInterpolation(vertices, colors, point);
}