var x1 = 0;
var y1 = 0;

var r = 0;

var displacementX = 0;
var displacementY = 0;

points = [];

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
		// x1 = 0;
		// y1 = 0;
		console.log("Down");
	}
	else
	{
		r = Math.sqrt(Math.pow(x - x1, 2.0) + Math.pow(y - y1, 2.0));
		console.log("Radius: " + r);

		var oneSideWidth = myCanvas.width / 2;
		displacementX = (x1 - oneSideWidth) / (oneSideWidth);

		var oneSideHeight = myCanvas.height / 2;
		displacementY = (y1 - oneSideHeight) / (oneSideHeight);

		calculateCirclePoints(gl, program);
	}
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

function calculateCirclePoints(gl, program)
{
	//Draw mid point
	//convertToWebGLCoords(x1, y1);

	//Draw top point
	var x = 0;
	var y = r;
	convertToWebGLCoords(x, y);

	var pk = 5/4 - r;

	while(y >= x)
	{
		if(pk < 0)
		{
			x = x + 1;
			convertToWebGLCoords(x, y);

			pk = pk + 2 * x + 1;
		}
		else
		{
			x = x + 1;
			y = y - 1;
			convertToWebGLCoords(x, y);

			pk = pk + 2 * x + 1 - 2 * (y + 2);
		}
	}

	var numberOfPoints = initVertices(program, gl);
	render(gl, numberOfPoints);
}

function convertToWebGLCoords(x, y)
{
	var x = ((x - rect.left) - myCanvas.height/2)/(myCanvas.height/2);
	var y = (myCanvas.width/2 - (y - rect.top))/(myCanvas.width/2);

	//translate to mid point
	x = x + 1.05;
	y = y - 1.05;

	//Insert the point
	points.push(x);
	points.push(y);

	//Add all reflections
	points.push(-x);
	points.push(y);

	points.push(x);
	points.push(-y);

	points.push(-x);
	points.push(-y);

	points.push(y);
	points.push(x);

	points.push(-y);
	points.push(x);

	points.push(y);
	points.push(-x);

	points.push(-y);
	points.push(-x);
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

