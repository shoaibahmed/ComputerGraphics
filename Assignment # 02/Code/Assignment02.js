//Dat.GUI
var params = {};

//Look at location
var lx = 0.0;
var ly = 0.0;
var lz = -1.0;

//Position of Camera
var x = 0.0;
var y = 10.0;
var z = 100.0;

//Orientation of Camera
var upX = 0.0;
var upY = 1.0;
var upZ = 0.0;
var cameraAngle = 0.0;

//Camera movement
var angle = 0.0;
var verticalAngle = 0.0;

params.userForwardAcceleration = 0.5;
params.userVerticalRotationAcceleration = 0.01;
params.userHorizontalRotationAcceleration = 0.01;
params.userUpVectorRotationAcceleration = 0.01;

//Perspective Projection
var frontClippingPlane = 0.01;
var backClippingPlane = 1000.0;

var viewMatrix = mat4.create();

//Planets
params.sunOwnAxisAngularVelocity = 0.002;
params.mercuryAngularVelocity = 0.007;
params.mercuryOwnAxisAngularVelocity = 0.00075;
params.venusAngularVelocity = 0.0035;
params.venusOwnAxisAngularVelocity = 0.0001;
params.earthAngularVelocity = 0.002;
params.earthOwnAxisAngularVelocity = 0.005;
params.moonAngularVelocity = 0.1;
params.moonOwnAxisAngularVelocity = 0.1;
params.marsAngularVelocity = 0.0005;
params.marsOwnAxisAngularVelocity = 0.003;
params.jupiterAngularVelocity = 0.02;
params.jupiterOwnAxisAngularVelocity = 0.01;
params.saturnAngularVelocity = 0.01;
params.saturnOwnAxisAngularVelocity = 0.05;
params.uranusAngularVelocity = 0.0075;
params.uranusOwnAxisAngularVelocity = 0.0075;
params.neptuneAngularVelocity = 0.0045;
params.neptuneOwnAxisAngularVelocity = 0.009;
params.plutoAngularVelocity = 0.003;
params.plutoOwnAxisAngularVelocity = 0.001;

var sunRotationAngle = 0.0;
var mercuryRotationAngle = 0.0;
var mercuryOwnAxisRotationAngle = 0.0;
var venusRotationAngle = 0.0;
var venusOwnAxisRotationAngle = 0.0;
var earthRotationAngle = 0.0;
var earthOwnAxisRotationAngle = 0.0;
var moonRotationAngle = 0.0;
var moonOwnAxisRotationAngle = 0.0;
var marsRotationAngle = 0.0;
var marsOwnAxisRotationAngle = 0.0;
var jupiterRotationAngle = 0.0;
var jupiterOwnAxisRotationAngle = 0.0;
var saturnRotationAngle = 0.0;
var saturnOwnAxisRotationAngle = 0.0;
var uranusRotationAngle = 0.0;
var uranusOwnAxisRotationAngle = 0.0;
var neptuneRotationAngle = 0.0;
var neptuneOwnAxisRotationAngle = 0.0;
var plutoRotationAngle = 0.0;
var plutoOwnAxisRotationAngle = 0.0;

params.mercuryDistanceFromSun = 15;
params.venusDistanceFromSun = 20;
params.earthDistanceFromSun = 28;
params.moonDistanceFromEarth = 2;
params.marsDistanceFromSun = 36;
params.jupiterDistanceFromSun = 44;
params.saturnDistanceFromSun = 62;
params.uranusDistanceFromSun = 60;
params.neptuneDistanceFromSun = 68;
params.plutoDistanceFromSun = 76;

params.sunScalingFactor = 4.0;
params.mercuryScalingFactor = 0.2;
params.venusScalingFactor = 0.4;
params.earthScalingFactor = 0.5;
params.moonScalingFactor = 0.1;
params.marsScalingFactor = 0.3;
params.jupiterScalingFactor = 1.5;
params.saturnScalingFactor = 1.0;
params.uranusScalingFactor = 0.8;
params.neptuneScalingFactor = 0.75;
params.plutoScalingFactor = 0.2;

//OpenGL program
var gl;
var shaderProgram;
var animate = false;
params.pauseAnimation = false;

//Buffers
var vertexPositionBuffer;
var vertexTextureCoordBuffer;
var vertexIndexBuffer;

//Textures
var moonTexture;
var sunTexture;
var earthTexture;

var marsTexture;
var saturnTexture;
var plutoTexture;
var neptuneTexture;
var uranusTexture;
var venusTexture;
var mercuryTexture;
var jupiterTexture;

var texturesLoaded = 0;
var NUMBER_OF_TEXTURES = 10;

function initGL(canvas) 
{
    try 
    {
        gl = canvas.getContext("experimental-webgl");
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    } 
    catch (e) 
    {
    }
    if (!gl) 
    {
        alert("Could not initialise WebGL, sorry :-(");
    }
}

function getShader(gl, id) 
{
    var shaderScript = document.getElementById(id);
    if (!shaderScript) {
        return null;
    }

    var str = "";
    var k = shaderScript.firstChild;
    while (k) {
        if (k.nodeType == 3) {
            str += k.textContent;
        }
        k = k.nextSibling;
    }

    var shader;
    if (shaderScript.type == "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

function initShaders() 
{
    var fragmentShader = getShader(gl, "shader-fs");
    var vertexShader = getShader(gl, "shader-vs");

    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }

    gl.useProgram(shaderProgram);

    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

    shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
    gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");

    shaderProgram.sunSamplerUniform = gl.getUniformLocation(shaderProgram, "uSunSampler");
    shaderProgram.earthSamplerUniform = gl.getUniformLocation(shaderProgram, "uEarthSampler");
    shaderProgram.moonSamplerUniform = gl.getUniformLocation(shaderProgram, "uMoonSampler");

    shaderProgram.marsSamplerUniform = gl.getUniformLocation(shaderProgram, "uMarsSampler");
    shaderProgram.saturnSamplerUniform = gl.getUniformLocation(shaderProgram, "uSaturnSampler");
    shaderProgram.plutoSamplerUniform = gl.getUniformLocation(shaderProgram, "uPlutoSampler");
    shaderProgram.neptuneSamplerUniform = gl.getUniformLocation(shaderProgram, "uNeptuneSampler");
    shaderProgram.uranusSamplerUniform = gl.getUniformLocation(shaderProgram, "uUranusSampler");
    shaderProgram.venusSamplerUniform = gl.getUniformLocation(shaderProgram, "uVenusSampler");
    shaderProgram.mercurySamplerUniform = gl.getUniformLocation(shaderProgram, "uMercurySampler");
    shaderProgram.jupiterSamplerUniform = gl.getUniformLocation(shaderProgram, "uJupiterSampler");

    shaderProgram.samplerSelectorUniform = gl.getUniformLocation(shaderProgram, "uSamplerSelector");
}

function handleLoadedTexture(texture) 
{
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);

    gl.bindTexture(gl.TEXTURE_2D, null);

    //Bind buffer data (Will only bind data once all the textures are loaded)
    bindBufferData();
}

function initTexture() 
{
    //Moon Texture
    // moonTexture = gl.createTexture();
    // moonTexture.image = new Image();
    // moonTexture.image.onload = function () {
    //     handleLoadedTexture(moonTexture)
    // }

    // moonTexture.image.src = "moon.jpg";

    //Earth Texture
    earthTexture = gl.createTexture();
    earthTexture.image = new Image();
    earthTexture.image.onload = function () {
        handleLoadedTexture(earthTexture)
    }

    earthTexture.image.src = "earth.jpg";

    //Sun Texture
    sunTexture = gl.createTexture();
    sunTexture.image = new Image();
    sunTexture.image.onload = function () {
        handleLoadedTexture(sunTexture)
    }

    sunTexture.image.src = "sun.jpg";

    //Mars Texture
    marsTexture = gl.createTexture();
    marsTexture.image = new Image();
    marsTexture.image.onload = function () {
        handleLoadedTexture(marsTexture)
    }

    marsTexture.image.src = "mars.jpg";

    //Saturn Texture
    saturnTexture = gl.createTexture();
    saturnTexture.image = new Image();
    saturnTexture.image.onload = function () {
        handleLoadedTexture(saturnTexture)
    }

    saturnTexture.image.src = "saturn.jpg";

    //Pluto Texture
    plutoTexture = gl.createTexture();
    plutoTexture.image = new Image();
    plutoTexture.image.onload = function () {
        handleLoadedTexture(plutoTexture)
    }

    plutoTexture.image.src = "pluto.jpg";

    //Neptune Texture
    neptuneTexture = gl.createTexture();
    neptuneTexture.image = new Image();
    neptuneTexture.image.onload = function () {
        handleLoadedTexture(neptuneTexture)
    }

    neptuneTexture.image.src = "neptune.jpg";

    //Uranus Texture
    uranusTexture = gl.createTexture();
    uranusTexture.image = new Image();
    uranusTexture.image.onload = function () {
        handleLoadedTexture(uranusTexture)
    }

    uranusTexture.image.src = "uranus.jpg";

    //Venus Texture
    venusTexture = gl.createTexture();
    venusTexture.image = new Image();
    venusTexture.image.onload = function () {
        handleLoadedTexture(venusTexture)
    }

    venusTexture.image.src = "venus.jpg";

    //Mercury Texture
    mercuryTexture = gl.createTexture();
    mercuryTexture.image = new Image();
    mercuryTexture.image.onload = function () {
        handleLoadedTexture(mercuryTexture)
    }

    mercuryTexture.image.src = "mercury.jpg";

    //Jupiter Texture
    jupiterTexture = gl.createTexture();
    jupiterTexture.image = new Image();
    jupiterTexture.image.onload = function () {
        handleLoadedTexture(jupiterTexture)
    }

    jupiterTexture.image.src = "jupiter.jpg";
}

function bindBufferData()
{
    //Bind data only when all the textures are loaded
    texturesLoaded += 1;

    if(texturesLoaded != NUMBER_OF_TEXTURES)
    {
        return;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexTextureCoordBuffer);
    gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, vertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertexIndexBuffer);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, sunTexture);
    gl.uniform1i(shaderProgram.sunSamplerUniform, 0);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, mercuryTexture);
    gl.uniform1i(shaderProgram.mercurySamplerUniform, 1);

    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, venusTexture);
    gl.uniform1i(shaderProgram.venusSamplerUniform, 2);

    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, earthTexture);
    gl.uniform1i(shaderProgram.earthSamplerUniform, 3);

    // gl.activeTexture(gl.TEXTURE2);
    // gl.bindTexture(gl.TEXTURE_2D, moonTexture);
    // gl.uniform1i(shaderProgram.moonSamplerUniform, 2);

    gl.activeTexture(gl.TEXTURE4);
    gl.bindTexture(gl.TEXTURE_2D, marsTexture);
    gl.uniform1i(shaderProgram.marsSamplerUniform, 4);

    gl.activeTexture(gl.TEXTURE5);
    gl.bindTexture(gl.TEXTURE_2D, jupiterTexture);
    gl.uniform1i(shaderProgram.jupiterSamplerUniform, 5);

    gl.activeTexture(gl.TEXTURE6);
    gl.bindTexture(gl.TEXTURE_2D, saturnTexture);
    gl.uniform1i(shaderProgram.saturnSamplerUniform, 6);

    gl.activeTexture(gl.TEXTURE7);
    gl.bindTexture(gl.TEXTURE_2D, uranusTexture);
    gl.uniform1i(shaderProgram.uranusSamplerUniform, 7);

    gl.activeTexture(gl.TEXTURE8);
    gl.bindTexture(gl.TEXTURE_2D, neptuneTexture);
    gl.uniform1i(shaderProgram.neptuneSamplerUniform, 8);

    gl.activeTexture(gl.TEXTURE9);
    gl.bindTexture(gl.TEXTURE_2D, plutoTexture);
    gl.uniform1i(shaderProgram.plutoSamplerUniform, 9);


    //Allow the draw function to be called for rendering
    animate = true;
}

function initBuffers() 
{
    var latitudeBands = 30;
    var longitudeBands = 30;
    var radius = 2;

    var vertexPositionData = [];
    //var normalData = [];
    var textureCoordData = [];
    for (var latNumber=0; latNumber <= latitudeBands; latNumber++) {
        var theta = latNumber * Math.PI / latitudeBands;
        var sinTheta = Math.sin(theta);
        var cosTheta = Math.cos(theta);

        for (var longNumber=0; longNumber <= longitudeBands; longNumber++) {
            var phi = longNumber * 2 * Math.PI / longitudeBands;
            var sinPhi = Math.sin(phi);
            var cosPhi = Math.cos(phi);

            var x = cosPhi * sinTheta;
            var y = cosTheta;
            var z = sinPhi * sinTheta;
            var u = 1 - (longNumber / longitudeBands);
            var v = 1 - (latNumber / latitudeBands);

            textureCoordData.push(u);
            textureCoordData.push(v);
            vertexPositionData.push(radius * x);
            vertexPositionData.push(radius * y);
            vertexPositionData.push(radius * z);
        }
    }

    var indexData = [];
    for (var latNumber=0; latNumber < latitudeBands; latNumber++) {
        for (var longNumber=0; longNumber < longitudeBands; longNumber++) {
            var first = (latNumber * (longitudeBands + 1)) + longNumber;
            var second = first + longitudeBands + 1;
            indexData.push(first);
            indexData.push(second);
            indexData.push(first + 1);

            indexData.push(second);
            indexData.push(second + 1);
            indexData.push(first + 1);
        }
    }

    vertexTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexTextureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordData), gl.STATIC_DRAW);
    vertexTextureCoordBuffer.itemSize = 2;
    vertexTextureCoordBuffer.numItems = textureCoordData.length / 2;

    vertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositionData), gl.STATIC_DRAW);
    vertexPositionBuffer.itemSize = 3;
    vertexPositionBuffer.numItems = vertexPositionData.length / 3;

    vertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertexIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), gl.STATIC_DRAW);
    vertexIndexBuffer.itemSize = 1;
    vertexIndexBuffer.numItems = indexData.length;
}

function drawScene() 
{
    if(animate)
    {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        //Set view matrix
        mat4.lookAt(viewMatrix, [x, y, z], [x+lx, y+ly,  z+lz], [upX, upY, upZ]);

        // uniform sampler2D uSunSampler;
        // uniform sampler2D uMercurySampler;
        // uniform sampler2D uVenusSampler;
        // uniform sampler2D uEarthSampler;
        // uniform sampler2D uMoonSampler;
        // uniform sampler2D uMarsSampler;
        // uniform sampler2D uJupiterSampler;
        // uniform sampler2D uSaturnSampler;
        // uniform sampler2D uUranusSampler;
        // uniform sampler2D uNeptuneSampler;
        // uniform sampler2D uPlutoSampler;

        /* SUN */
        gl.uniform1i(shaderProgram.samplerSelectorUniform, 1);

        mat4.identity(mvMatrix);
        if(!params.pauseAnimation)
        {
            sunRotationAngle += params.sunOwnAxisAngularVelocity;    
        }
        
        mat4.rotate(mvMatrix, mvMatrix, sunRotationAngle, [0, 1, 0]);
        mat4.scale(mvMatrix, mvMatrix, [params.sunScalingFactor, params.sunScalingFactor, params.sunScalingFactor]);
        mat4.multiply(mvMatrix, viewMatrix, mvMatrix);

        initMVMatrix();
        gl.drawElements(gl.TRIANGLES, vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);


        /* MERCURY */
        gl.uniform1i(shaderProgram.samplerSelectorUniform, 2);

        mat4.identity(mvMatrix);
        if(!params.pauseAnimation)
        {
            mercuryRotationAngle += params.mercuryAngularVelocity;
            mercuryOwnAxisRotationAngle += params.mercuryOwnAxisAngularVelocity;
        }

        mat4.rotate(mvMatrix, mvMatrix, mercuryRotationAngle, [0, 1, 0]);
        mat4.translate(mvMatrix, mvMatrix, [0, 0, params.mercuryDistanceFromSun]);
        mat4.rotate(mvMatrix, mvMatrix, mercuryOwnAxisRotationAngle, [0, 1, 0]);
        mat4.scale(mvMatrix, mvMatrix, [params.mercuryScalingFactor, params.mercuryScalingFactor, params.mercuryScalingFactor]);
        mat4.multiply(mvMatrix, viewMatrix, mvMatrix);

        initMVMatrix();
        gl.drawElements(gl.TRIANGLES, vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);


        /* VENUS */
        gl.uniform1i(shaderProgram.samplerSelectorUniform, 3);

        mat4.identity(mvMatrix);
        if(!params.pauseAnimation)
        {
            venusRotationAngle += params.venusAngularVelocity;
            venusOwnAxisRotationAngle += params.venusOwnAxisAngularVelocity;
        }

        mat4.rotate(mvMatrix, mvMatrix, venusRotationAngle, [0, 1, 0]);
        mat4.translate(mvMatrix, mvMatrix, [0, 0, params.venusDistanceFromSun]);
        mat4.rotate(mvMatrix, mvMatrix, venusOwnAxisRotationAngle, [0, 1, 0]);
        mat4.scale(mvMatrix, mvMatrix, [params.venusScalingFactor, params.venusScalingFactor, params.venusScalingFactor]);
        mat4.multiply(mvMatrix, viewMatrix, mvMatrix);

        initMVMatrix();
        gl.drawElements(gl.TRIANGLES, vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);


        /* EARTH */
        gl.uniform1i(shaderProgram.samplerSelectorUniform, 4);

        mat4.identity(mvMatrix);
        if(!params.pauseAnimation)
        {
            earthRotationAngle += params.earthAngularVelocity;
            earthOwnAxisRotationAngle += params.earthOwnAxisAngularVelocity;
        }

        mat4.rotate(mvMatrix, mvMatrix, earthRotationAngle, [0, 1, 0]);
        mat4.translate(mvMatrix, mvMatrix, [0, 0, params.earthDistanceFromSun]);
        mat4.rotate(mvMatrix, mvMatrix, earthOwnAxisRotationAngle, [0, 1, 0]);
        mat4.scale(mvMatrix, mvMatrix, [params.earthScalingFactor, params.earthScalingFactor, params.earthScalingFactor]);
        mat4.multiply(mvMatrix, viewMatrix, mvMatrix);

        initMVMatrix();
        gl.drawElements(gl.TRIANGLES, vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

        /* EARTH'S MOON */
        gl.uniform1i(shaderProgram.samplerSelectorUniform, 11);

        mat4.identity(mvMatrix);
        if(!params.pauseAnimation)
        {
            moonRotationAngle += params.moonAngularVelocity;
            moonOwnAxisRotationAngle += params.moonOwnAxisAngularVelocity;
        }

        mat4.rotate(mvMatrix, mvMatrix, earthRotationAngle, [0, 1, 0]);
        mat4.translate(mvMatrix, mvMatrix, [0, 0, params.earthDistanceFromSun]);
        mat4.rotate(mvMatrix, mvMatrix, moonRotationAngle, [0, 1, 0]);
        mat4.translate(mvMatrix, mvMatrix, [0, 0, params.moonDistanceFromEarth]);
        mat4.rotate(mvMatrix, mvMatrix, moonOwnAxisRotationAngle, [0, 1, 0]);
        mat4.scale(mvMatrix, mvMatrix, [params.moonScalingFactor, params.moonScalingFactor, params.moonScalingFactor]);
        mat4.multiply(mvMatrix, viewMatrix, mvMatrix);

        initMVMatrix();
        gl.drawElements(gl.TRIANGLES, vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);


        /* MARS */
        gl.uniform1i(shaderProgram.samplerSelectorUniform, 5);

        mat4.identity(mvMatrix);
        if(!params.pauseAnimation)
        {
            marsRotationAngle += params.marsAngularVelocity;
            marsOwnAxisRotationAngle += params.marsOwnAxisAngularVelocity;
        }

        mat4.rotate(mvMatrix, mvMatrix, marsRotationAngle, [0, 1, 0]);
        mat4.translate(mvMatrix, mvMatrix, [0, 0, params.marsDistanceFromSun]);
        mat4.rotate(mvMatrix, mvMatrix, marsOwnAxisRotationAngle, [0, 1, 0]);
        mat4.scale(mvMatrix, mvMatrix, [params.marsScalingFactor, params.marsScalingFactor, params.marsScalingFactor]);
        mat4.multiply(mvMatrix, viewMatrix, mvMatrix);

        initMVMatrix();
        gl.drawElements(gl.TRIANGLES, vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);


        /* JUPITER */
        gl.uniform1i(shaderProgram.samplerSelectorUniform, 6);

        mat4.identity(mvMatrix);
        if(!params.pauseAnimation)
        {
            jupiterRotationAngle += params.jupiterAngularVelocity;
            jupiterOwnAxisRotationAngle += params.jupiterOwnAxisAngularVelocity;
        }

        mat4.rotate(mvMatrix, mvMatrix, jupiterRotationAngle, [0, 1, 0]);
        mat4.translate(mvMatrix, mvMatrix, [0, 0, params.jupiterDistanceFromSun]);
        mat4.rotate(mvMatrix, mvMatrix, jupiterOwnAxisRotationAngle, [0, 1, 0]);
        mat4.scale(mvMatrix, mvMatrix, [params.jupiterScalingFactor, params.jupiterScalingFactor, params.jupiterScalingFactor]);
        mat4.multiply(mvMatrix, viewMatrix, mvMatrix);

        initMVMatrix();
        gl.drawElements(gl.TRIANGLES, vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);


        /* SATURN */
        gl.uniform1i(shaderProgram.samplerSelectorUniform, 7);

        mat4.identity(mvMatrix);
        if(!params.pauseAnimation)
        {
            saturnRotationAngle += params.saturnAngularVelocity;
            saturnOwnAxisRotationAngle += params.saturnOwnAxisAngularVelocity;
        }

        mat4.rotate(mvMatrix, mvMatrix, saturnRotationAngle, [0, 1, 0]);
        mat4.translate(mvMatrix, mvMatrix, [0, 0, params.saturnDistanceFromSun]);
        mat4.rotate(mvMatrix, mvMatrix, saturnOwnAxisRotationAngle, [0, 1, 0]);
        mat4.scale(mvMatrix, mvMatrix, [params.saturnScalingFactor, params.saturnScalingFactor, params.saturnScalingFactor]);
        mat4.multiply(mvMatrix, viewMatrix, mvMatrix);

        initMVMatrix();
        gl.drawElements(gl.TRIANGLES, vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);


        /* URANUS */
        gl.uniform1i(shaderProgram.samplerSelectorUniform, 8);

        mat4.identity(mvMatrix);
        if(!params.pauseAnimation)
        {
            uranusRotationAngle += params.uranusAngularVelocity;
            uranusOwnAxisRotationAngle += params.uranusOwnAxisAngularVelocity;
        }

        mat4.rotate(mvMatrix, mvMatrix, uranusRotationAngle, [0, 1, 0]);
        mat4.translate(mvMatrix, mvMatrix, [0, 0, params.uranusDistanceFromSun]);
        mat4.rotate(mvMatrix, mvMatrix, uranusOwnAxisRotationAngle, [0, 1, 0]);
        mat4.scale(mvMatrix, mvMatrix, [params.uranusScalingFactor, params.uranusScalingFactor, params.uranusScalingFactor]);
        mat4.multiply(mvMatrix, viewMatrix, mvMatrix);

        initMVMatrix();
        gl.drawElements(gl.TRIANGLES, vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);


        /* NEPTUNE */
        gl.uniform1i(shaderProgram.samplerSelectorUniform, 9);

        mat4.identity(mvMatrix);
        if(!params.pauseAnimation)
        {
            neptuneRotationAngle += params.neptuneAngularVelocity;
            neptuneOwnAxisRotationAngle += params.neptuneOwnAxisAngularVelocity;
        }

        mat4.rotate(mvMatrix, mvMatrix, neptuneRotationAngle, [0, 1, 0]);
        mat4.translate(mvMatrix, mvMatrix, [0, 0, params.neptuneDistanceFromSun]);
        mat4.rotate(mvMatrix, mvMatrix, neptuneOwnAxisRotationAngle, [0, 1, 0]);
        mat4.scale(mvMatrix, mvMatrix, [params.neptuneScalingFactor, params.neptuneScalingFactor, params.neptuneScalingFactor]);
        mat4.multiply(mvMatrix, viewMatrix, mvMatrix);

        initMVMatrix();
        gl.drawElements(gl.TRIANGLES, vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);


        /* PLUTO */
        gl.uniform1i(shaderProgram.samplerSelectorUniform, 10);

        mat4.identity(mvMatrix);
        if(!params.pauseAnimation)
        {
            plutoRotationAngle += params.plutoAngularVelocity;
            plutoOwnAxisRotationAngle += params.plutoOwnAxisAngularVelocity;
        }

        mat4.rotate(mvMatrix, mvMatrix, plutoRotationAngle, [0, 1, 0]);
        mat4.translate(mvMatrix, mvMatrix, [0, 0, params.plutoDistanceFromSun]);
        mat4.rotate(mvMatrix, mvMatrix, plutoOwnAxisRotationAngle, [0, 1, 0]);
        mat4.scale(mvMatrix, mvMatrix, [params.plutoScalingFactor, params.plutoScalingFactor, params.plutoScalingFactor]);
        mat4.multiply(mvMatrix, viewMatrix, mvMatrix);

        initMVMatrix();
        gl.drawElements(gl.TRIANGLES, vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    }
}

function tick() 
{
    requestAnimationFrame(tick);
    drawScene();
}

function main() 
{
    var canvas = document.getElementById("webgl");
    initGL(canvas);
    initShaders();
    initBuffers();
    initTexture();

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    //Setup projection matrix
    initProjectionMatrix();

    //Add keyboard listener
    document.onkeypress = function(e){ cameraMove(e, canvas); }

    //Setup Dat.GUI
    setupDatGUI();

    tick();
}

function setupDatGUI()
{
    var gui = new dat.GUI();

    //User
    var userControls = gui.addFolder('User Control Settings');
    userControls.add(params, 'userForwardAcceleration', 0.0, 10.0);
    userControls.add(params, 'userHorizontalRotationAcceleration', 0.0, 10.0);
    userControls.add(params, 'userVerticalRotationAcceleration', 0.0, 10.0);
    userControls.add(params, 'userUpVectorRotationAcceleration', 0.0, 10.0);
    
    //Planets
    var planetSettings = gui.addFolder('Planet Attribute Settings');
    planetSettings.add(params, 'sunOwnAxisAngularVelocity', 0.0, 1.0);
    planetSettings.add(params, 'mercuryAngularVelocity', 0.0, 1.0);
    planetSettings.add(params, 'mercuryOwnAxisAngularVelocity', 0.0, 1.0);
    planetSettings.add(params, 'venusAngularVelocity', 0.0, 1.0);
    planetSettings.add(params, 'venusOwnAxisAngularVelocity', 0.0, 1.0);
    planetSettings.add(params, 'earthAngularVelocity', 0.0, 1.0);
    planetSettings.add(params, 'earthOwnAxisAngularVelocity', 0.0, 1.0);
    planetSettings.add(params, 'moonAngularVelocity', 0.0, 1.0);
    planetSettings.add(params, 'moonOwnAxisAngularVelocity', 0.0, 1.0);
    planetSettings.add(params, 'marsAngularVelocity', 0.0, 1.0);
    planetSettings.add(params, 'marsOwnAxisAngularVelocity', 0.0, 1.0);
    planetSettings.add(params, 'jupiterAngularVelocity', 0.0, 1.0);
    planetSettings.add(params, 'jupiterOwnAxisAngularVelocity', 0.0, 1.0);
    planetSettings.add(params, 'saturnAngularVelocity', 0.0, 1.0);
    planetSettings.add(params, 'saturnOwnAxisAngularVelocity', 0.0, 1.0);
    planetSettings.add(params, 'uranusAngularVelocity', 0.0, 1.0);
    planetSettings.add(params, 'uranusOwnAxisAngularVelocity', 0.0, 1.0);
    planetSettings.add(params, 'neptuneAngularVelocity', 0.0, 1.0);
    planetSettings.add(params, 'neptuneOwnAxisAngularVelocity', 0.0, 1.0);
    planetSettings.add(params, 'plutoAngularVelocity', 0.0, 1.0);
    planetSettings.add(params, 'plutoOwnAxisAngularVelocity', 0.0, 1.0);

    planetSettings.add(params, 'mercuryDistanceFromSun', 1.0, 100.0);
    planetSettings.add(params, 'venusDistanceFromSun', 1.0, 100.0);
    planetSettings.add(params, 'earthDistanceFromSun', 1.0, 100.0);
    planetSettings.add(params, 'moonDistanceFromEarth', 1.0, 10.0);
    planetSettings.add(params, 'marsDistanceFromSun', 1.0, 100.0);
    planetSettings.add(params, 'jupiterDistanceFromSun', 1.0, 100.0);
    planetSettings.add(params, 'saturnDistanceFromSun', 1.0, 100.0);
    planetSettings.add(params, 'uranusDistanceFromSun', 1.0, 100.0);
    planetSettings.add(params, 'neptuneDistanceFromSun', 1.0, 100.0);
    planetSettings.add(params, 'plutoDistanceFromSun', 1.0, 100.0);

    planetSettings.add(params, 'sunScalingFactor', 0.0, 10.0);
    planetSettings.add(params, 'mercuryScalingFactor', 0.0, 10.0);
    planetSettings.add(params, 'venusScalingFactor', 0.0, 10.0);
    planetSettings.add(params, 'earthScalingFactor', 0.0, 10.0);
    planetSettings.add(params, 'moonScalingFactor', 0.0, 10.0);
    planetSettings.add(params, 'marsScalingFactor', 0.0, 10.0);
    planetSettings.add(params, 'jupiterScalingFactor', 0.0, 10.0);
    planetSettings.add(params, 'saturnScalingFactor', 0.0, 10.0);
    planetSettings.add(params, 'uranusScalingFactor', 0.0, 10.0);
    planetSettings.add(params, 'neptuneScalingFactor', 0.0, 10.0);
    planetSettings.add(params, 'plutoScalingFactor', 0.0, 10.0);

    //Animation
    gui.add(params, 'pauseAnimation');
}

function cameraMove(e, canvas)
{
    var keyPressed;
    if((!e.keyCode) || (e.keyCode == 0))
    {
        keyPressed = e.charCode;
    }
    else
    {
        keyPressed = e.keyCode;
    }

    //If q pressed
    if(keyPressed == 113)
    {
        cameraAngle -= params.userUpVectorRotationAcceleration;
        upX = Math.sin(cameraAngle);
        upY = Math.cos(cameraAngle);
    }

    //If e pressed
    else if(keyPressed == 101)
    {
        cameraAngle += params.userUpVectorRotationAcceleration;
        upX = Math.sin(cameraAngle);
        upY = Math.cos(cameraAngle);
    }

    //If a pressed
    if(keyPressed == 97)
    {
        angle -= params.userHorizontalRotationAcceleration;
        lx = Math.sin(angle);
        lz = -Math.cos(angle);
    }

    //If d pressed
    else if(keyPressed == 100)
    {
        angle += params.userHorizontalRotationAcceleration;
        lx = Math.sin(angle);
        lz = -Math.cos(angle);
    }

    //If r pressed
    else if(keyPressed == 114)
    {
        verticalAngle += params.userVerticalRotationAcceleration;
        ly = Math.sin(verticalAngle);
        lz = -Math.cos(verticalAngle);
    }

    //If f pressed
    else if(keyPressed == 102)
    {
        verticalAngle -= params.userVerticalRotationAcceleration;
        ly = Math.sin(verticalAngle);
        lz = -Math.cos(verticalAngle);
    }

    //If w pressed
    else if(keyPressed == 119)
    {
        x += lx * params.userForwardAcceleration;
        y += ly * params.userForwardAcceleration;
        z += lz * params.userForwardAcceleration;
    }

    //If s pressed
    else if(keyPressed == 115)
    {
        x -= lx * params.userForwardAcceleration;
        y -= ly * params.userForwardAcceleration;
        z -= lz * params.userForwardAcceleration;
    }
}

function initProjectionMatrix()
{
    pMatrix = mat4.create()
    mat4.perspective(pMatrix, Math.PI / 4, gl.viewportWidth / gl.viewportHeight, frontClippingPlane, backClippingPlane);
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
}

function initMVMatrix() 
{
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}