var x1 = 0;
var y1 = 0;

var x2 = 0;
var y2 = 0;

var points = [];

var clipWindow = {};
clipWindow.xL = 50;
clipWindow.xR = 200;
clipWindow.yB = 50;
clipWindow.yT = 200;

var rect;
var myCanvas;

function main() {
  	var canvas = document.getElementById('webgl');
	var gl = getWebGLContext(canvas);
	if (!gl){
		console.log('Failed to find context');
	}
	
	var program = initShaders( gl, "vertex-shader", "fragment-shader" );
	gl.useProgram (program);
	gl.program = program;

	canvas.onmousedown = function(ev) { click(ev, gl, canvas, program, true); };
	canvas.onmouseup = function(ev) { click(ev, gl, canvas, program, false); };
	
	//render(gl, numberOfVertices);
}

function click(ev, gl, canvas, program, isMouseDown) {

	var x = ev.clientX; // x coordinate of a mouse pointer
	var y = ev.clientY; // y coordinate of a mouse pointer

	rect = ev.target.getBoundingClientRect();
	myCanvas = canvas;

	if(isMouseDown)
	{
		//Clear the points
		points = [];

		x1 = x;
		y1 = y;
		//console.log("Down");
	}
	else
	{
		x2 = x;
		y2 = y;
		//console.log("Up");

		console.log("Before:");
		console.log(x1 + ", " + y1);
		console.log(x2 + ", " + y2);

		status = fitLineWithinClipWindow();
		console.log("After:");
		console.log(x1 + ", " + y1);
		console.log(x2 + ", " + y2);

		if(status == "true")
		{
			//Draw the line
			console.log("Drawing");
			calculateLinePoints(gl, program);
		}
		else
		{
			//Draw blank screen
			render(gl, 1);
		}
	}
}

function fitLineWithinClipWindow()
{
	//Calculate code
	var p1 = 0;
	var p2 = 0;

	//For point 1
	if(x1 < clipWindow.xL)
		p1 += 8;
	if(x1 > clipWindow.xR)
		p1 += 4;
	if(y1 < clipWindow.yB)
		p1 += 2;
	if(y1 > clipWindow.yT)
		p1 += 1

	//For point 2
	if(x2 < clipWindow.xL)
		p2 += 8;
	if(x2 > clipWindow.xR)
		p2 += 4;
	if(y2 < clipWindow.yB)
		p2 += 2;
	if(y2 > clipWindow.yT)
		p2 += 1

	//Calculate bitwise and
	var bitwiseAnd = p1 & p2;

	//Totally visible
	if((p1 == 0) && (p2 == 0))
	{
		//Leave it intact
		console.log("Totally Visible");
	}

	//Totally invisible
	else if(bitwiseAnd != 0)
	{
		//Don't draw
		console.log("Totally Invisible");
		return false;
	}
	else
	{
		console.log("Partially Visible");

		var slope = (y2 - y1) / (x2 - x1);

		//Check where the line intersects

		while(true)
		{
			var counter = 0;
			
			//For point 1
			//Intersects at left
			if(x1 < clipWindow.xL)
			{
				var yL = slope * (clipWindow.xL - x1) + y1;
				x1 = clipWindow.xL;
				y1 = yL;
			}

			//Intersects at right
			else if(x1 > clipWindow.xR)
			{
				var yR = slope * (clipWindow.xR - x1) + y1;
				x1 = clipWindow.xR;
				y1 = yR;
			}

			//Intersects at top
			else if(y1 > clipWindow.yT)
			{
				var xT = x1 + (1/slope) * (clipWindow.yT - y1)
				x1 = xT;
				y1 = clipWindow.yT;
			}

			//Intersects at bottom
			else if(y1 < clipWindow.yB)
			{
				var xB = x1 + (1/slope) * (clipWindow.yB - y1)
				x1 = xB;
				y1 = clipWindow.yB;
			}
			else
			{
				counter++;
			}

			//For second point
			//Intersects at left
			if(x2 < clipWindow.xL)
			{
				var yL = slope * (clipWindow.xL - x1) + y1;
				x2 = clipWindow.xL;
				y2 = yL;
			}

			//Intersects at right
			else if(x2 > clipWindow.xR)
			{
				var yR = slope * (clipWindow.xR - x1) + y1;
				x2 = clipWindow.xR;
				y2 = yR;
			}

			//Intersects at top
			else if(y2 > clipWindow.yT)
			{
				var xT = x1 + (1/slope) * (clipWindow.yT - y1)
				x2 = xT;
				y2 = clipWindow.yT;
			}

			//Intersects at bottom
			else if(y2 < clipWindow.yB)
			{
				var xB = x1 + (1/slope) * (clipWindow.yB - y1)
				x2 = xB;
				y2 = clipWindow.yB;
			}
			else
			{
				counter++;
			}

			if(counter == 2)
			{
				break;
			}
		}
	}

	return true;
}

function calculateLinePoints(gl, program)
{
	//Check the side from which the drawing started
	//If line going from bottom to top
	invertedDrawing = false;
	if(y2 < y1)
	{
		//Invert y
		y1 = -y1;
		y2 = -y2;
		invertedDrawing = true;
	}

	//Calculate M
	var m = (y2 - y1) / (x2 - x1);
	console.log(m);

	//Check if number if infinity
	if(m == Infinity)
	{
		var x = x1;
		var y = y1;
		var deltaY = y2 - y1;
		if(deltaY)
		{
			deltaY = -deltaY;
		}

		if(deltaY >= 0)
		{
			//Loop over all the y values i.e. deltaY
			for (i = 0; i < deltaY; i++)
			{
				if(invertedDrawing)
					y = y - 1;
				else
					y = y + 1;

				convertToWebGLCoords(x, y);
			}
		}
		else
		{
			deltaY = -deltaY;
			y = -y;
			//Loop over all the y values i.e. deltaY
			for (i = 0; i < deltaY; i++)
			{
				if(invertedDrawing)
					y = y - 1;
				else
					y = y + 1;

				convertToWebGLCoords(x, y);
			}
		}
	}

	else if(m > 0 && m <= 1)
	{
		var deltaX = x2 - x1;
		var deltaY = y2 - y1;
		var twoDeltaY = 2 * deltaY;
		var diff = twoDeltaY - 2 * deltaX;

		//Calculate the decision factor
		var x = x1;
		var y = y1;
		pk = twoDeltaY - deltaX;

		//Insert the initial point
		convertToWebGLCoords(x, y);

		//Loop over all the x values i.e. deltaX
		for (i = 0; i < deltaX; i++)
		{
			if(pk < 0)
			{
				x = x + 1;
				pk = pk + twoDeltaY;
			}
			else
			{
				x = x + 1;
				y = y + 1;

				pk = pk + diff;
			}

			if(invertedDrawing)
				convertToWebGLCoords(x, -y);
			else
				convertToWebGLCoords(x, y);
		}
	}

	else if(m > 1 && m <= Number.POSITIVE_INFINITY)
	{
		//(x,y) => (y,x)
		//Exchange y and x
		var temp = y1;
		y1 = x1;
		x1 = temp;

		temp = y2;
		y2 = x2;
		x2 = temp;

		var deltaX = x2 - x1;
		var deltaY = y2 - y1;
		var twoDeltaY = 2 * deltaY;
		var diff = twoDeltaY - 2 * deltaX;

		//Calculate the decision factor
		var x = x1;
		var y = y1;
		pk = twoDeltaY - deltaX;

		//Insert the initial point
		convertToWebGLCoords(x, y);

		//Loop over all the x values i.e. deltaX
		for (i = 0; i < deltaX; i++)
		{
			if(pk < 0)
			{
				x = x + 1;
				pk = pk + twoDeltaY;
			}
			else
			{
				x = x + 1;
				y = y + 1;

				pk = pk + diff;
			}

			if(invertedDrawing)
				convertToWebGLCoords(y, -x);
			else
				convertToWebGLCoords(y, x);
		}
	}

	else if(m < -1 && m >= Number.NEGATIVE_INFINITY)
	{
		//(x,y) => (-x,y)
		x1 = -x1;
		x2 = -x2;
		//(x,y) => (y,x)
		//Exchange y and x
		var temp = y1;
		y1 = x1;
		x1 = temp;

		temp = y2;
		y2 = x2;
		x2 = temp;

		var deltaX = x2 - x1;
		var deltaY = y2 - y1;
		var twoDeltaY = 2 * deltaY;
		var diff = twoDeltaY - 2 * deltaX;

		//Calculate the decision factor
		var x = x1;
		var y = y1;
		pk = twoDeltaY - deltaX;

		//Insert the initial point
		convertToWebGLCoords(x, y);

		//Loop over all the x values i.e. deltaX
		for (i = 0; i < deltaX; i++)
		{
			if(pk < 0)
			{
				x = x + 1;
				pk = pk + twoDeltaY;
			}
			else
			{
				x = x + 1;
				y = y + 1;

				pk = pk + diff;
			}

			if(invertedDrawing)
				convertToWebGLCoords(-y, -x);
			else
				convertToWebGLCoords(-y, x);
		}
	}

	else if(m <= 0 && m >= -1)
	{
		//(x,y) => (-x,y)
		x1 = -x1;
		x2 = -x2;

		var deltaX = x2 - x1;
		var deltaY = y2 - y1;
		var twoDeltaY = 2 * deltaY;
		var diff = twoDeltaY - 2 * deltaX;

		//Calculate the decision factor
		var x = x1;
		var y = y1;
		pk = twoDeltaY - deltaX;

		//Insert the initial point
		convertToWebGLCoords(x, y);

		//Loop over all the x values i.e. deltaX
		for (i = 0; i < deltaX; i++)
		{
			if(pk < 0)
			{
				x = x + 1;
				pk = pk + twoDeltaY;
			}
			else
			{
				x = x + 1;
				y = y + 1;

				pk = pk + diff;
			}

			if(invertedDrawing)
				convertToWebGLCoords(-x, -y);
			else
				convertToWebGLCoords(-x, y);
		}
	}

	var numberOfPoints = initVertices(program, gl);
	render(gl, numberOfPoints);
}

function convertToWebGLCoords(x, y)
{
	var x = ((x - rect.left) - myCanvas.height/2)/(myCanvas.height/2);
	var y = (myCanvas.width/2 - (y - rect.top))/(myCanvas.width/2);

	//Insert the point
	points.push(x);
	points.push(y);
}

function render (gl, numberOfPoints){
	gl.clearColor(1.0, 1.0, 1.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.drawArrays(gl.POINTS, 0, numberOfPoints);
}

function initVertices(program, gl) {
	//console.log(points);
	var noOfDim = 2;
	var numberOfPoints = points.length / noOfDim;
	
	var vertexBuffer = gl.createBuffer();
	if (!vertexBuffer){ console.log('Failed to create the buffer object ');	return -1;}
	
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
	
	var a_Position = gl.getAttribLocation(program, 'a_Position');
	if (a_Position < 0) { console.log ("Failed to Get Position"); return;	}
	
	gl.vertexAttribPointer(a_Position, noOfDim, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(a_Position);
	
	return numberOfPoints;
}

