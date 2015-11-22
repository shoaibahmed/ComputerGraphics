var timePrev = Date.now();

function main() {
  	var canvas = document.getElementById('webgl');
	var gl = getWebGLContext(canvas);
	if (!gl){
		console.log('Failed to find context');
	}
	
	var program = initShaders( gl, "vertex-shader", "fragment-shader" );
	gl.useProgram (program);
	gl.program = program;

	projectionMatrix = mat4.create();
	viewMatrix = mat4.create();
	currentProjection = 1;

	//Initialize the UI
	var params = { OrthoLeft: 1.0, OrthoRight: 1.0, OrthoBottom: 1.0, OrthoTop: 1.0, OrthoNear: 0.0, OrthoFar: -15.0, 
					PerspectiveVertAngle: Math.PI / 4, PerspectiveNear: 1.0, PerspectiveFar: 15.0,
					EyeX: 0.0, EyeY: 0.0, EyeZ: 1.0, CenterX: 0.0, CenterY: 0.0, CenterZ: 1.0, UpX: 0.0, UpY: 1.0, UpZ: 0.0};
	params.ToggleProjection = 
		function() 
		{
			currentProjection = toggleProjection(gl, currentProjection, projectionMatrix, params);
		}

    var gui = new dat.GUI();

    //Ortho
	gui.add(params, 'OrthoLeft', -10.0, 10.0).onChange(function() { currentProjection = changeParamsOrtho(gl, projectionMatrix, params); } );
	gui.add(params, 'OrthoRight', -10.0, 10.0).onChange(function() { currentProjection = changeParamsOrtho(gl, projectionMatrix, params); } );
	gui.add(params, 'OrthoBottom', -10.0, 10.0).onChange(function() { currentProjection = changeParamsOrtho(gl, projectionMatrix, params); } );
	gui.add(params, 'OrthoTop', -10.0, 10.0).onChange(function() { currentProjection = changeParamsOrtho(gl, projectionMatrix, params); } );
	gui.add(params, 'OrthoNear', -10.0, 10.0).onChange(function() { currentProjection = changeParamsOrtho(gl, projectionMatrix, params); } );
	gui.add(params, 'OrthoFar', -20.0, 20.0).onChange(function() { currentProjection = changeParamsOrtho(gl, projectionMatrix, params); } );

	//Perspective
	gui.add(params, 'PerspectiveVertAngle', 0.0, Math.PI).onChange(function() { currentProjection = changeParamsPerspective(gl, projectionMatrix, params); } );
	gui.add(params, 'PerspectiveNear', -10.0, 10.0).onChange(function() { currentProjection = changeParamsPerspective(gl, projectionMatrix, params); } );
	gui.add(params, 'PerspectiveFar', -20.0, 20.0).onChange(function() { currentProjection = changeParamsPerspective(gl, projectionMatrix, params); } );

	//Camera
	gui.add(params, 'EyeX', 0.0, 1.0).onChange(function() { changeCamera(gl, viewMatrix, params); } );
	gui.add(params, 'EyeY', 0.0, 1.0).onChange(function() { changeCamera(gl, viewMatrix, params); } );
	gui.add(params, 'EyeZ', 0.0, 1.0).onChange(function() { changeCamera(gl, viewMatrix, params); } );
	gui.add(params, 'CenterX', 0.0, 1.0).onChange(function() { changeCamera(gl, viewMatrix, params); } );
	gui.add(params, 'CenterY', 0.0, 1.0).onChange(function() { changeCamera(gl, viewMatrix, params); } );
	gui.add(params, 'CenterZ', 0.0, 1.0).onChange(function() { changeCamera(gl, viewMatrix, params); } );
	gui.add(params, 'UpX', 0.0, 1.0).onChange(function() { changeCamera(gl, viewMatrix, params); } );
	gui.add(params, 'UpY', 0.0, 1.0).onChange(function() { changeCamera(gl, viewMatrix, params); } );
	gui.add(params, 'UpZ', 0.0, 1.0).onChange(function() { changeCamera(gl, viewMatrix, params); } );

	gui.add(params, 'ToggleProjection');

	//Initialize the view 
	changeCamera(gl, viewMatrix, params);
	//mat4.lookAt(viewMatrix, [0,0,1], [0,0,1], [0,1,0]);
	//initView(gl, viewMatrix);

	currentProjection = toggleProjection(gl, currentProjection, projectionMatrix, params);
	
	var numberOfVertices = initVertices(program, gl);

	var currentangle = 0.0;
	var time, elapsed;
	var tick = function(){
		currentangle = animate(currentangle, time, elapsed);
		render(gl, numberOfVertices, currentangle);
		requestAnimationFrame(tick)
	}
	tick();
}

function changeParamsOrtho(gl, projectionMatrix, params)
{
	//mat4.ortho(projectionMatrix, params.OrthoLeft, params.OrthoRight, params.OrthoBottom, params.OrthoTop, params.OrthoNear, params.OrthoFar);
	mat4.ortho(projectionMatrix, -params.OrthoLeft, params.OrthoRight, -params.OrthoBottom, params.OrthoTop, params.OrthoNear, -params.OrthoFar);
	initProjection(gl, projectionMatrix);
	return 0;
}

function changeParamsPerspective(gl, projectionMatrix, params)
{
	mat4.perspective(projectionMatrix, params.PerspectiveVertAngle, 1.0, params.PerspectiveNear, params.PerspectiveFar);
	initProjection(gl, projectionMatrix);
	return 1;
}

function changeCamera(gl, viewMatrix, params)
{
	mat4.lookAt(viewMatrix, [params.EyeX, params.EyeY, params.EyeZ], [params.CenterX, params.CenterY, params.CenterZ], [params.UpX, params.UpY, params.UpZ]);
	initView(gl, viewMatrix);
}

function toggleProjection(gl, currentProjection, projectionMatrix, params)
{
	if(currentProjection == 0)
	{
		//Apply Perspective
		currentProjection = 1;
		mat4.perspective(projectionMatrix, params.PerspectiveVertAngle, 1.0, params.PerspectiveNear, -params.PerspectiveFar);
		initProjection(gl, projectionMatrix);
	}
	else
	{
		//Apply Ortho
		currentProjection = 0;
		mat4.ortho(projectionMatrix, -params.OrthoLeft, params.OrthoRight, -params.OrthoBottom, params.OrthoTop, params.OrthoNear, -params.OrthoFar);
		initProjection(gl, projectionMatrix);
	}

	return currentProjection;
}

function animate(currentangle, time, elapsed){
	time = Date.now();
	elapsed = time - timePrev;
	timePrev = time;

	return (currentangle + (elapsed / 1000));
}

function render (gl, numberOfVertices, currentangle)
{
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);

	//mvMatrix = mat4.create();
	mat4.identity(mvMatrix);
	mvPushMatrix();

	//First Cube
	mat4.translate(mvMatrix, mvMatrix, [-0.5, 0.0, -3.0]);
	mat4.rotate(mvMatrix, mvMatrix, currentangle, [1, 1, 1]);
	mat4.scale(mvMatrix, mvMatrix, [0.5, 0.5, 0.5]);
	initTransformations(gl, mvMatrix);
	gl.drawArrays(gl.LINE_STRIP, 0, numberOfVertices);

	mat4.identity(mvMatrix);

	//Second Cube
	mvPopMatrix();
	mat4.translate(mvMatrix, mvMatrix, [0.5, 0.0, -10.0]);
	mat4.rotate(mvMatrix, mvMatrix, -currentangle, [1, 1, 1]);
	mat4.scale(mvMatrix, mvMatrix, [0.5, 0.5, 0.5]);
	initTransformations(gl, mvMatrix);
	gl.drawArrays(gl.LINE_STRIP, 0, numberOfVertices);
}

function initVertices(program, gl){
	var vertices = 
				[
					0.5, -0.5, 0.5, 
					0.5, 0.5, 0.5, 
					-0.5, 0.5, 0.5,
					-0.5, -0.5, 0.5,
					0.5, -0.5, 0.5,

					0.5, -0.5, -0.5,
					0.5, 0.5, -0.5, 
					-0.5, 0.5, -0.5,
					-0.5, -0.5, -0.5,
					0.5, -0.5, -0.5,

					-0.5, -0.5, -0.5,
					-0.5, -0.5, 0.5,

					-0.5, 0.5, 0.5,
					-0.5, 0.5, -0.5,

					0.5, 0.5, -0.5, 
					0.5, 0.5, 0.5 
				];

	var noOfDim = 3;
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
