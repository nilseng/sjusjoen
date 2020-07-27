import * as THREE from "three";

import Stats from "three/examples/jsm/libs/stats.module.js";

import { GUI } from "three/examples/jsm/libs/dat.gui.module.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Water } from "three/examples/jsm/objects/Water.js";
import { SunnySky } from "./3DComponents/SunnySky";

import "./styles/styles.scss";

import WaterNormals from "./textures/waternormals.jpg";
import HytteTexture from "./textures/hyttetexture.jpg";
import LyngTexture from "./textures/lyng.jpg";

var container, stats;
var camera, scene, renderer;
var controls, water, mesh;

init();
animate();

function init() {
  container = document.getElementById("container");

  //

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  //

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    1,
    20000
  );
  camera.position.set(0, 30, 100);

  // Water

  var waterGeometry = new THREE.PlaneBufferGeometry(2000, 1000);

  water = new Water(waterGeometry, {
    textureWidth: 512,
    textureHeight: 512,
    waterNormals: new THREE.TextureLoader().load(WaterNormals, function (
      texture
    ) {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    }),
    alpha: 1.0,
    sunDirection: new THREE.Vector3(),
    sunColor: 0xffffff,
    waterColor: 0x001e0f,
    distortionScale: 3.7,
    fog: scene.fog !== undefined,
  });

  water.rotation.x = -Math.PI / 2;
  water.position.set(0, 0, 500);

  scene.add(water);

  // Skybox

  const sky = new SunnySky();

  scene.add(sky);

  var uniforms = sky.material.uniforms;

  uniforms["turbidity"].value = 10;
  uniforms["rayleigh"].value = 2;
  uniforms["mieCoefficient"].value = 0.005;
  uniforms["mieDirectionalG"].value = 0.8;

  var parameters = {
    inclination: 0.25,
    azimuth: 0.05,
  };

  var pmremGenerator = new THREE.PMREMGenerator(renderer);

  function updateSun() {
    var theta = Math.PI * (parameters.inclination - 0.5);
    var phi = 2 * Math.PI * (parameters.azimuth - 0.5);

    sky.sun.setX(Math.cos(phi));
    sky.sun.setY(Math.sin(phi) * Math.sin(theta));
    sky.sun.setZ(Math.sin(phi) * Math.cos(theta));

    sky.material.uniforms["sunPosition"].value.copy(sky.sun);
    water.material.uniforms["sunDirection"].value.copy(sky.sun).normalize();

    scene.environment = pmremGenerator.fromScene(sky).texture;
  }

  updateSun();

  // Vassbakken

  const lyngGeometry = new THREE.PlaneBufferGeometry(2000, 25);
  const lyngTexture = new THREE.TextureLoader().load(LyngTexture);
  lyngTexture.wrapS = THREE.RepeatWrapping;
  lyngTexture.wrapT = THREE.RepeatWrapping;
  lyngTexture.repeat.set(1000, 12.5);
  const lyngMaterial = new THREE.MeshStandardMaterial({ map: lyngTexture });

  const lyngMesh = new THREE.Mesh(lyngGeometry, lyngMaterial);
  lyngMesh.position.set(0, 12.5 * Math.cos(Math.PI / 3.5), 0);
  lyngMesh.rotateX(-Math.PI / 3.5);

  scene.add(lyngMesh);

  // hytta

  const gammelHytteGeometry = new THREE.BoxBufferGeometry(10, 3, 5);
  const gammelHyttetexture = new THREE.TextureLoader().load(HytteTexture);
  gammelHyttetexture.wrapS = THREE.RepeatWrapping;
  gammelHyttetexture.wrapT = THREE.RepeatWrapping;
  gammelHyttetexture.repeat.set(5, 1);
  const gammelHytteMaterial = new THREE.MeshStandardMaterial({
    map: gammelHyttetexture,
  });
  const gammelHytteMesh = new THREE.Mesh(
    gammelHytteGeometry,
    gammelHytteMaterial
  );
  gammelHytteMesh.position.set(0, 12.5 * Math.cos(Math.PI / 3.5), 0);

  scene.add(gammelHytteMesh);

  const nyHytteGeometry = new THREE.BoxBufferGeometry(5, 3.5, 5);
  const nyHyttetexture = new THREE.TextureLoader().load(HytteTexture);
  nyHyttetexture.wrapS = THREE.RepeatWrapping;
  nyHyttetexture.wrapT = THREE.RepeatWrapping;
  nyHyttetexture.repeat.set(2.5, 1);
  const nyHytteMaterial = new THREE.MeshStandardMaterial({
    map: nyHyttetexture,
  });
  const nyHytteMesh = new THREE.Mesh(nyHytteGeometry, nyHytteMaterial);
  nyHytteMesh.position.set(7.5, 12.5 * Math.cos(Math.PI / 3.5) + 0.25, 0);

  scene.add(nyHytteMesh);

  const furtebuGeometry = new THREE.BoxBufferGeometry(2, 3, 5);
  const furtebuTexture = new THREE.TextureLoader().load(HytteTexture);
  furtebuTexture.wrapS = THREE.RepeatWrapping;
  furtebuTexture.wrapT = THREE.RepeatWrapping;
  furtebuTexture.repeat.set(1, 1);
  const furtebuMaterial = new THREE.MeshStandardMaterial({
    map: furtebuTexture,
  });
  const furtebuMesh = new THREE.Mesh(furtebuGeometry, furtebuMaterial);
  furtebuMesh.position.set(11, 12.5 * Math.cos(Math.PI / 3.5), 0);

  scene.add(furtebuMesh);

  //

  controls = new OrbitControls(camera, renderer.domElement);
  controls.maxPolarAngle = Math.PI / (3 / 2);
  controls.target.set(0, 10, 0);
  controls.minDistance = 5.0;
  controls.maxDistance = 10000.0;
  controls.update();

  //

  stats = new Stats();
  container.appendChild(stats.dom);

  // GUI

  var gui = new GUI();

  var folder = gui.addFolder("Sky");
  folder.add(parameters, "inclination", 0, 0.5, 0.0001).onChange(updateSun);
  folder.add(parameters, "azimuth", 0, 1, 0.0001).onChange(updateSun);
  folder.open();

  var uniforms = water.material.uniforms;

  var folder = gui.addFolder("Water");
  folder
    .add(uniforms.distortionScale, "value", 0, 8, 0.1)
    .name("distortionScale");
  folder.add(uniforms.size, "value", 0.1, 10, 0.1).name("size");
  folder.add(uniforms.alpha, "value", 0.9, 1, 0.001).name("alpha");
  folder.open();

  //

  window.addEventListener("resize", onWindowResize, false);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  render();
  stats.update();
}

function render() {
  var time = performance.now() * 0.001;

  water.material.uniforms["time"].value += 1.0 / 60.0;

  renderer.render(scene, camera);
}
