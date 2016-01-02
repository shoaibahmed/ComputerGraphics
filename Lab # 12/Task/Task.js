var perspectiveCamera, orthographicCamera, camera;
var renderer;
var completeScene, scene;
var meshCube, meshSphere, plane;

var pivot;
var ambientLight, directionalLight, spotLight;

var params = { perspectiveCamera: true, orthographicCamera: false, 
	ambientLight: true, directionalLight: true, spotLight: true, directionalLightIntensity: 0.5, spotLightIntensity: 0.5 };

init();
animate();

function init() {
	// Perspective Camera
	perspectiveCamera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
	perspectiveCamera.position.y = 200;
	perspectiveCamera.position.z = 1000;

	// Orthographic Camera
	orthographicCamera = new THREE.OrthographicCamera( window.innerWidth / -2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / -2, 1, 10000 );
	orthographicCamera.position.z = 400;

	// Set perspective camera as default
	camera = perspectiveCamera;

	// Complete Scene
	completeScene = new THREE.Scene();
	addCube(completeScene);
	addSphere(completeScene);
	addPlane(completeScene);
	addLighting(completeScene);

	// Set complete scene as the default one
	scene = completeScene;
	//scene.fog = new THREE.Fog(0xffffff, 900, 1100);

	// Renderer
	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.shadowMapEnabled = true;
	document.body.appendChild( renderer.domElement );

	setupGUI();

	window.addEventListener( 'resize', onWindowResize, false );
}

function setupGUI()
{
	//Add GUI elements
	var gui = new dat.GUI();

	gui.add(params, 'perspectiveCamera').listen().onChange(function(value)
	{
		params.perspectiveCamera = true;
		params.orthographicCamera = false;

		camera = perspectiveCamera;
	});

	gui.add(params, 'orthographicCamera').listen().onChange(function(value)
	{
		params.perspectiveCamera = false;
		params.orthographicCamera = true;

		camera = orthographicCamera;
	});

	gui.add(params, 'ambientLight').listen().onChange(function(value)
	{
		if(value)
			scene.add(ambientLight);
		else
			scene.remove(ambientLight);
	});

	gui.add(params, 'directionalLight').listen().onChange(function(value)
	{
		if(value)
			scene.add(directionalLight);
		else
			scene.remove(directionalLight);
	});

	gui.add(params, 'spotLight').listen().onChange(function(value)
	{
		if(value)
			scene.add(spotLight);
		else
			scene.remove(spotLight);
	});

	gui.add(params, 'directionalLightIntensity', 0, 1).onChange(function(value)
	{
		directionalLight.castShadow = false;
		scene.remove(directionalLight);

		// Directional Light
		directionalLight = new THREE.DirectionalLight( 0xffffff, value );
		directionalLight.castShadow = true;
		directionalLight.position.set( 0, 200, 400 );

		scene.add( directionalLight );
	});

	gui.add(params, 'spotLightIntensity', 0, 1).onChange(function(value)
	{
		spotLight.castShadow = false;
		scene.remove(spotLight);

		// Spot Light
		spotLight = new THREE.SpotLight( 0xffffff, value );
		spotLight.castShadow = true;
		spotLight.position.set( 0, 1000, 0 );

		scene.add( spotLight );
	});
}

function addPlane(myScene)
{
	var geometry = new THREE.PlaneGeometry( 50000, 50000 );
	var material = new THREE.MeshPhongMaterial( {color: 0x444444, side: THREE.DoubleSide} );
	plane = new THREE.Mesh( geometry, material );

	plane.position.y = -500;
	plane.rotation.x = Math.PI / 2;
	plane.receiveShadow = true;

	myScene.add( plane );
}

function addCube(myScene)
{
	var geometryCube = new THREE.BoxGeometry( 100, 100, 100 );
	var materialCube = new THREE.MeshPhongMaterial( { color: 0x881111 } );

	meshCube = new THREE.Mesh( geometryCube, materialCube );
	meshCube.castShadow = true;
	myScene.add( meshCube );
}

function addSphere(myScene)
{
	var geometrySphere = new THREE.SphereGeometry( 50, 200, 200 );
	var materialSphere = new THREE.MeshPhongMaterial( { color: 0x881111 } );

	meshSphere = new THREE.Mesh( geometrySphere, materialSphere );
	meshSphere.castShadow = true;
	meshSphere.position.x = 200;

	pivot = new THREE.Object3D();
	pivot.add( meshSphere );
	myScene.add(pivot);
}

function addLighting(myScene)
{
	// Ambient Light
	ambientLight = new THREE.AmbientLight( 0x404040 ); // soft white light
	myScene.add( ambientLight );

	// Directional Light
	directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
	directionalLight.position.set( 0, 200, 400 );
	directionalLight.castShadow = true;
	myScene.add( directionalLight );

	// Spot light
	spotLight = new THREE.SpotLight( 0xffffff, 0.5 );
	spotLight.position.set( 0, 1000, 0 );
	spotLight.castShadow = true;
	myScene.add( spotLight );
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
	requestAnimationFrame( animate );

	meshCube.rotation.x += 0.005;
	meshCube.rotation.y += 0.01;

	pivot.rotation.x += 0.005;
	pivot.rotation.y += 0.01;

	renderer.render( scene, camera );
}
