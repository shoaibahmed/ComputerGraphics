WHITE_COLOR = [1.0, 1.0, 1.0, 1.0];
RED_COLOR = [1.0, 0.0, 0.0, 1.0];
BLUE_COLOR = [0.0, 0.0, 1.0, 1.0];
GREEN_COLOR = [0.0, 1.0, 0.0, 1.0];
YELLOW_COLOR = [1.0, 1.0, 0.0, 1.0];

//Look at location
var lx = 0.0;
var lz = -1.0;

//Position of Camera
var x = 0.0;
var z = 0.0;

var angle = 0.0;

var forwardAcceleration = 0.1;
var rotationAcceleration = 0.1;

var frontClippingPlane = 0.0;
var farClippingPlane = 1.0;

function main() 
{
  	var canvas = document.getElementById('webgl');
	var gl = getWebGLContext(canvas);
	if (!gl){
		console.log('Failed to find context');
	}

	var program = initShaders( gl, "vertex-shader", "fragment-shader" );
	gl.useProgram (program);
	gl.program = program;

	//Add mouse move listener
	document.onkeypress = function(e){ cameraMove(gl, e, canvas); }

	projectionMatrix = mat4.create();
	viewMatrix = mat4.create();

	mat4.lookAt(viewMatrix, [x, 0.0, z], [x+lx, 0.0,  z+lz], [0.0, 1.0, 0.0]);
	initView(gl, viewMatrix);

	mat4.perspective(projectionMatrix, Math.PI / 2, 1.0, frontClippingPlane, farClippingPlane);
	//mat4.ortho(projectionMatrix, -1.0, 1.0, -1.0, 1.0, 0.0, 15.0);
	initProjection(gl, projectionMatrix);
	
	var numberOfVertices = initVertices(program, gl);

	if (!initTextures(gl, numberOfVertices)) {
		console.log("Texture init failed");
	}

	//Enable depth sorting
	// gl.enable(gl.DEPTH_TEST);
	//gl.depthFunc(gl.LESS);

	// gl.enable(gl.POLYGON_OFFSET_FILL);
	// gl.polygonOffset(1.0, 1.0);

	var tick = function() 
	{
		render(gl, numberOfVertices);
		requestAnimationFrame(tick)
	}
	tick();
}

function cameraMove(gl, e, canvas)
{
	//If a pressed
	if(e.keyCode == 97)
	{
		angle -= rotationAcceleration;
		lx = Math.sin(angle);
		lz = -Math.cos(angle);
	}

	//If d pressed
	else if(e.keyCode == 100)
	{
		angle += rotationAcceleration;
		lx = Math.sin(angle);
		lz = -Math.cos(angle);
	}

	//If w pressed
	else if(e.keyCode == 119)
	{
		x += lx * forwardAcceleration;
		z += lz * forwardAcceleration;
	}

	//If s pressed
	else if(e.keyCode == 115)
	{
		x -= lx * forwardAcceleration;
		z -= lz * forwardAcceleration;
	}

	var viewMatrix = mat4.create();
	mat4.lookAt(viewMatrix, [x, 0.0, z], [x+lx, 0.0,  z+lz], [0.0, 1.0, 0.0]);
	initView(gl, viewMatrix);
}

function render (gl, numberOfVertices)
{
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	//gl.clearDepth(farClippingPlane);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	//Draw the floor
	mat4.identity(mvMatrix);
	mat4.translate(mvMatrix, mvMatrix, [0, 0, -15])
	mat4.scale(mvMatrix, mvMatrix, [20.0, 1.0, 30.0]);
	initTransformations(gl, mvMatrix, YELLOW_COLOR, 1);
	gl.drawArrays(gl.TRIANGLE_STRIP, numberOfVertices - 4, 4);

	//Draw the front cude
	mat4.identity(mvMatrix);
	mat4.translate(mvMatrix, mvMatrix, [0.0, -0.5, -5.0]);
	initTransformations(gl, mvMatrix, RED_COLOR, 2);
	gl.drawArrays(gl.TRIANGLES, 0, numberOfVertices - 4);

	//Draw the side cude
	mat4.identity(mvMatrix);
	mat4.translate(mvMatrix, mvMatrix, [5.0, -0.5, 5.0]);
	initTransformations(gl, mvMatrix, RED_COLOR, 2);
	gl.drawArrays(gl.TRIANGLES, 0, numberOfVertices - 4);

	//Draw the front cude
	mat4.identity(mvMatrix);
	mat4.translate(mvMatrix, mvMatrix, [-5.0, -0.5, 5.0]);
	initTransformations(gl, mvMatrix, RED_COLOR, 2);
	gl.drawArrays(gl.TRIANGLES, 0, numberOfVertices - 4);
}

function initVertices(program, gl)
{
	var vertices = 
				[
					//Cube
					//Front Face (Z const)
					0.2, -0.2, 0.2, 		 1.0, 0.0,		
					-0.2, -0.2, 0.2, 		 0.0, 0.0,
					0.2, 0.2, 0.2, 			 1.0, 1.0,
					-0.2, -0.2, 0.2, 		 0.0, 0.0,
					0.2, 0.2, 0.2,			 1.0, 1.0,
					-0.2, 0.2, 0.2, 		 0.0, 1.0,

					//Top Face (Y const)
					0.2, 0.2, 0.2, 			 1.0, 1.0,
					-0.2, 0.2, 0.2,			 0.0, 1.0,
					0.2, 0.2, -0.2, 		 1.0, 0.0,
					-0.2, 0.2, 0.2,			 0.0, 1.0,
					0.2, 0.2, -0.2, 		 1.0, 0.0,
					-0.2, 0.2, -0.2, 		 0.0, 0.0,

					//Back Face (Z const)
					0.2, 0.2, -0.2,  		 1.0, 1.0,
					-0.2, 0.2, -0.2, 		 0.0, 1.0,
					0.2, -0.2, -0.2,  		 1.0, 0.0,
					-0.2, 0.2, -0.2, 		 0.0, 1.0,
					0.2, -0.2, -0.2,  		 1.0, 0.0,
					-0.2, -0.2, -0.2, 		 0.0, 0.0,

					//Bottom Face (Y const)
					0.2, -0.2, -0.2,  		 1.0, 0.0,
					-0.2, -0.2, -0.2, 		 0.0, 0.0,
					0.2, -0.2, 0.2,  		 1.0, 1.0,
					-0.2, -0.2, -0.2, 		 0.0, 0.0,
					0.2, -0.2, 0.2,  		 1.0, 1.0,
					-0.2, -0.2, 0.2, 		 0.0, 1.0,

					//Left Face (X const)
					-0.2, -0.2, 0.2,  		 0.0, 1.0,
					-0.2, 0.2, 0.2, 		 1.0, 1.0,
					-0.2, 0.2, -0.2,  		 1.0, 0.0,
					-0.2, -0.2, 0.2, 		 0.0, 1.0,
					-0.2, 0.2, -0.2,  		 1.0, 0.0,
					-0.2, -0.2, -0.2, 		 0.0, 0.0,

					//Right Face (X const)
					0.2, -0.2, 0.2,  		 0.0, 1.0,
					0.2, 0.2, 0.2, 		 	 1.0, 1.0,
					0.2, 0.2, -0.2,  		 1.0, 0.0,
					0.2, -0.2, 0.2, 		 0.0, 1.0,
					0.2, 0.2, -0.2, 		 1.0, 0.0,
					0.2, -0.2, -0.2,  		 0.0, 0.0,

					//Floor
					-1.0, -1.0, 1.0,		 0.0, 1.0,
					-1.0, -1.0, -1.0,		 0.0, 0.0, 
					1.0, -1.0, 1.0,			 1.0, 1.0,
					1.0, -1.0, -1.0,		 1.0, 0.0,
				];

	// var noOfDim = 3;
	// var numberOfVertices = vertices.length / noOfDim;
	
	// var vertexBuffer = gl.createBuffer();
	// if (!vertexBuffer){ console.log('Failed to create the buffer object ');	return -1;}
	
	// gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	// gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
	
	// var a_Position = gl.getAttribLocation(program, 'a_Position');
	// if (a_Position < 0) { console.log ("Failed to Get Position"); return;	}
	
	// gl.vertexAttribPointer(a_Position, noOfDim, gl.FLOAT, false, 0, 0);
	// gl.enableVertexAttribArray(a_Position);
	
	// return numberOfVertices;

	vertices = flatten(vertices);
	var verticesDim = [];
	verticesDim["posV"] = 3;
	verticesDim["posT"] = 2;
	verticesDim["Tot"] = 5;
	var numberOfVertices = vertices.length / (verticesDim["Tot"]);
	var ELEMENT_SIZE = vertices.BYTES_PER_ELEMENT;
	
	var vertexBuffer = gl.createBuffer();
	if (!vertexBuffer){ console.log('Failed to create the buffer object ');	return -1;}
	
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
	
	var a_Position = gl.getAttribLocation(program, 'a_Position');
	if (a_Position < 0) { console.log ("Failed to Get Position"); return;	}
	
	gl.vertexAttribPointer(a_Position, verticesDim["posV"], gl.FLOAT, false, ELEMENT_SIZE*verticesDim["Tot"], 0);
	gl.enableVertexAttribArray(a_Position);

	var a_TexCoord = gl.getAttribLocation(program, 'a_TexCoord');
	if (a_TexCoord < 0) { console.log ("Failed to Get Texture"); return;	}

	gl.vertexAttribPointer(a_TexCoord, verticesDim["posT"], gl.FLOAT, false, ELEMENT_SIZE*verticesDim["Tot"], ELEMENT_SIZE*verticesDim["posT"]);
	gl.enableVertexAttribArray(a_TexCoord);
	
	return numberOfVertices;
}

function initTransformations(gl, userTransformationMatrix, colorVec, textureInUse)
{
	var transformationMatrix = gl.getUniformLocation(gl.program, 'transformationMatrix');
	gl.uniformMatrix4fv(transformationMatrix, false, userTransformationMatrix);

	var u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
	gl.uniform4f(u_FragColor, colorVec[0], colorVec[1], colorVec[2], colorVec[3]);

	var u_textureInUse = gl.getUniformLocation(gl.program, 'u_textureInUse');
	gl.uniform1i(u_textureInUse, textureInUse);
}

function initProjection(gl, userProjectionMatrix)
{
	var projectionMatrix = gl.getUniformLocation(gl.program, 'projectionMatrix');
	gl.uniformMatrix4fv(projectionMatrix, false, userProjectionMatrix);
}

function initView(gl, userViewMatrix)
{
	var viewMatrix = gl.getUniformLocation(gl.program, 'viewMatrix');
	gl.uniformMatrix4fv(viewMatrix, false, userViewMatrix);
}

function initTextures(gl, numberOfVertices)
{
	// var texture = gl.createTexture();   // Create a texture object
	// if (!texture) {	console.log('Failed to create the texture object');	return false;	}

	// var u_Sampler = gl.getUniformLocation(gl.program, "u_Sampler");
	// if (!u_Sampler) {	console.log('Failed to get the storage location of u_Sampler');	return false;	}

	// var image = new Image();  // Create the image object
	// if (!image) {	console.log('Failed to create the image object');	return false;	}
	
	// image.onload = function(){ loadTexture(gl, numberOfVertices, texture, u_Sampler, image); };
	// //image.crossOrigin = "http://localhost";
	// image.src = '../resources/field.jpg';

	// return true;

	var texture0 = gl.createTexture();   // Create a texture object
	var texture1 = gl.createTexture();
	if (!texture0 || !texture1) {	console.log('Failed to create the texture object');	return false;	}

	var u_Sampler0 = gl.getUniformLocation(gl.program, "u_Sampler0");
	var u_Sampler1 = gl.getUniformLocation(gl.program, "u_Sampler1");
	if (!u_Sampler0 || !u_Sampler1) {	console.log('Failed to get the storage location of u_Sampler');	return false;	}

	var image0 = new Image();  // Create the image object
	var image1 = new Image();
	if (!image0 || !image1) {	console.log('Failed to create the image object');	return false;	}
	
	image0.onload = function(){ loadTexture(gl, numberOfVertices, texture0, u_Sampler0, image0, 0); };
	image1.onload = function(){ loadTexture(gl, numberOfVertices, texture1, u_Sampler1, image1, 1); };

	image0.src = 'field.jpg';
	image1.src = 'wood.jpg';

	return true;
}

function loadTexture (gl, numberOfVertices, texture, u_sampler, image, texUnit)
{
	// gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
	// gl.activeTexture(gl.TEXTURE0);
	// gl.bindTexture(gl.TEXTURE_2D, texture);

	// //Applying texture filters
	// gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	// gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	// // Prevents s-coordinate wrapping (repeating).
	// gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	// // Prevents t-coordinate wrapping (repeating).
	// gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	// gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
	// gl.uniform1i(u_sampler, 0);

	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
	if (texUnit == 0)
	{
		gl.activeTexture(gl.TEXTURE0);
	} 
	else 
	{
		gl.activeTexture(gl.TEXTURE1);
	}
	gl.bindTexture(gl.TEXTURE_2D, texture);
	
	//Applying texture filters
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	// Prevents s-coordinate wrapping (repeating).
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	// Prevents t-coordinate wrapping (repeating).
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
	gl.uniform1i(u_sampler, texUnit);
}
