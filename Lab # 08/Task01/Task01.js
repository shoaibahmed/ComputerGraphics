// Shows the use of point light source by calculating the light direction in the fragment shader. 
// Point light source can be placed at different positions to see its effect. Change the light position in initPointLight
function main() {
  	var canvas = document.getElementById('webgl');
	var gl = getWebGLContext(canvas);
	if (!gl){
		console.log('Failed to find context');
	}
	
	var program = initShaders( gl, "vertex-shader", "fragment-shader" );
	gl.useProgram (program);
	gl.program = program;
	
	var numberOfIndices = initVertices(program, gl);
	
	gl.enable(gl.DEPTH_TEST);
	var vMatrix = mat4.create();
	var pMatrix = mat4.create();
	var nMatrix = mat4.create();
	// no neeed to create mvMatrix as it is already created in modelViewMatrixStack.js
	
	mat4.identity(vMatrix);
	mat4.lookAt(vMatrix, [0.0, 0.0, 0.0], [0.0, 0.0, -1.0], [0.0, 1.0, 0.0]);

	var viewVol = [ 0.3, 1, 0.5, 100.0];
	mat4.perspective(pMatrix, viewVol[0], viewVol[1], viewVol[2], viewVol[3]);
	initProjection(gl, pMatrix);

	var rotAngles = [0.0, 0.0, 0.0];

	document.onkeydown = function(ev){ keyDownFunc(ev, gl, vMatrix, nMatrix, rotAngles, numberOfIndices); };

	initAmbientLight(gl);
	initPointLight(gl);

	render(gl, numberOfIndices, vMatrix, nMatrix, rotAngles);
}

function keyDownFunc(ev, gl, vMatrix, nMatrix, rotAngles, numberOfIndices){
	console.log(ev.keyCode);
	if(ev.keyCode == 39) { // The right arrow key was pressed. So change the rotation about y axis i.e. rotAngles[1]
		rotAngles[1] += 0.1;
		render(gl, numberOfIndices, vMatrix, nMatrix, rotAngles);
	} else if (ev.keyCode == 37) { // The left arrow key was pressed
		rotAngles[1] -= 0.1;
		render(gl, numberOfIndices, vMatrix, nMatrix, rotAngles);
	} else if (ev.keyCode == 38) { 		//The up arrow key was pressed. So change the rotation about x axis
		rotAngles[0] += 0.1;
		render(gl, numberOfIndices, vMatrix, nMatrix, rotAngles);
	} else if (ev.keyCode == 40) {
		rotAngles[0] -= 0.1;
		render(gl, numberOfIndices, vMatrix, nMatrix, rotAngles);
	}
}

function initAmbientLight(gl){
	var u_AmbientLight = gl.getUniformLocation(gl.program, "u_AmbientLight");
	gl.uniform3f(u_AmbientLight, 0.4, 0.4, 0.4);
}

function initPointLight(gl){
	var u_LightColor = gl.getUniformLocation(gl.program, "u_LightColor");
	var u_LightPos = gl.getUniformLocation(gl.program, "u_LightPos");
	var u_ViewerPos = gl.getUniformLocation(gl.program, "u_ViewerPos");

	gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0);

	var lightPos = vec3.create();
	var viewerPos = vec3.create();
	//vec3.set(lightPos, 0.5, 3.0, 4.0);
	vec3.set(lightPos, 0.0, 0.0, -10.0);			// Placing the light source in the center
	vec3.set(viewerPos, 0.0, 0.0, 0.0);				// Placing the camera in the center
	//vec3.set(lightPos, 0.0, 0.0, -20.0);			

	//vec3.normalize(lightPos, lightPos);			// Must not normalize as it is happening in shader now

	gl.uniform3fv(u_LightPos, lightPos);
	gl.uniform3fv(u_ViewerPos, viewerPos);
}

function initProjection(gl, pMatrix){
	var u_pMatrix = gl.getUniformLocation(gl.program, 'u_pMatrix');
	if (!u_pMatrix) { 
    	console.log('Failed to get the storage locations of proj');
    	return;
  	}
	gl.uniformMatrix4fv(u_pMatrix, false, flatten(pMatrix));
}

function initMVMatrix(gl, mvMatrix, vMatrix){
	var tempM = mat4.create();
	mat4.multiply(tempM, vMatrix, mvMatrix);
	var u_mvMatrix = gl.getUniformLocation(gl.program, 'u_mvMatrix');
	gl.uniformMatrix4fv(u_mvMatrix, false, flatten(tempM));	

	// Passing model matrix for Point Light Source
	var u_mMatrix = gl.getUniformLocation(gl.program, "u_mMatrix");
	gl.uniformMatrix4fv(u_mMatrix, false, flatten(mvMatrix));				// note that mvMatrix here does not contain the vMatrix

}

function initNMatrix(gl, nMatrix, mvMatrix){
	mat4.identity(nMatrix);
	mat4.invert(nMatrix, mvMatrix);
	mat4.transpose(nMatrix, nMatrix);

	var u_nMatrix = gl.getUniformLocation(gl.program, "u_nMatrix");
	gl.uniformMatrix4fv(u_nMatrix, false, flatten(nMatrix));
}

function render (gl, numberOfIndices, vMatrix, nMatrix, rotAngles){
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	mat4.identity(mvMatrix);
	mat4.translate(mvMatrix, mvMatrix, [0.9, 0.0, -10.5]);
	mat4.rotateX(mvMatrix, mvMatrix, rotAngles[0]);
	mat4.rotateY(mvMatrix, mvMatrix, rotAngles[1]);
	mat4.scale(mvMatrix, mvMatrix, [0.5, 0.5, 0.5]);
	
	initMVMatrix(gl, mvMatrix,  vMatrix);
	initNMatrix(gl, nMatrix, mvMatrix);
	gl.drawElements(gl.TRIANGLES, numberOfIndices, gl.UNSIGNED_BYTE, 0);	

	mat4.identity(mvMatrix);
	mat4.translate(mvMatrix, mvMatrix, [-0.9, 0.0, -10.5]);
	mat4.rotateX(mvMatrix, mvMatrix, rotAngles[0]);
	mat4.rotateY(mvMatrix, mvMatrix, rotAngles[1]);
	mat4.scale(mvMatrix, mvMatrix, [0.5, 0.5, 0.5]);

	initMVMatrix(gl, mvMatrix,  vMatrix);
	initNMatrix(gl, nMatrix, mvMatrix);
	gl.drawElements(gl.TRIANGLES, numberOfIndices, gl.UNSIGNED_BYTE, 0);	
}

function initVertices(program, gl){
  // Create a cube
  //    v6----- v5
  //   /|      /|
  //  v1------v0|
  //  | |     | |
  //  | |v7---|-|v4
  //  |/      |/
  //  v2------v3
  var vertices = [ // Vertex coordinates
				 1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0,  // v0-v1-v2-v3 front
			     1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0,  // v0-v3-v4-v5 right
			     1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0,  // v0-v5-v6-v1 up
			    -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0,  // v1-v6-v7-v2 left
			    -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0,  // v7-v4-v3-v2 down
			     1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0   // v4-v7-v6-v5 back
				 ];
	vertices = flatten(vertices);
	var noOfDim = 3;
	var numberOfVertices = vertices.length;

	var ka_colors = [ // Colors
					0.4, 0.4, 1.0, 1.0,  	0.4, 0.4, 1.0, 1.0,  	0.4, 0.4, 1.0, 1.0,  	0.4, 0.4, 1.0, 1.0,  // v0-v1-v2-v3 front(blue)
				    0.4, 1.0, 0.4, 1.0,  	0.4, 1.0, 0.4, 1.0,  	0.4, 1.0, 0.4, 1.0,  	0.4, 1.0, 0.4, 1.0,  // v0-v3-v4-v5 right(green)
				    1.0, 0.4, 0.4, 1.0,  	1.0, 0.4, 0.4, 1.0,  	1.0, 0.4, 0.4, 1.0,  	1.0, 0.4, 0.4, 1.0,  // v0-v5-v6-v1 up(red)
				    1.0, 1.0, 0.4, 1.0,	 	1.0, 1.0, 0.4, 1.0,  	1.0, 1.0, 0.4, 1.0,  	1.0, 1.0, 0.4, 1.0,  // v1-v6-v7-v2 left
				    1.0, 1.0, 1.0, 1.0,  	1.0, 1.0, 1.0, 1.0,  	1.0, 1.0, 1.0, 1.0,  	1.0, 1.0, 1.0, 1.0,  // v7-v4-v3-v2 down
				    0.4, 1.0, 1.0, 1.0,  	0.4, 1.0, 1.0, 1.0,  	0.4, 1.0, 1.0, 1.0,  	0.4, 1.0, 1.0, 1.0,   // v4-v7-v6-v5 back
				];
	ka_colors = flatten(ka_colors);
	var kaColorItemSize = 4;

	var kd_colors = [ // Colors
					0.4, 0.4, 1.0, 1.0,  	0.4, 0.4, 1.0, 1.0,  	0.4, 0.4, 1.0, 1.0,  	0.4, 0.4, 1.0, 1.0,  // v0-v1-v2-v3 front(blue)
				    0.4, 1.0, 0.4, 1.0,  	0.4, 1.0, 0.4, 1.0,  	0.4, 1.0, 0.4, 1.0,  	0.4, 1.0, 0.4, 1.0,  // v0-v3-v4-v5 right(green)
				    1.0, 0.4, 0.4, 1.0,  	1.0, 0.4, 0.4, 1.0,  	1.0, 0.4, 0.4, 1.0,  	1.0, 0.4, 0.4, 1.0,  // v0-v5-v6-v1 up(red)
				    1.0, 1.0, 0.4, 1.0,	 	1.0, 1.0, 0.4, 1.0,  	1.0, 1.0, 0.4, 1.0,  	1.0, 1.0, 0.4, 1.0,  // v1-v6-v7-v2 left
				    1.0, 1.0, 1.0, 1.0,  	1.0, 1.0, 1.0, 1.0,  	1.0, 1.0, 1.0, 1.0,  	1.0, 1.0, 1.0, 1.0,  // v7-v4-v3-v2 down
				    0.4, 1.0, 1.0, 1.0,  	0.4, 1.0, 1.0, 1.0,  	0.4, 1.0, 1.0, 1.0,  	0.4, 1.0, 1.0, 1.0,   // v4-v7-v6-v5 back
				];
	kd_colors = flatten(kd_colors);
	var kdColorItemSize = 4;

	var ks_colors = [ // Colors
					0.4, 0.4, 1.0, 1.0,  	0.4, 0.4, 1.0, 1.0,  	0.4, 0.4, 1.0, 1.0,  	0.4, 0.4, 1.0, 1.0,  // v0-v1-v2-v3 front(blue)
				    0.4, 1.0, 0.4, 1.0,  	0.4, 1.0, 0.4, 1.0,  	0.4, 1.0, 0.4, 1.0,  	0.4, 1.0, 0.4, 1.0,  // v0-v3-v4-v5 right(green)
				    1.0, 0.4, 0.4, 1.0,  	1.0, 0.4, 0.4, 1.0,  	1.0, 0.4, 0.4, 1.0,  	1.0, 0.4, 0.4, 1.0,  // v0-v5-v6-v1 up(red)
				    1.0, 1.0, 0.4, 1.0,	 	1.0, 1.0, 0.4, 1.0,  	1.0, 1.0, 0.4, 1.0,  	1.0, 1.0, 0.4, 1.0,  // v1-v6-v7-v2 left
				    1.0, 1.0, 1.0, 1.0,  	1.0, 1.0, 1.0, 1.0,  	1.0, 1.0, 1.0, 1.0,  	1.0, 1.0, 1.0, 1.0,  // v7-v4-v3-v2 down
				    0.4, 1.0, 1.0, 1.0,  	0.4, 1.0, 1.0, 1.0,  	0.4, 1.0, 1.0, 1.0,  	0.4, 1.0, 1.0, 1.0,   // v4-v7-v6-v5 back
				];
	ks_colors = flatten(ks_colors);
	var ksColorItemSize = 4;

	var nShiney = [ // Shininess
					1.0,  	1.0,  	1.0,  	1.0,  // v0-v1-v2-v3 front(blue)
				    1.0,  	1.0,  	1.0,  	1.0,  // v0-v3-v4-v5 right(green)
				    1.0,  	1.0,  	1.0,  	1.0,  // v0-v5-v6-v1 up(red)
				    1.0,  	1.0,  	1.0,  	1.0,  // v1-v6-v7-v2 left
				    1.0,  	1.0,  	1.0,  	1.0,  // v7-v4-v3-v2 down
				    1.0,  	1.0,  	1.0,  	1.0   // v4-v7-v6-v5 back
				];
	nShiney = flatten(nShiney);
	var nShineyItemSize = 1;

	var normals = [    // Normal
				    0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
				    1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
				    0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
				   -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
				    0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  // v7-v4-v3-v2 down
				    0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0   // v4-v7-v6-v5 back
				  ];
	normals = flatten(normals);
	var normalItemSize = 3;

	var ELEMENT_SIZE = vertices.BYTES_PER_ELEMENT;  // array ( vertices) must be flatten or should be "FLOAT32ARAAY before call."
	
	var indices = new Uint8Array ([ // flatten is a utility function that converts to Float32Array only. So it will not work here. Uint8 handle 256 indices at max. for more use Uint16Array
									 0, 1, 2,   0, 2, 3,    // front
								     4, 5, 6,   4, 6, 7,    // right
								     8, 9,10,   8,10,11,    // up
								    12,13,14,  12,14,15,    // left
								    16,17,18,  16,18,19,    // down
								    20,21,22,  20,22,23,     // back
								]);
	var numberOfIndices = indices.length;

	// Setting up vertices and colors in inteleaved buffer
	var indexBuffer = gl.createBuffer();

	if (!initArrayBuffer(gl, vertices, noOfDim, gl.FLOAT, 'a_Position'))
    	return -1;   

  	// if (!initArrayBuffer(gl, colors, colorItemSize, gl.FLOAT, 'a_Color'))
   //  	return -1;

    if (!initArrayBuffer(gl, ka_colors, kaColorItemSize, gl.FLOAT, 'ka_Color'))
    	return -1;

    if (!initArrayBuffer(gl, kd_colors, kdColorItemSize, gl.FLOAT, 'kd_Color'))
    	return -1;

    if (!initArrayBuffer(gl, ks_colors, ksColorItemSize, gl.FLOAT, 'ks_Color'))
    	return -1;

    if (!initArrayBuffer(gl, nShiney, nShineyItemSize, gl.FLOAT, 'a_nShiney'))
    	return -1;

    if (!initArrayBuffer(gl, normals, normalItemSize, gl.FLOAT, 'a_normal'))
    	return -1;

	if (!indexBuffer){ console.log('Failed to create the index object ');	return -1;}
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
	
	return numberOfIndices;
}

function initArrayBuffer(gl, data, itemsPerElement, type, attribute){
	var buffer = gl.createBuffer();
	if (!buffer) {	console.log('Failed to create the buffer object');	return false;	}

	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

	var a_attribute = gl.getAttribLocation(gl.program, attribute);
	if (a_attribute < 0) { console.log ("Failed to Get the attributte"); return;	}

	gl.vertexAttribPointer(a_attribute, itemsPerElement, type, false, 0, 0);
	gl.enableVertexAttribArray(a_attribute);

	return true;
}









