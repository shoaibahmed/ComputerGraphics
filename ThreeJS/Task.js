// once everything is loaded, we run our Three.js stuff.
$(function () {

    var stats = initStats();

    // create a scene, that will hold all our elements such as objects, cameras and lights.
    var scene = new THREE.Scene();

    // create a camera, which defines where we're looking at.
    var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

    // create a render and set the size
    var webGLRenderer = new THREE.WebGLRenderer();
    webGLRenderer.setClearColor(new THREE.Color(0xEEEEEE, 1.0));
    webGLRenderer.setSize(window.innerWidth, window.innerHeight);
    webGLRenderer.shadowMapEnabled = true;

    // position and point the camera to the center of the scene
    camera.position.x = -30;
    camera.position.y = 40;
    camera.position.z = 50;
    camera.lookAt(new THREE.Vector3(0, 10, 0));


    // add spotlight for the shadows
    var spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(0, 50, 30);
    spotLight.intensity = 2;
    scene.add(spotLight);

    // add the output of the renderer to the html element
    $("#WebGL-output").append(webGLRenderer.domElement);

    // call the render function
    var step = 0;

    // setup the control gui
    var controls = new function () {
        // we need the first child, since it's a multimaterial
    }

    var gui = new dat.GUI();
    var mesh;

    var loader = new THREE.JSONLoader();
    loader.load('./models/birdie.json', function (geometry, mat) {
        var material = new THREE.MeshFaceMaterial( mat );
        mesh = new THREE.Mesh(geometry, material);

        //mesh.scale.set(15,15,15);
        mesh.scale.set(1,1,1);

        scene.add(mesh);

    });


    render();


    function render() {
        stats.update();

        if (mesh) {
            mesh.rotation.y += 0.02;
        }


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
});