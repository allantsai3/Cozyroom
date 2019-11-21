'use strict';
/* global THREE */
//MAIN

//standard global varialbes
var scene, camera, renderer, canvas;
var controls;
//global variables
var mirrorSphere, mirrorSphereCamera, mirrorSphere1, mirrorSphereCamera1;
var refractPlane, refractPlaneCamera;

var cube;
var table;
var groundplane;


init();
animate();

function init()
{
  canvas = document.querySelector('#myScene');
  renderer = new THREE.WebGLRenderer({canvas, antialias:true});
  renderer.setSize(WIDTH, HEIGHT);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.needsUpdate = true;
  renderer.shadowMap.type = THREE.BasicShadowMap;
  document.body.appendChild(renderer.domElement);
  // Create the scene and set the scene size.
  scene = new THREE.Scene();
  var WIDTH = window.innerWidth,
      HEIGHT = window.innerHeight;


  //Perspective camera
  var fov = 75;
  var aspect = 2;  // the canvas default
  var near = 0.1;
  var far = 5000;
  camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0, 50, 100);
  camera.lookAt(0, 0, 0);

  scene = new THREE.Scene();

  controls = new THREE.OrbitControls( camera, renderer.domElement);
  controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
  controls.dampingFactor = 0.05;
  controls.screenSpacePanning = false;
  controls.minDistance = 5;
  controls.maxDistance = 5000;
  controls.maxPolarAngle = Math.PI / 2;

  // scene.fog = new THREE.FogExp2( 0xcccccc, 450.0, 500.0 );

  //Lighting
  const light = new THREE.SpotLight(0xFFFFFF);
  light.position.set(30, 70, 0);
  light.target.position.set(30, 0, 0);
  light.decay = 2;
  light.penumbra = 0.9;
  light.angle = Math.PI /2;
  light.shadow.mapSize.width = 2048;
  light.shadow.mapSize.height = 2048;
  light.shadow.camera.near = 50;       
  light.shadow.camera.far = 3000;      
  light.shadow.camera.left = -500;
  light.shadow.camera.bottom = -500;
  light.shadow.camera.right = 500;
  light.shadow.camera.top = 500;
  // light.castShadow = true;
  scene.add(light);
  scene.add(light.target);


  //Lighting
  const light1 = new THREE.SpotLight(0xFFFFFF);
  light1.position.set(-40, 70, 0);
  light1.target.position.set(-40, 0, 0);
  light1.decay = 2;
  light1.penumbra = 0.9;
  light1.angle = Math.PI /2;
  light1.shadow.mapSize.width = 2048;
  light1.shadow.mapSize.height = 2048;
  light1.shadow.camera.near = 50;       
  light1.shadow.camera.far = 3000;      
  light1.shadow.camera.left = -500;
  light1.shadow.camera.bottom = -500;
  light1.shadow.camera.right = 500;
  light1.shadow.camera.top = 500;
  // light.castShadow = true;
  scene.add(light1);
  scene.add(light1.target);

  var ambientLight = new THREE.AmbientLight(0x404040);
  scene.add(ambientLight);

  //reflective sphere
  mirrorSphereCamera = new THREE.CubeCamera(0.1, 5000, 512);
  scene.add( mirrorSphereCamera);


  const verticesOfCube = [
    -1, -1, -1,    1, -1, -1,    1,  1, -1,    -1,  1, -1,
    -1, -1,  1,    1, -1,  1,    1,  1,  1,    -1,  1,  1,
  ];
  const indicesOfFaces = [
    2, 1, 0,    0, 3, 2,
    0, 4, 7,    7, 3, 0,
    0, 1, 5,    5, 4, 0,
    1, 2, 6,    6, 5, 1,
    2, 3, 7,    7, 6, 2,
    4, 5, 6,    6, 7, 4,
  ];
  var radius = 5;
  var detail = 4;
  var sphereGeometry = new THREE.PolyhedronBufferGeometry(verticesOfCube, indicesOfFaces, radius, detail);

  var sphereMaterial = new THREE.MeshBasicMaterial({envMap: mirrorSphereCamera.renderTarget});
  mirrorSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  mirrorSphere.position.set(30, 70, 0);
  mirrorSphereCamera.position.set(30, 70, 0);
  mirrorSphere.castShadow = true;
  scene.add(mirrorSphere);

  //reflective sphere
  mirrorSphereCamera1 = new THREE.CubeCamera(0.1, 5000, 512);

  mirrorSphereCamera1.update( renderer, scene);

  var sphereMaterial1 = new THREE.MeshBasicMaterial({envMap: mirrorSphereCamera1.renderTarget});
  mirrorSphere1 = new THREE.Mesh(sphereGeometry, sphereMaterial1);
  mirrorSphere1.position.set(-40, 70, 0);
  mirrorSphereCamera1.position.set(-40, 70, 0);
  mirrorSphere1.castShadow = true;
  scene.add(mirrorSphere1);

  //Ground
  var textureLoader = new THREE.TextureLoader();
  var texture1 = textureLoader.load('models/plankdisp.jpg')
  var texture = textureLoader.load('models/plankdiffuse.jpg');
  texture.encoding = THREE.sRGBEncoding;
  texture.anisotropy = 16;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  var groundMat = new THREE.MeshPhongMaterial({map: texture, displacementMap: texture1});
  var groundGeom = new THREE.PlaneGeometry( 200, 200, 100, 100 );
  groundplane = new THREE.Mesh(groundGeom, groundMat);
  groundplane.receiveShadow = true;
  groundplane.rotation.x = radians(-90);
  scene.add(groundplane);

  //refractive plane goggles 
  var planeGeom = new THREE.PlaneBufferGeometry(2, 2);
  refractPlaneCamera = new THREE.CubeCamera(0.1, 5000, 512);
  refractPlaneCamera.renderTarget.mapping = THREE.CubeRefractionMapping;
  scene.add(refractPlaneCamera);

  var refractMaterial = new THREE.MeshBasicMaterial({color: 0xccddff, envMap: refractPlaneCamera.renderTarget, refractionRatio: 0.98, reflectivity: 0.9});
  refractPlane = new THREE.Mesh( planeGeom, refractMaterial );
  refractPlane.position.set(2, 2, 8);
  refractPlaneCamera.position.set(2, 2, 8);
  scene.add(refractPlane);
  refractPlane.scale.set(50, 50, 50);
  refractPlane.rotation.y = radians(90);
  refractPlane.position.y = 50;
  refractPlane.position.x = -100;

  //Wall1
  var wallgroup = new THREE.Group();
  texture1 = textureLoader.load('models/sandstonewalldispmap.jpg');
  texture = textureLoader.load('models/sandstonewall.jpg');
  // texture.repeat.set( 4, 4 );
  var wallGeom = new THREE.PlaneBufferGeometry(2, 2, 32, 32);
  var wallMat = new THREE.MeshPhongMaterial({map:texture, displacementMap: texture1});
  var wall1 = new THREE.Mesh(wallGeom, wallMat);
  wall1.receiveShadow = true;
  wall1.displacementScale = 30;
  wallgroup.add(wall1);
  wall1.scale.set(100, 50, 50);
  wall1.position.z = -125;
  wall1.position.y = 50;

  //Wall2
  var wall2 = new THREE.Mesh(wallGeom, wallMat);
  wallgroup.add(wall2);
  wall2.receiveShadow = true;
  wall2.scale.set(100, 50, 50);
  wall2.rotation.y = (radians(180));
  wall2.position.z = 125;
  wall2.position.y = 50;

  //Wall3
  var wall3 = new THREE.Mesh(wallGeom, wallMat);
  wall3.displacementMap = texture1;
  wall3.displacementScale = 30;
  wall3.receiveShadow = true;
  wallgroup.add(wall3);
  wall3.scale.set(100, 50, 50);
  wall3.rotation.y = radians(-90);
  wall3.position.x = 125;
  wall3.position.y = 50;

  scene.add(wallgroup);


  //SKY BOX
  var imagePrefix = "skybox/";
  var directions  = ["posx", "negx", "posy", "negy", "posz", "negz"];
  var imageSuffix = ".jpg";
  var skyGeometry = new THREE.CubeGeometry( 5000, 5000, 5000 ); 
  
  var materialArray = [];
  for (var i = 0; i < 6; i++)
    materialArray.push( new THREE.MeshBasicMaterial({
      map: THREE.ImageUtils.loadTexture( imagePrefix + directions[i] + imageSuffix ),
      side: THREE.BackSide
    }));
  var skyMaterial = new THREE.MeshFaceMaterial( materialArray );
  var skyBox = new THREE.Mesh( skyGeometry, skyMaterial );
  scene.add( skyBox );

  texture = textureLoader.load('models/nut_dark_full_bump.jpg');
  var tableObj = loadObj("./models/", "table");
  tableObj.then(myObj => {
    scene.add(myObj);
    // myObj.position.y = -500;
    myObj.scale.set(0.08, 0.08, 0.08);
    myObj.position.y = -10;
    myObj.position.z = 45;
    myObj.bumpMap = texture;
    myObj.castShadow = true;
    myObj.receiveShadow = true;
  });

  var chairObj = loadObj("./models/", "chair");
  chairObj.then(myObj => {
    scene.add(myObj);
    myObj.scale.set(40, 40, 40);
    myObj.position.x = 10;
    myObj.position.z = 80;
    myObj.rotation.x = radians(-90);
    myObj.rotation.z = radians(-100);
    myObj.receiveShadow = true;
    myObj.castShadow = true;
  });

  var chairObj1 = loadObj("./models/", "chair");
  chairObj1.then(myObj => {
    scene.add(myObj);
    myObj.scale.set(40, 40, 40);
    myObj.position.x = -30;
    myObj.position.z = 80;
    myObj.rotation.x = radians(-90);
    myObj.rotation.z = radians(-100);
    myObj.receiveShadow = true;
    myObj.castShadow = true;
  });

  var chairObj2 = loadObj("./models/", "chair");
  chairObj2.then(myObj => {
    scene.add(myObj);
    myObj.scale.set(40, 40, 40);
    myObj.position.x = 5;
    myObj.position.z = 10;
    myObj.rotation.x = radians(-90);
    myObj.rotation.z = radians(80);
    myObj.receiveShadow = true;
    myObj.castShadow = true;
  });

  var chairObj3 = loadObj("./models/", "chair");
  chairObj3.then(myObj => {
    scene.add(myObj);
    myObj.scale.set(40, 40, 40);
    myObj.position.x = 45;
    myObj.position.z = 10;
    myObj.rotation.x = radians(-90);
    myObj.rotation.z = radians(80);
    myObj.receiveShadow = true;
    myObj.castShadow = true;
  });

  var sofaObj = loadObj("./models/", "sofa");
  sofaObj.then(myObj => {
    scene.add(myObj);
    myObj.rotation.x = radians(-90);
    myObj.rotation.z = radians(-90);
    myObj.position.x = 35;
    myObj.position.z = -10;
    myObj.receiveShadow = true;
    myObj.castShadow = true;
  });

}

function animate()
{
  requestAnimationFrame(animate);
  controls.update();
  render();
}


function render(time)
{
  time *= 0.001;  // convert time to seconds

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }
  mirrorSphereCamera.visible = false;
  mirrorSphereCamera.update( renderer, scene);
  mirrorSphereCamera.visible = true;

  mirrorSphereCamera1.visible = false;
  mirrorSphereCamera1.update( renderer, scene);
  mirrorSphereCamera1.visible = true;

  refractPlaneCamera.visible = false;
  refractPlaneCamera.update( renderer, scene );
  refractPlaneCamera.visible = true;

  renderer.render( scene, camera);
  // requestAnimationFrame(render);

}

function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
}


function loadObj( path, name ){
  
  var progress = console.log;

  return new Promise(function( resolve, reject ){
  
    var mtlLoader = new THREE.MTLLoader();
    
    mtlLoader.setPath( path );
    mtlLoader.load( name + ".mtl", function( materials ){
    
        materials.preload();
        
        var objLoader = new THREE.OBJLoader();
        
        objLoader.setMaterials( materials );
        objLoader.setPath( path );
        objLoader.load( name + ".obj", resolve, progress, reject );
        
    }, progress, reject );
   
  });
  
}

