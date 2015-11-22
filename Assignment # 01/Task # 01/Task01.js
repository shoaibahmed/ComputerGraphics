function main() 
{
  	var canvas = document.getElementById('webgl');
	var gl = getWebGLContext(canvas);
	if (!gl){
		console.log('Failed to find context');
	}

	color = [0, 0, 0, 1];
	tapCoordinates = [];
	tapObjectType = [];
	tapColors = [];
	tapSize = [];
	
	var program = initShaders( gl, "vertex-shader", "fragment-shader" );
	gl.useProgram (program);
	gl.program = program;

	var params = { Color: [0, 0, 0, 255], Triangle: true, Square: false, Pentagon: false, Size: 1.0 };
    var gui = new dat.GUI();

	gui.addColor(params, 'Color').onChange(function()
		{
			color = params.Color.map(function(v) {
				return v / 255;
			});
		});

	gui.add(params, 'Size', 1.0, 10.0);

	gui.add(params, 'Triangle').listen().onChange(function(value)
	{
		params.Triangle = true;
		params.Square = false;
		params.Pentagon = false;
	})

	gui.add(params, 'Square').listen().onChange(function(value)
	{
		params.Triangle = false;
		params.Square = true;
		params.Pentagon = false;
	})

	gui.add(params, 'Pentagon').listen().onChange(function(value)
	{
		params.Triangle = false;
		params.Square = false;
		params.Pentagon = true;
	})

	canvas.onmousedown = function(ev) { click(ev, gl, canvas, program, params, tapCoordinates, tapColors, tapSize, tapObjectType, color); };
	
	//render(gl, numberOfVertices);
}

function click(ev, gl, canvas, program, params, tapCoordinates, tapColors, tapSize, tapObjectType, color)
{
	var x = ev.clientX; // x coordinate of a mouse pointer
	var y = ev.clientY; // y coordinate of a mouse pointer
	var rect = ev.target.getBoundingClientRect();

	x = ((x - rect.left) - canvas.height/2)/(canvas.height/2);
	y = (canvas.width/2 - (y - rect.top))/(canvas.width/2);

	var numberOfVertices = initVertices(program, gl);

	tapCoordinates.push([x - 0.03, y + 0.03, 0]);
	tapColors.push(color);
	tapSize.push(params.Size);

	if(params.Triangle)
		tapObjectType.push(1);
	else if(params.Square)
		tapObjectType.push(2);
	else
		tapObjectType.push(3);

	render(gl, numberOfVertices, tapCoordinates, tapColors, tapSize, tapObjectType);
}

function initTransformations(gl, modelMatrix, color)
{
	var transformationMatrix = gl.getUniformLocation(gl.program, 'transformationMatrix');
	gl.uniformMatrix4fv(transformationMatrix, false, flatten(modelMatrix));	

	var u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
	gl.uniform4f(u_FragColor, color[0], color[1], color[2], color[3]);
}

function render (gl, numberOfVertices, tapCoordinates, tapColors, tapSize, tapObjectType)
{
	gl.clearColor(1.0, 1.0, 1.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);
	
	var len = tapCoordinates.length;
	for (var i = 0; i < len; i+=1)
	{
		var translateMat = tapCoordinates[i];
		var color = tapColors[i];
		var objectType = tapObjectType[i];
		var size = tapSize[i];

		mat4.identity(mvMatrix);

		//Triangle
		if(objectType == 1)
		{
			mat4.translate(mvMatrix, mvMatrix, translateMat);
			mat4.scale(mvMatrix, mvMatrix, [size, size, 1]);
			initTransformations(gl, mvMatrix, color);
			gl.drawArrays(gl.TRIANGLES, 0, 3);
		}

		//Square
		else if(objectType == 2)
		{
			mat4.translate(mvMatrix, mvMatrix, translateMat);
			// value = size / 28.5;
			// mat4.translate(mvMatrix, mvMatrix, [-value, value, 0.0]);
			// mat4.rotate(mvMatrix, mvMatrix, Math.PI/4, [0, 0, 1]);
			// mat4.scale(mvMatrix, mvMatrix, [2 * size, size, 1]);
			// initTransformations(gl, mvMatrix, color);
			// gl.drawArrays(gl.TRIANGLES, 0, 3);

			// mat4.identity(mvMatrix);

			// mat4.translate(mvMatrix, mvMatrix, translateMat);
			// mat4.translate(mvMatrix, mvMatrix, [value, -value, 0.0]);
			// mat4.rotate(mvMatrix, mvMatrix, Math.PI/4, [0, 0, 1]);
			// mat4.scale(mvMatrix, mvMatrix, [-(2 * size), -size, 1]);
			// initTransformations(gl, mvMatrix, color);
			// gl.drawArrays(gl.TRIANGLES, 0, 3);
			mat4.scale(mvMatrix, mvMatrix, [size, size, 1]);
			initTransformations(gl, mvMatrix, color);
			gl.drawArrays(gl.TRIANGLE_STRIP, 3, 4);
		}

		//Pentagon
		else
		{
			mat4.translate(mvMatrix, mvMatrix, translateMat);
			mat4.scale(mvMatrix, mvMatrix, [size, size, 1]);
			initTransformations(gl, mvMatrix, color);
			gl.drawArrays(gl.TRIANGLE_FAN, 7, 7);
		}
	}
}

function initVertices(program, gl)
{
	var vertices = [-0.05, -0.05, 0.05, -0.05, 0, 0.05, 
					 0.05, -0.05, -0.05, -0.05, 0.05, 0.05, -0.05, 0.05, 
					 0, 0, 0, 0.06, -0.05, 0.01, -0.02, -0.05, 0.02, -0.05, 0.05, 0.01, 0, 0.06];
	var noOfDim = 2;
	var numberOfVertices = vertices.length / noOfDim;
	
	var vertexBuffer = gl.createBuffer();
	if (!vertexBuffer) { console.log('Failed to create the buffer object '); return -1; }
	
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
	
	var a_Position = gl.getAttribLocation(program, 'a_Position');
	if (a_Position < 0) { console.log ("Failed to Get Position"); return; }
	
	gl.vertexAttribPointer(a_Position, noOfDim, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(a_Position);
	
	return numberOfVertices;
}
