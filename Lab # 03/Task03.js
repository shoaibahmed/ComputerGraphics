function main() {
  	var canvas = document.getElementById('webgl');
	var gl = getWebGLContext(canvas);
	if (!gl){
		console.log('Failed to find context');
	}
	
	var program = initShaders( gl, "vertex-shader", "fragment-shader" );
	gl.useProgram (program);
	gl.program = program;

	var params = { angle: 0 };
    var gui = new dat.GUI();

	gui.add(params, 'angle', -Math.PI, Math.PI).onChange(function(value)
	{
    	//Refresh based on the new value of params
    	render(gl, program, value);
	})
	
	render(gl, program, 0);
}

function render (gl, program, angle)
{
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);

	modelView = mat4.create();

	//Hexagon
	var vertices = [0, 0, 0, 0.3, -0.3, 0.15, -0.3, -0.15, 0, -0.3, 0.3, -0.15, 0.3, 0.15, 0, 0.3];
	var numberOfVertices = initVertices(program, gl, vertices)

	mat4.translate(modelView, modelView, [-0.5, 0, 0]);
	mat4.rotate(modelView, modelView, angle, [0, 0, 1]);

	initTransformations(gl, modelView);
	gl.drawArrays(gl.TRIANGLE_FAN, 0, numberOfVertices);

	//Pentagon
	var vertices = [0, 0, 0, 0.3, -0.25, 0.05, -0.1, -0.25, 0.1, -0.25, 0.25, 0.05, 0, 0.3];
	var numberOfVertices = initVertices(program, gl, vertices)

	mat4.identity(modelView);
	mat4.translate(modelView, modelView, [0.5, 0, 0]);
	mat4.rotate(modelView, modelView, angle, [0, 0, 1]);

	initTransformations(gl, modelView);
	gl.drawArrays(gl.TRIANGLE_FAN, 0, numberOfVertices);
}

function initVertices(program, gl, vertices)
{
	var noOfDim = 2;
	var numberOfVertices = vertices.length / noOfDim;
	
	var vertexBuffer = gl.createBuffer();
	if (!vertexBuffer){ console.log('Failed to create the buffer object ');	return -1;}
	
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
	
	var a_Position = gl.getAttribLocation(program, 'a_Position');
	if (a_Position < 0) { console.log ("Failed to Get Position"); return;	}
	
	gl.vertexAttribPointer(a_Position, noOfDim, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(a_Position);
	
	return numberOfVertices;
}

function initTransformations(gl, userTransformationMatrix)
{
	var transformationMatrix = gl.getUniformLocation(gl.program, 'transformationMatrix');
	gl.uniformMatrix4fv(transformationMatrix, false, userTransformationMatrix);
}
