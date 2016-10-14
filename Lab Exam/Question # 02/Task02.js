// once everything is loaded, we run our Three.js stuff.
$(function () {

    var stats = initStats();
    var rotationLimit = Math.PI * 2;

    // create a scene, that will hold all our elements such as objects, cameras and lights.
    var scene = new THREE.Scene();

    var camera;
    addCamera();

    // create a render and set the size
    var webGLRenderer = new THREE.WebGLRenderer();
    webGLRenderer.setClearColor(new THREE.Color(0xEEEEEE, 1.0));
    webGLRenderer.setSize(window.innerWidth, window.innerHeight);
    webGLRenderer.shadowMapEnabled = true;

    // add the output of the renderer to the html element
    $("#WebGL-output").append(webGLRenderer.domElement);

    // call the render function
    var step = 0;

    var params = { spotLightX: 0, spotLightY: 100, spotLightZ: 30, modelRotatationX: 0, modelRotatationY: 0, modelRotatationZ: 0,
                    modelScaleX: 2, modelScaleY: 2, modelScaleZ: 2, phongIllumination: true, gauraudShading: false };
    params.cloneModel = function()
    {
        //console.log("clone");
        addModel();
    }

    setupGUI();

    var meshIndex = -1;
    var meshes = [];
    addModel();

    var spotLight;
    addSpotLight();

    var plane;
    addPlane();

    var meshCube;
    //addCube();

    render();

    function render() {
        stats.update();

        // render using requestAnimationFrame
        requestAnimationFrame(render);
        webGLRenderer.render(scene, camera);
    }

    function initStats() {

        var stats = new Stats();
        stats.setMode(0); // 0: fps, 1: ms

        // Align top-left
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.left = '0px';
        stats.domElement.style.top = '0px';

        $("#Stats-output").append(stats.domElement);

        return stats;
    }

    function addCamera()
    {
        // create a camera, which defines where we're looking at.
        camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

        // position and point the camera to the center of the scene
        camera.position.x = 0;
        camera.position.y = 100;
        camera.position.z = 150;
        camera.lookAt(new THREE.Vector3(0, 0, 0));
    }

    function addPlane()
    {
        var geometry = new THREE.PlaneGeometry( 50000, 50000 );
        var material;

        if(params.phongIllumination)
        {
            material = new THREE.MeshPhongMaterial( {color: 0xffffff, side: THREE.DoubleSide} );
        }
        else
        {
            material = new THREE.MeshLambertMaterial( {color: 0xffffff, side: THREE.DoubleSide} );
        }

        plane = new THREE.Mesh( geometry, material );

        plane.position.y = -100;
        plane.rotation.x = Math.PI / 2;
        plane.receiveShadow = true;

        scene.add( plane );
    }

    function addCube()
    {
        var geometryCube = new THREE.CubeGeometry( 10,10,10 );

        var materialCube;
        if(params.phongIllumination)
        {
            material = new THREE.MeshPhongMaterial( { color: 0x881111 } );
        }
        else
        {
            material = new THREE.MeshLambertMaterial( { color: 0x881111 } );
        }

        meshCube = new THREE.Mesh( geometryCube, materialCube );
        meshCube.castShadow = true;
        meshCube.position.set(0,0,0);

        scene.add( meshCube );
    }

    function addModel()
    {
        meshIndex++;

        var loader = new THREE.JSONLoader();
        loader.load('./models/birdie.json', function (geometry, mat) {
            var material = new THREE.MeshFaceMaterial( mat );
            meshes.push(new THREE.Mesh(geometry, material));

            meshes[meshIndex].scale.set(params.modelScaleX, params.modelScaleY, params.modelScaleZ);
            meshes[meshIndex].castShadow = true;

            var distanceFactor = 25;
            meshes[meshIndex].position.set(Math.random() * distanceFactor, Math.random() * distanceFactor, Math.random() * distanceFactor);

            scene.add(meshes[meshIndex]);
        });
    }

    function addSpotLight()
    {
        // add spotlight for the shadows
        spotLight = new THREE.SpotLight(0xffffff);
        spotLight.position.set(params.spotLightX, params.spotLightY, params.spotLightZ);
        spotLight.intensity = 2;
        spotLight.castShadow = true;
        scene.add(spotLight);
    }

    function setModelRotation()
    {
        for(i = 0; i <= meshIndex; i++)
        {
            meshes[i].rotation.set(params.modelRotatationX, params.modelRotatationY, params.modelRotatationZ);
        }
        
    }

    function setModelScale()
    {
        for(i = 0; i <= meshIndex; i++)
        {
            meshes[i].scale.set(params.modelScaleX, params.modelScaleY, params.modelScaleZ);
        }
    }

    function setupGUI()
    {
        //Add GUI elements
        var gui = new dat.GUI();

        gui.add(params, 'spotLightX', -100, 100).onChange(function(value)
        {
            scene.remove(spotLight);
            addSpotLight();
        });

        gui.add(params, 'spotLightY', -100, 100).onChange(function(value)
        {
            scene.remove(spotLight);
            addSpotLight();
        });

        gui.add(params, 'spotLightZ', -100, 100).onChange(function(value)
        {
            scene.remove(spotLight);
            addSpotLight();
        });

        gui.add(params, 'modelRotatationX', -rotationLimit, rotationLimit).onChange(function(value)
        {
            setModelRotation();
        });

        gui.add(params, 'modelRotatationY', -rotationLimit, rotationLimit).onChange(function(value)
        {
            setModelRotation();
        });

        gui.add(params, 'modelRotatationZ', -rotationLimit, rotationLimit).onChange(function(value)
        {
            setModelRotation();
        });

        gui.add(params, 'modelScaleX', 1, 100).onChange(function(value)
        {
            setModelScale();
        });

        gui.add(params, 'modelScaleY', 1, 100).onChange(function(value)
        {
            setModelScale();
        });

        gui.add(params, 'modelScaleZ', 1, 100).onChange(function(value)
        {
            setModelScale();
        });

        gui.add(params, 'phongIllumination').listen().onChange(function(value)
        {
            params.phongIllumination = true;
            params.gauraudShading = false;

            scene.remove(plane);
            addPlane();
        });

        gui.add(params, 'gauraudShading').listen().onChange(function(value)
        {
            params.phongIllumination = false;
            params.gauraudShading = true;

            scene.remove(plane);
            addPlane();
        });

        gui.add(params, 'cloneModel');
    }
});