function main() 
{
  	var canvas = document.getElementById('webgl');
	var gl = getWebGLContext(canvas);

	if (!gl){
		console.log('Failed to find context');
	}

	color = [0, 0, 0, 1];
	
	var program = initShaders( gl, "vertex-shader", "fragment-shader" );
	gl.useProgram (program);
	gl.program = program;

	vertices = [0, 0.5, -0.5, -0.5, 0.5, -0.5];
	var numberOfVertices = initVertices(program, gl, vertices);

	var params = { Color: [0, 0, 0, 255], Size: 1.0, Angle: 0.0, TwistAngle: 0.0 };
	params.Tesselate = 
	function() 
	{
		//Init vertices
		var len = vertices.length;
		var tempArray = [];
		for(var i = 0; i < len; i+=6)
		{
			processTriangle([vertices[i], vertices[i + 1]], [vertices[i + 2], vertices[i + 3]], [vertices[i + 4], vertices[i + 5]], tempArray);
		}

		vertices = tempArray;
		numberOfVertices = initVertices(program, gl, vertices);
		
		//Render
		render(gl, numberOfVertices, params.Size, color, params.Angle, params.TwistAngle);
	}

    var gui = new dat.GUI();

	gui.addColor(params, 'Color').onChange(function()
		{
			color = params.Color.map(function(v) {
				return v / 255;
			});

			render(gl, numberOfVertices, params.Size, color, params.Angle, params.TwistAngle);
		});

	gui.add(params, 'Angle', -2 * Math.PI, 2 * Math.PI).onChange(function()
		{
			render(gl, numberOfVertices, params.Size, color, params.Angle, params.TwistAngle);
		});

	gui.add(params, 'TwistAngle', -Math.PI / 2, Math.PI / 2).onChange(function()
		{
			render(gl, numberOfVertices, params.Size, color, params.Angle, params.TwistAngle);
		});

	gui.add(params, 'Size', 0.001, 2.0).onChange(function()
		{
			render(gl, numberOfVertices, params.Size, color, params.Angle, params.TwistAngle);
		});

	gui.add(params, 'Tesselate');
	
	render(gl, numberOfVertices, params.Size, color, params.Angle, params.TwistAngle);
}

function processTriangle(vertex1, vertex2, vertex3, tempArray)
{
	//First point (V1-V2)
	var point1 = [];
	point1[0] = (vertex1[0] + vertex2[0]) / 2;
	point1[1] = (vertex1[1] + vertex2[1]) / 2;

	//Second point (V1-V3)
	var point2 = [];
	point2[0] = (vertex1[0] + vertex3[0]) / 2;
	point2[1] = (vertex1[1] + vertex3[1]) / 2;

	//Third point (V2-V3)
	var point3 = [];
	point3[0] = (vertex2[0] + vertex3[0]) / 2;
	point3[1] = (vertex2[1] + vertex3[1]) / 2;

	//Insert the first triangle
	tempArray.push(vertex1[0], vertex1[1]);
	tempArray.push(point1[0], point1[1]);
	tempArray.push(point2[0], point2[1]);

	//Insert the second triangle
	tempArray.push(point1[0], point1[1]);
	tempArray.push(vertex2[0], vertex2[1]);
	tempArray.push(point3[0], point3[1]);

	//Insert the third triangle
	tempArray.push(point3[0], point3[1]);
	tempArray.push(point1[0], point1[1]);
	tempArray.push(point2[0], point2[1]);

	//Insert the fourth triangle
	tempArray.push(point2[0], point2[1]);
	tempArray.push(point3[0], point3[1]);
	tempArray.push(vertex3[0], vertex3[1]);
}

function initTransformations(gl, modelMatrix, color, twistAngle)
{
	var transformationMatrix = gl.getUniformLocation(gl.program, 'transformationMatrix');
	gl.uniformMatrix4fv(transformationMatrix, false, flatten(modelMatrix));

	var vs_angle = gl.getUniformLocation(gl.program, 'angle');
	gl.uniform1f(vs_angle, twistAngle);	

	var u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
	gl.uniform4f(u_FragColor, color[0], color[1], color[2], color[3]);
}

function render (gl, numberOfVertices, size, color, angle, twistAngle)
{
	gl.clearColor(1.0, 1.0, 1.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);

	mat4.identity(mvMatrix);

	mat4.rotate(mvMatrix, mvMatrix, angle, [0, 0, 1]);
	mat4.scale(mvMatrix, mvMatrix, [size, size, 1]);
	initTransformations(gl, mvMatrix, color, twistAngle);
	gl.drawArrays(gl.TRIANGLES, 0, numberOfVertices);
}

function initVertices(program, gl, vertices)
{
	//var vertices = [-0.05, -0.05, 0.05, -0.05, 0, 0.05];
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
