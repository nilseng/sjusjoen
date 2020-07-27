import * as THREE from "three";
import { Sky } from "three/examples/jsm/objects/Sky.js";

export class SunnySky extends Sky {
  constructor() {
    super();

    this.sun = new THREE.Vector3();

    this.scale.setScalar(10000);
  }
}
