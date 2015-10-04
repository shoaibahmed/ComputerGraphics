/*
var mvMatrix = mat4.create();
var mvMatrixStack = [];

function mvPushMatrix() {
    var copy = mat4.create();
    mat4.copy(copy, mvMatrix);
    mvMatrixStack.push(copy);
}

function mvPopMatrix() {
    if (mvMatrixStack.length == 0) {
        throw "Invalid popMatrix!";
    }
    mvMatrix = mvMatrixStack.pop();
}
*/
//The above is defined in modelViewMatrixStack.js

function main() {
  	var canvas = document.getElementById('webgl');
	var gl = getWebGLContext(canvas);
	if (!gl){
		console.log('Failed to find context');
	}
	
	var program = initShaders( gl, "vertex-shader", "fragment-shader" );
	gl.useProgram (program);
	gl.program = program;

	canvas.onmousedown = function(ev) { click(ev, gl, canvas, program); };
	
	//render(gl, numberOfVertices);
}

function click(ev, gl, canvas, program){
	var x = ev.clientX; // x coordinate of a mouse pointer
	var y = ev.clientY; // y coordinate of a mouse pointer
	var rect = ev.target.getBoundingClientRect();

	x = ((x - rect.left) - canvas.height/2)/(canvas.height/2);
	y = (canvas.width/2 - (y - rect.top))/(canvas.width/2);

	var numberOfVertices = initVertices(program, gl);
	
	render(gl, numberOfVertices, [x, y, 0]);
}

function initTransformations(gl, modelMatrix, color){
	var transformationMatrix = gl.getUniformLocation(gl.program, 'transformationMatrix');
	gl.uniformMatrix4fv(transformationMatrix, false, flatten(modelMatrix));	

	var u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
	gl.uniform4f(u_FragColor, color[0], color[1], color[2], color[3]);
}

function render (gl, numberOfVertices, translateMat){
	gl.clearColor(1.0, 1.0, 1.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);

	RED_COLOR = [1.0, 0.0, 0.0, 1.0];
	BLUE_COLOR = [0.0, 0.0, 1.0, 1.0];

	mat4.identity(mvMatrix);

	mvPushMatrix();

	mat4.translate(mvMatrix, mvMatrix, translateMat);
	mat4.translate(mvMatrix, mvMatrix, [0.5, 0.0, 0.0]);
	mat4.rotate(mvMatrix, mvMatrix, Math.PI/2, [0, 0, 1]);
	initTransformations(gl, mvMatrix, RED_COLOR);
	gl.drawArrays(gl.TRIANGLES, 0, numberOfVertices);

	mvPushMatrix();

	mat4.translate(mvMatrix, mvMatrix, [0.2, 0.0, 0.0]);
	initTransformations(gl, mvMatrix, RED_COLOR);
	gl.drawArrays(gl.TRIANGLES, 0, numberOfVertices);

	mvPopMatrix();

	mat4.translate(mvMatrix, mvMatrix, [-0.2, 0.0, 0.0]);
	initTransformations(gl, mvMatrix, RED_COLOR);
	gl.drawArrays(gl.TRIANGLES, 0, numberOfVertices);

	mvPopMatrix();
	mvPushMatrix();

	mat4.translate(mvMatrix, mvMatrix, translateMat);
	mat4.translate(mvMatrix, mvMatrix, [-0.5, 0.0, 0.0]);
	mat4.rotate(mvMatrix, mvMatrix, -Math.PI/2, [0, 0, 1]);
	initTransformations(gl, mvMatrix, RED_COLOR);
	gl.drawArrays(gl.TRIANGLES, 0, numberOfVertices);

	mvPushMatrix();

	mat4.translate(mvMatrix, mvMatrix, [0.2, 0.0, 0.0]);
	initTransformations(gl, mvMatrix, RED_COLOR);
	gl.drawArrays(gl.TRIANGLES, 0, numberOfVertices);

	mvPopMatrix();

	mat4.translate(mvMatrix, mvMatrix, [-0.2, 0.0, 0.0]);
	initTransformations(gl, mvMatrix, RED_COLOR);
	gl.drawArrays(gl.TRIANGLES, 0, numberOfVertices);

	mvPopMatrix();
	mvPushMatrix();

	mat4.translate(mvMatrix, mvMatrix, translateMat);
	mat4.translate(mvMatrix, mvMatrix, [0.0, -0.6, 0.0]);
	initTransformations(gl, mvMatrix, RED_COLOR);
	gl.drawArrays(gl.TRIANGLES, 0, numberOfVertices);

	mvPopMatrix();
	mvPushMatrix();

	mat4.translate(mvMatrix, mvMatrix, translateMat);
	mat4.translate(mvMatrix, mvMatrix, [0.0, 0.6, 0.0]);
	mat4.rotate(mvMatrix, mvMatrix, Math.PI, [0, 0, 1]);
	initTransformations(gl, mvMatrix, RED_COLOR);
	gl.drawArrays(gl.TRIANGLES, 0, numberOfVertices);

	mvPopMatrix();
	mvPushMatrix();

	//Create Blue Square in the middle
	mat4.translate(mvMatrix, mvMatrix, translateMat);
	mat4.translate(mvMatrix, mvMatrix, [-0.2, 0.2, 0.0]);
	mat4.rotate(mvMatrix, mvMatrix, Math.PI/4, [0, 0, 1]);
	mat4.scale(mvMatrix, mvMatrix, [11.5, 5.75, 1]);
	initTransformations(gl, mvMatrix, BLUE_COLOR);
	gl.drawArrays(gl.TRIANGLES, 0, numberOfVertices);

	mvPopMatrix();

	mat4.translate(mvMatrix, mvMatrix, translateMat);
	mat4.translate(mvMatrix, mvMatrix, [0.2, -0.2, 0.0]);
	mat4.rotate(mvMatrix, mvMatrix, Math.PI/4, [0, 0, 1]);
	mat4.scale(mvMatrix, mvMatrix, [-11.5, -5.75, 1]);
	initTransformations(gl, mvMatrix, BLUE_COLOR);
	gl.drawArrays(gl.TRIANGLES, 0, numberOfVertices);
}

function initVertices(program, gl){
	var vertices = [-0.05, -0.05, 0.05, -0.05, 0, 0.05];
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

