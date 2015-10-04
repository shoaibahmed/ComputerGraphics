var timePrev = Date.now();
var animationRate = 1/1000;

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
	
	//render(gl, numberOfVertices);

	var params = { rate: 0 };
    var gui = new dat.GUI();

	gui.add(params, 'rate', 100, 2000).onChange(function(value)
	{
    	//Refresh based on the new value of params
    	animationRate = 1 / value;
	})

	var currentangle = 0.0;
	var currentdistance = 0.0;
	var distanceUpdateType = 1;
	var time, elapsed;
	var tick = function(){
		arr = animate(currentangle, currentdistance, time, elapsed, distanceUpdateType);
		currentangle = arr[0];
		currentdistance = arr[1];
		distanceUpdateType = arr[2];
		render(gl, numberOfVertices, currentangle, currentdistance);
		requestAnimationFrame(tick)
	}
	tick();
}

function animate(currentangle, currentdistance, time, elapsed, distanceUpdateType){
	time = Date.now();
	elapsed = time - timePrev;
	timePrev = time;

	angle = (currentangle + (elapsed * animationRate));

	//Distance should be from -1 to 1
	if((currentdistance > -1) && (currentdistance < 1))
	{
		if(distanceUpdateType == 1)
		{
			distance = (currentdistance + (elapsed * animationRate));
		}
		else
		{
			distance = (currentdistance - (elapsed * animationRate));
		}
	}
	else
	{
		if(currentdistance <= -1)
		{
			currentdistance = -0.999;
			distanceUpdateType = 1;
		}
		else
		{
			currentdistance = 0.999;
			distanceUpdateType = 2;
		}

		distance = currentdistance;
	}

	return [angle, distance, distanceUpdateType];
}

function initTransformations(gl, modelMatrix, color){
	var transformationMatrix = gl.getUniformLocation(gl.program, 'transformationMatrix');
	gl.uniformMatrix4fv(transformationMatrix, false, flatten(modelMatrix));	

	var u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
	gl.uniform4f(u_FragColor, color[0], color[1], color[2], color[3]);
}

function render (gl, numberOfVertices, angle, distance){
	gl.clearColor(1.0, 1.0, 1.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);

	RED_COLOR = [1.0, 0.0, 0.0, 1.0];
	BLUE_COLOR = [0.0, 0.0, 1.0, 1.0];
	YELLOW_COLOR = [1.0, 1.0, 0.0, 1.0];

	mat4.identity(mvMatrix);

	mvPushMatrix();
	mvPushMatrix();
	mvPushMatrix();
	mvPushMatrix();
	mvPushMatrix();

	//Create Square to be placed on top
	mat4.translate(mvMatrix, mvMatrix, [distance, 0.0, 0.0]);
	mat4.translate(mvMatrix, mvMatrix, [0.0, 0.85, 0.0]);
	mat4.translate(mvMatrix, mvMatrix, [-0.07, 0.07, 0.0]);
	mat4.rotate(mvMatrix, mvMatrix, Math.PI/4, [0, 0, 1]);
	mat4.scale(mvMatrix, mvMatrix, [4, 2, 1]);
	initTransformations(gl, mvMatrix, YELLOW_COLOR);
	gl.drawArrays(gl.TRIANGLES, 0, numberOfVertices);

	mvPopMatrix();

	mat4.translate(mvMatrix, mvMatrix, [distance, 0.0, 0.0]);
	mat4.translate(mvMatrix, mvMatrix, [0.0, 0.85, 0.0]);
	mat4.translate(mvMatrix, mvMatrix, [0.07, -0.07, 0.0]);
	mat4.rotate(mvMatrix, mvMatrix, Math.PI/4, [0, 0, 1]);
	mat4.scale(mvMatrix, mvMatrix, [-4, -2, 1]);
	initTransformations(gl, mvMatrix, YELLOW_COLOR);
	gl.drawArrays(gl.TRIANGLES, 0, numberOfVertices);

	mvPopMatrix();

	//Create Square to be placed on bottom
	mat4.translate(mvMatrix, mvMatrix, [-distance, 0.0, 0.0]);
	mat4.translate(mvMatrix, mvMatrix, [0.0, -0.85, 0.0]);
	mat4.translate(mvMatrix, mvMatrix, [-0.07, 0.07, 0.0]);
	mat4.rotate(mvMatrix, mvMatrix, Math.PI/4, [0, 0, 1]);
	mat4.scale(mvMatrix, mvMatrix, [4, 2, 1]);
	initTransformations(gl, mvMatrix, YELLOW_COLOR);
	gl.drawArrays(gl.TRIANGLES, 0, numberOfVertices);

	mvPopMatrix();

	mat4.translate(mvMatrix, mvMatrix, [-distance, 0.0, 0.0]);
	mat4.translate(mvMatrix, mvMatrix, [0.0, -0.85, 0.0]);
	mat4.translate(mvMatrix, mvMatrix, [0.07, -0.07, 0.0]);
	mat4.rotate(mvMatrix, mvMatrix, Math.PI/4, [0, 0, 1]);
	mat4.scale(mvMatrix, mvMatrix, [-4, -2, 1]);
	initTransformations(gl, mvMatrix, YELLOW_COLOR);
	gl.drawArrays(gl.TRIANGLES, 0, numberOfVertices);


	//Start Drawing Triangles
	mvPopMatrix();

	mat4.rotate(mvMatrix, mvMatrix, angle, [0, 0, 1]);
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

	mat4.rotate(mvMatrix, mvMatrix, angle, [0, 0, 1]);
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

	mat4.rotate(mvMatrix, mvMatrix, angle, [0, 0, 1]);
	mat4.translate(mvMatrix, mvMatrix, [0.0, -0.6, 0.0]);
	initTransformations(gl, mvMatrix, RED_COLOR);
	gl.drawArrays(gl.TRIANGLES, 0, numberOfVertices);

	mvPopMatrix();
	mvPushMatrix();

	mat4.rotate(mvMatrix, mvMatrix, angle, [0, 0, 1]);
	mat4.translate(mvMatrix, mvMatrix, [0.0, 0.6, 0.0]);
	mat4.rotate(mvMatrix, mvMatrix, Math.PI, [0, 0, 1]);
	initTransformations(gl, mvMatrix, RED_COLOR);
	gl.drawArrays(gl.TRIANGLES, 0, numberOfVertices);

	mvPopMatrix();
	mvPushMatrix();

	//Create Blue Square in the middle
	mat4.translate(mvMatrix, mvMatrix, [-0.2, 0.2, 0.0]);
	mat4.rotate(mvMatrix, mvMatrix, Math.PI/4, [0, 0, 1]);
	mat4.scale(mvMatrix, mvMatrix, [11.5, 5.75, 1]);
	initTransformations(gl, mvMatrix, BLUE_COLOR);
	gl.drawArrays(gl.TRIANGLES, 0, numberOfVertices);

	mvPopMatrix();

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

