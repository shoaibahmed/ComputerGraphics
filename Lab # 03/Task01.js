function main() {
  	var canvas = document.getElementById('webgl');
	var gl = getWebGLContext(canvas);
	if (!gl){
		console.log('Failed to find context');
	}
	
	var program = initShaders( gl, "vertex-shader", "fragment-shader" );
	gl.useProgram (program);
	gl.program = program;
	
	var numberOfVertices = initVertices(program, gl);

	render(gl, numberOfVertices);
}

function render (gl, numberOfVertices)
{
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);

	modelView = mat4.create();

	//First Triangle
	mat4.translate(modelView, modelView, [-0.5, 0.5, 0]);
	initTransformations(gl, modelView);
	gl.drawArrays(gl.TRIANGLES, 0, numberOfVertices);

	//Second Triangle
	mat4.identity(modelView);
	mat4.translate(modelView, modelView, [0.5, 0.5, 0]);
	mat4.rotate(modelView, modelView, Math.PI/4, [0, 0, 1]);
	initTransformations(gl, modelView);
	gl.drawArrays(gl.TRIANGLES, 0, numberOfVertices);

	//Third Triangle
	mat4.identity(modelView);
	mat4.translate(modelView, modelView, [0.5, -0.5, 0]);
	mat4.rotate(modelView, modelView, -Math.PI/4, [0, 0, 1]);
	mat4.scale(modelView, modelView, [2, 2, 1]);
	initTransformations(gl, modelView);
	gl.drawArrays(gl.TRIANGLES, 0, numberOfVertices);

	//Fourth Triangle
	mat4.identity(modelView);
	modelView[4] = 0.5;
	modelView[8] = -0.5;
	mat4.translate(modelView, modelView, [-0.5, -0.5, 0]);
	
	initTransformations(gl, modelView);
	gl.drawArrays(gl.TRIANGLES, 0, numberOfVertices);
}

function initVertices(program, gl){
	var vertices = [-0.3, -0.3, 0.3, -0.3, 0, 0.3];
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
	/*
	mat4.identity(modelView); // Set to identity
	mat4.translate(modelView, modelView, [0, 0, -10]); // Translate back 10 units
	mat4.rotate(modelView, modelView, Math.PI/2, [0, 1, 0]); // Rotate 90 degrees around the Y axis
	mat4.scale(modelView, modelView, [2, 2, 2]); // Scale by 200%
	console.log(modelView);
	*/

	var transformationMatrix = gl.getUniformLocation(gl.program, 'transformationMatrix');
	gl.uniformMatrix4fv(transformationMatrix, false, userTransformationMatrix);
}
