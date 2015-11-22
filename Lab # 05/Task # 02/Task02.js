RED_COLOR = [1.0, 0.0, 0.0, 1.0];
BLUE_COLOR = [0.0, 0.0, 1.0, 1.0];
GREEN_COLOR = [0.0, 1.0, 0.0, 1.0];
YELLOW_COLOR = [1.0, 1.0, 0.0, 1.0];

var timePrev = Date.now();
translateMat = [0, -0.8, 0];

userScore = 0;

acceleration = 0.003;
bulletAcceleration = 0.005;
protectorAcceleration = 0.004;
enemyJetAcceleration = 0.002;
enemyJetInstantiateProbability = 0.01;

collisionTolerance = 0.1;

var time, elapsed = 1;
var protectorAngle = 0;

bullets = [];

enemyJets = [];

function doKeyDown(e) {
	//console.log( e.keyCode );

	//If a pressed
	if(e.keyCode == 97)
	{
		translateX(false);
		//rotateZ(false);
	}

	//If d pressed
	else if(e.keyCode == 100)
	{
		translateX(true);
		//rotateZ(true);
	}

	//If w pressed
	else if(e.keyCode == 119)
	{
		//translateY(true);
	}

	//If s pressed
	else if(e.keyCode == 115)
	{
		//translateY(false);
	}

	//If f pressed
	else if(e.keyCode == 102)
	{
		fire();
	}
}

function translateX(isMovingRight)
{
	if(isMovingRight && (translateMat[0] < 1))
	{
		translateMat[0] += (acceleration * elapsed);
	}
	else if((!isMovingRight) && (translateMat[0] > -1))
	{
		translateMat[0] -= (acceleration * elapsed);
	}
}

function fire()
{
	var temp = [0,0,0];
	for(var i = 0; i < translateMat.length; i+=1)
	{
		temp[i] = translateMat[i];		
	}

	bullets.push(temp);
}

function instantiateJet()
{
	if(Math.random() <= enemyJetInstantiateProbability)
	{
		console.log("Jet");
		//Instantiate
		var positive = Math.random() >= 0.5;
		var amp = Math.random();
		var tempCoords = [0, 1, 0];

		if(positive)
		{
			tempCoords[0] = amp;
		}
		else
		{
			tempCoords[0] = -amp;
		}

		enemyJets.push(tempCoords);
	}
}

function animateEnemyJets()
{
	instantiateJet();

	var activeJets = [];
	//Iterate over all bullets
	for(var i = 0; i < enemyJets.length; i++)
	{
		if(enemyJets[i][1] > -1)
		{
			//Move in positive y axis since jet is inverted
			enemyJets[i][1] -= (enemyJetAcceleration * elapsed);
			activeJets.push(enemyJets[i]);
		}
	}

	enemyJets = activeJets;
}

function detectCollision()
{
	var remainingJets = [];
	var planeDestroyed = false;
	var destroyedBulletIndex = -1;

	//Check collision of bullets with enemy jets
	for(var i = 0; i < enemyJets.length; i++)
	{
		//Iterate over all bullets
		for(var j = 0; j < bullets.length; j++)
		{
			//Check if this any of the bullet is colliding the the current enemy jet

			//Check if in same span of x
			if(Math.abs(enemyJets[i][0] - bullets[j][0]) < collisionTolerance)
			{
				//Check if in same span of y
				if(Math.abs(enemyJets[i][1] - bullets[j][1]) < collisionTolerance)
				{
					//Collision
					planeDestroyed = true;
					destroyedBulletIndex = j;
					userScore++;
					document.getElementById("finalScore").innerHTML = userScore; 

					break;
				}	
			}
		}

		//Check if the user jet collided with the enemy jet
		if(Math.abs(enemyJets[i][0] - translateMat[0]) < collisionTolerance)
		{
			if(Math.abs(enemyJets[i][1] - translateMat[1]) < collisionTolerance)
			{
				var result = confirm("Game Over! Try again?");
				if(result)
				{
					window.location.reload();
				}
			}
		}

		if(!planeDestroyed)
		{
			remainingJets.push(enemyJets[i]);
		}
		else
		{
			planeDestroyed = false;

			//Destory the bullet
			var remainingBullets = [];
			for(var i = 0; i < bullets.length; i++)
			{
				if(i != destroyedBulletIndex)
				{
					remainingBullets.push(bullets[i]);
				}
			}

			bullets = remainingBullets;
		}
	}

	enemyJets = remainingJets;
}

function animateBullets()
{
	var activeBullets = [];
	//Iterate over all bullets
	for(var i = 0; i < bullets.length; i++)
	{
		if(bullets[i][1] < 1)
		{
			bullets[i][1] += (bulletAcceleration * elapsed);
			activeBullets.push(bullets[i]);
		}
	}

	bullets = activeBullets;
}

function translateY(isMovingUp)
{
	if(isMovingUp && (translateMat[1] < 1))
	{
		translateMat[1] += (acceleration * elapsed);
		//translateMat.push([0, acceleration, 0]);
	}
	else if((!isMovingUp) && (translateMat[1] > -1))
	{
		translateMat[1] -= (acceleration * elapsed);
		//translateMat.push([0, -acceleration, 0]);
	}
}

function main() {
  	var canvas = document.getElementById('webgl');
	var gl = getWebGLContext(canvas);
	if (!gl){
		console.log('Failed to find context');
	}

	document.getElementById("finalScore").innerHTML = userScore; 
	
	var program = initShaders( gl, "vertex-shader", "fragment-shader" );
	gl.useProgram (program);
	gl.program = program;

	window.addEventListener( "keypress", doKeyDown, false);
	
	var numberOfVertices = initVertices(program, gl);
	
	//render(gl, numberOfVertices);

	var params = { BulletAcceleration: 0.005, UnitAcceleration: 0.003, ProtectorAcceleration: 0.004, EnemyJetAcceleration: 0.002, EnemyInstantiateProbability: 0.05 };
    var gui = new dat.GUI();

	gui.add(params, 'BulletAcceleration', 0, 0.2).onChange(function(value)
	{
    	//Refresh based on the new value of params
    	bulletAcceleration = value;
	})

	gui.add(params, 'UnitAcceleration', 0, 0.2).onChange(function(value)
	{
    	//Refresh based on the new value of params
    	acceleration = value;
	})

	gui.add(params, 'ProtectorAcceleration', 0, 0.2).onChange(function(value)
	{
    	//Refresh based on the new value of params
    	protectorAcceleration = value;
	})

	gui.add(params, 'EnemyJetAcceleration', 0, 0.2).onChange(function(value)
	{
    	//Refresh based on the new value of params
    	enemyJetAcceleration = value;
	})

	gui.add(params, 'EnemyInstantiateProbability', 0, 0.8).onChange(function(value)
	{
    	//Refresh based on the new value of params
    	enemyJetInstantiateProbability = value;
	})

	var time, elapsed;
	var tick = function(){
		animate();
		animateBullets();
		detectCollision();
		animateEnemyJets();
		render(gl, numberOfVertices);
		requestAnimationFrame(tick)
	}
	tick();
}

function animate(){
	time = Date.now();
	elapsed = time - timePrev;
	timePrev = time;

	protectorAngle += (protectorAcceleration * elapsed);
}

function initTransformations(gl, modelMatrix, color){
	var transformationMatrix = gl.getUniformLocation(gl.program, 'transformationMatrix');
	gl.uniformMatrix4fv(transformationMatrix, false, flatten(modelMatrix));	

	var vertexColor = gl.getAttribLocation(gl.program, 'vertexColor');
	gl.vertexAttrib4f(vertexColor, color[0], color[1], color[2], color[3]);
}

function render (gl, numberOfVertices){
	gl.clearColor(1.0, 1.0, 1.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);

	mat4.identity(mvMatrix);

	mvPushMatrix();

	//Render User Jet
	mat4.translate(mvMatrix, mvMatrix, translateMat);
	mat4.scale(mvMatrix, mvMatrix, [2, 2, 1]);
	initTransformations(gl, mvMatrix, RED_COLOR);
	gl.drawArrays(gl.TRIANGLES, 0, numberOfVertices);

	mvPopMatrix();

	//Render User Jet protector
	mat4.translate(mvMatrix, mvMatrix, translateMat);
	mat4.rotateZ(mvMatrix, mvMatrix, protectorAngle);
	mat4.translate(mvMatrix, mvMatrix, [0, 0.2, 0]);
	initTransformations(gl, mvMatrix, YELLOW_COLOR);
	gl.drawArrays(gl.TRIANGLES, 0, numberOfVertices);

	//Render Bullets
	for(var i = 0; i < bullets.length; i++)
	{
		mat4.identity(mvMatrix);

		mat4.translate(mvMatrix, mvMatrix, bullets[i]);
		//mat4.scale(mvMatrix, mvMatrix, [2, 2, 1]);
		initTransformations(gl, mvMatrix, BLUE_COLOR);
		gl.drawArrays(gl.TRIANGLES, 0, numberOfVertices);
	}

	mat4.identity(mvMatrix);
	//mat4.scale(mvMatrix, mvMatrix, [2, 2, 1]);
	mvPushMatrix();

	//Render Enemy Jets
	for(var i = 0; i < enemyJets.length; i++)
	{
		mat4.translate(mvMatrix, mvMatrix, enemyJets[i]);
		mat4.rotateZ(mvMatrix, mvMatrix, Math.PI);
		mat4.scale(mvMatrix, mvMatrix, [2, 2, 1]);
		initTransformations(gl, mvMatrix, GREEN_COLOR);
		gl.drawArrays(gl.TRIANGLES, 0, numberOfVertices);

		mvPopMatrix();
		mvPushMatrix();
	}
}

function initVertices(program, gl){
	//render vertices
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

