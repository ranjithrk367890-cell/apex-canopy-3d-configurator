import fs from 'fs';
import path from 'path';
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

// Polyfills for Node environment if required by GLTFExporter
globalThis.FileReader = class {
  readAsArrayBuffer(blob) {
    if (blob.arrayBuffer) {
      blob.arrayBuffer().then(buf => {
        this.result = buf;
        if (this.onloadend) this.onloadend();
      });
    } else {
      this.result = blob;
      if (this.onloadend) this.onloadend();
    }
  }
};

function createTentScene() {
  const tentRoot = new THREE.Group();
  tentRoot.name = 'TentProduct';

  // DIMENSIONS (in meters)
  const width = 3.0; // 10 ft
  const depth = 3.0; // 10 ft
  const eaveHeight = 2.1; // 7 ft
  const peakHeight = 3.15; // ~10.3 ft
  const valanceDrop = 0.25; // 25 cm
  const halfW = width / 2;
  const halfD = depth / 2;

  // 1. MATERIALS
  const roofMaterial = new THREE.MeshStandardMaterial({
    name: 'material_roof',
    color: new THREE.Color('#1E3A8A'), // Classic Royal Blue
    roughness: 0.6,
    metalness: 0.1,
    side: THREE.DoubleSide
  });

  const valanceMaterial = new THREE.MeshStandardMaterial({
    name: 'material_valance',
    color: new THREE.Color('#1E3A8A'),
    roughness: 0.6,
    metalness: 0.1,
    side: THREE.DoubleSide
  });

  const frameMaterial = new THREE.MeshStandardMaterial({
    name: 'material_frame',
    color: new THREE.Color('#94A3B8'), // Anodized Aluminum
    roughness: 0.35,
    metalness: 0.85
  });

  const wallFrontMat = new THREE.MeshStandardMaterial({
    name: 'material_wall_front',
    color: new THREE.Color('#F8FAFC'),
    roughness: 0.7,
    metalness: 0.05,
    side: THREE.DoubleSide
  });

  const wallBackMat = new THREE.MeshStandardMaterial({
    name: 'material_wall_back',
    color: new THREE.Color('#F8FAFC'),
    roughness: 0.7,
    metalness: 0.05,
    side: THREE.DoubleSide
  });

  const wallLeftMat = new THREE.MeshStandardMaterial({
    name: 'material_wall_left',
    color: new THREE.Color('#F8FAFC'),
    roughness: 0.7,
    metalness: 0.05,
    side: THREE.DoubleSide
  });

  const wallRightMat = new THREE.MeshStandardMaterial({
    name: 'material_wall_right',
    color: new THREE.Color('#F8FAFC'),
    roughness: 0.7,
    metalness: 0.05,
    side: THREE.DoubleSide
  });

  // 2. CANOPY ROOF PYRAMID
  // We build 4 triangular faces with dedicated UVs for seamless 2D/3D texture mapping
  const roofGeom = new THREE.BufferGeometry();
  const peak = [0, peakHeight, 0];
  const pFrontLeft = [-halfW, eaveHeight, halfD];
  const pFrontRight = [halfW, eaveHeight, halfD];
  const pBackRight = [halfW, eaveHeight, -halfD];
  const pBackLeft = [-halfW, eaveHeight, -halfD];

  // Vertices for Front, Right, Back, Left triangles
  // 3 vertices per face = 12 vertices
  const roofPositions = new Float32Array([
    // Front face
    pFrontLeft[0], pFrontLeft[1], pFrontLeft[2],
    pFrontRight[0], pFrontRight[1], pFrontRight[2],
    peak[0], peak[1], peak[2],

    // Right face
    pFrontRight[0], pFrontRight[1], pFrontRight[2],
    pBackRight[0], pBackRight[1], pBackRight[2],
    peak[0], peak[1], peak[2],

    // Back face
    pBackRight[0], pBackRight[1], pBackRight[2],
    pBackLeft[0], pBackLeft[1], pBackLeft[2],
    peak[0], peak[1], peak[2],

    // Left face
    pBackLeft[0], pBackLeft[1], pBackLeft[2],
    pFrontLeft[0], pFrontLeft[1], pFrontLeft[2],
    peak[0], peak[1], peak[2]
  ]);

  // UV mapping for the 4 faces:
  // Front face gets primary UV range (0,0) to (1,1) for front logo/text mapping
  // We can also quadrant-map them or atlas-map them:
  // Front: u in [0, 1], v in [0, 1]
  // Let's standardise so the front face has standard normalized UVs [0..1]
  const roofUVs = new Float32Array([
    // Front face (Left, Right, Peak)
    0.0, 0.0,
    1.0, 0.0,
    0.5, 1.0,

    // Right face
    0.0, 0.0,
    1.0, 0.0,
    0.5, 1.0,

    // Back face
    0.0, 0.0,
    1.0, 0.0,
    0.5, 1.0,

    // Left face
    0.0, 0.0,
    1.0, 0.0,
    0.5, 1.0
  ]);

  roofGeom.setAttribute('position', new THREE.BufferAttribute(roofPositions, 3));
  roofGeom.setAttribute('uv', new THREE.BufferAttribute(roofUVs, 2));
  roofGeom.computeVertexNormals();

  const roofMesh = new THREE.Mesh(roofGeom, roofMaterial);
  roofMesh.name = 'roof';
  roofMesh.castShadow = true;
  roofMesh.receiveShadow = true;
  tentRoot.add(roofMesh);

  // 3. CANOPY VALANCES (The hanging border around the eave)
  // Front Valance
  const createValance = (name, p1, p2, p3, p4) => {
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array([
      // Triangle 1
      p1[0], p1[1], p1[2],
      p2[0], p2[1], p2[2],
      p3[0], p3[1], p3[2],
      // Triangle 2
      p1[0], p1[1], p1[2],
      p3[0], p3[1], p3[2],
      p4[0], p4[1], p4[2]
    ]);
    const uvs = new Float32Array([
      0, 1,   1, 1,   1, 0,
      0, 1,   1, 0,   0, 0
    ]);
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    geom.computeVertexNormals();
    const mesh = new THREE.Mesh(geom, valanceMaterial);
    mesh.name = name;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  };

  const valanceYBottom = eaveHeight - valanceDrop;
  // Front valance
  const vf1 = [-halfW, eaveHeight, halfD];
  const vf2 = [halfW, eaveHeight, halfD];
  const vf3 = [halfW, valanceYBottom, halfD];
  const vf4 = [-halfW, valanceYBottom, halfD];
  tentRoot.add(createValance('valance_front', vf1, vf2, vf3, vf4));

  // Right valance
  const vr1 = [halfW, eaveHeight, halfD];
  const vr2 = [halfW, eaveHeight, -halfD];
  const vr3 = [halfW, valanceYBottom, -halfD];
  const vr4 = [halfW, valanceYBottom, halfD];
  tentRoot.add(createValance('valance_right', vr1, vr2, vr3, vr4));

  // Back valance
  const vb1 = [halfW, eaveHeight, -halfD];
  const vb2 = [-halfW, eaveHeight, -halfD];
  const vb3 = [-halfW, valanceYBottom, -halfD];
  const vb4 = [halfW, valanceYBottom, -halfD];
  tentRoot.add(createValance('valance_back', vb1, vb2, vb3, vb4));

  // Left valance
  const vl1 = [-halfW, eaveHeight, -halfD];
  const vl2 = [-halfW, eaveHeight, halfD];
  const vl3 = [-halfW, valanceYBottom, halfD];
  const vl4 = [-halfW, valanceYBottom, -halfD];
  tentRoot.add(createValance('valance_left', vl1, vl2, vl3, vl4));

  // 4. FRAME LEGS
  const legsGroup = new THREE.Group();
  legsGroup.name = 'frame_legs';

  const legCorners = [
    [-halfW + 0.025, halfD - 0.025],
    [halfW - 0.025, halfD - 0.025],
    [halfW - 0.025, -halfD + 0.025],
    [-halfW + 0.025, -halfD + 0.025]
  ];

  legCorners.forEach(([cx, cz], idx) => {
    // Upper leg column (square aluminum tube)
    const legGeom = new THREE.BoxGeometry(0.05, eaveHeight, 0.05);
    const legMesh = new THREE.Mesh(legGeom, frameMaterial);
    legMesh.name = `leg_column_${idx + 1}`;
    legMesh.position.set(cx, eaveHeight / 2, cz);
    legMesh.castShadow = true;
    legsGroup.add(legMesh);

    // Foot plate at bottom
    const footGeom = new THREE.BoxGeometry(0.12, 0.01, 0.12);
    const footMesh = new THREE.Mesh(footGeom, frameMaterial);
    footMesh.name = `leg_foot_${idx + 1}`;
    footMesh.position.set(cx, 0.005, cz);
    footMesh.castShadow = true;
    legsGroup.add(footMesh);

    // Leg slider joint bracket at eave height - 0.4
    const sliderGeom = new THREE.BoxGeometry(0.065, 0.08, 0.065);
    const sliderMesh = new THREE.Mesh(sliderGeom, frameMaterial);
    sliderMesh.name = `leg_slider_${idx + 1}`;
    sliderMesh.position.set(cx, eaveHeight - 0.35, cz);
    legsGroup.add(sliderMesh);
  });
  tentRoot.add(legsGroup);

  // 5. FRAME TRUSSES (Scissor Accordion Cross-Braces & Center Peak Mast)
  const trussesGroup = new THREE.Group();
  trussesGroup.name = 'frame_trusses';

  // Center Peak Mast Pole
  const mastGeom = new THREE.CylinderGeometry(0.025, 0.025, peakHeight - (eaveHeight - 0.3), 16);
  const mastMesh = new THREE.Mesh(mastGeom, frameMaterial);
  mastMesh.name = 'center_mast';
  mastMesh.position.set(0, (peakHeight + (eaveHeight - 0.3)) / 2, 0);
  trussesGroup.add(mastMesh);

  // Peak spring cap
  const capGeom = new THREE.SphereGeometry(0.045, 16, 16);
  const capMesh = new THREE.Mesh(capGeom, frameMaterial);
  capMesh.position.set(0, peakHeight, 0);
  trussesGroup.add(capMesh);

  // 4 Roof rafter truss poles connecting corners to center peak collar
  legCorners.forEach(([cx, cz], idx) => {
    const rafterGeom = new THREE.CylinderGeometry(0.015, 0.015, 1, 8);
    const rafterMesh = new THREE.Mesh(rafterGeom, frameMaterial);
    rafterMesh.name = `roof_rafter_${idx + 1}`;

    const start = new THREE.Vector3(cx, eaveHeight, cz);
    const end = new THREE.Vector3(0, peakHeight - 0.1, 0);
    const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    const length = start.distanceTo(end);

    rafterMesh.scale.set(1, length, 1);
    rafterMesh.position.copy(mid);
    rafterMesh.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3().subVectors(end, start).normalize()
    );
    trussesGroup.add(rafterMesh);
  });

  // Perimeter Scissor cross-bars for all 4 sides
  const sides = [
    { p1: legCorners[0], p2: legCorners[1], name: 'front' },
    { p1: legCorners[1], p2: legCorners[2], name: 'right' },
    { p1: legCorners[2], p2: legCorners[3], name: 'back' },
    { p1: legCorners[3], p2: legCorners[0], name: 'left' }
  ];

  sides.forEach((side, sIdx) => {
    const p1 = new THREE.Vector3(side.p1[0], 0, side.p1[1]);
    const p2 = new THREE.Vector3(side.p2[0], 0, side.p2[1]);
    const dir = new THREE.Vector3().subVectors(p2, p1);
    const sideLen = dir.length();
    const halfLen = sideLen / 2;

    // 2 scissor units per side (left X and right X)
    for (let u = 0; u < 2; u++) {
      const uStart = new THREE.Vector3().copy(p1).addScaledVector(dir.clone().normalize(), u * halfLen);
      const uEnd = new THREE.Vector3().copy(p1).addScaledVector(dir.clone().normalize(), (u + 1) * halfLen);

      const yTop = eaveHeight - 0.05;
      const yBottom = eaveHeight - 0.35;

      // Bar 1: top start to bottom end
      const bar1Start = new THREE.Vector3(uStart.x, yTop, uStart.z);
      const bar1End = new THREE.Vector3(uEnd.x, yBottom, uEnd.z);
      const bar1Mid = new THREE.Vector3().addVectors(bar1Start, bar1End).multiplyScalar(0.5);
      const bar1Len = bar1Start.distanceTo(bar1End);

      const barGeom = new THREE.BoxGeometry(0.015, 0.03, bar1Len);
      const bar1Mesh = new THREE.Mesh(barGeom, frameMaterial);
      bar1Mesh.position.copy(bar1Mid);
      bar1Mesh.lookAt(bar1End);
      trussesGroup.add(bar1Mesh);

      // Bar 2: bottom start to top end
      const bar2Start = new THREE.Vector3(uStart.x, yBottom, uStart.z);
      const bar2End = new THREE.Vector3(uEnd.x, yTop, uEnd.z);
      const bar2Mid = new THREE.Vector3().addVectors(bar2Start, bar2End).multiplyScalar(0.5);
      const bar2Mesh = new THREE.Mesh(barGeom, frameMaterial);
      bar2Mesh.position.copy(bar2Mid);
      bar2Mesh.lookAt(bar2End);
      trussesGroup.add(bar2Mesh);
    }
  });

  tentRoot.add(trussesGroup);

  // 6. MODULAR SIDEWALLS (Front, Back, Left, Right)
  // High quality UV coordinates [0..1] for custom 2D editor print / logos / text
  const createWall = (name, p1, p2, p3, p4, mat) => {
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array([
      // Triangle 1
      p1[0], p1[1], p1[2],
      p2[0], p2[1], p2[2],
      p3[0], p3[1], p3[2],
      // Triangle 2
      p1[0], p1[1], p1[2],
      p3[0], p3[1], p3[2],
      p4[0], p4[1], p4[2]
    ]);
    const uvs = new Float32Array([
      0, 1,   1, 1,   1, 0,
      0, 1,   1, 0,   0, 0
    ]);
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    geom.computeVertexNormals();

    const mesh = new THREE.Mesh(geom, mat);
    mesh.name = name;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  };

  const wallMargin = 0.015; // inset slightly so it sits flush behind the legs

  // Back Wall (default visible, standard backdrop)
  const wb1 = [halfW - wallMargin, eaveHeight, -halfD + wallMargin];
  const wb2 = [-halfW + wallMargin, eaveHeight, -halfD + wallMargin];
  const wb3 = [-halfW + wallMargin, 0, -halfD + wallMargin];
  const wb4 = [halfW - wallMargin, 0, -halfD + wallMargin];
  const wallBackMesh = createWall('wall_back', wb1, wb2, wb3, wb4, wallBackMat);
  tentRoot.add(wallBackMesh);

  // Left Wall
  const wl1 = [-halfW + wallMargin, eaveHeight, -halfD + wallMargin];
  const wl2 = [-halfW + wallMargin, eaveHeight, halfD - wallMargin];
  const wl3 = [-halfW + wallMargin, 0, halfD - wallMargin];
  const wl4 = [-halfW + wallMargin, 0, -halfD + wallMargin];
  const wallLeftMesh = createWall('wall_left', wl1, wl2, wl3, wl4, wallLeftMat);
  tentRoot.add(wallLeftMesh);

  // Right Wall
  const wr1 = [halfW - wallMargin, eaveHeight, halfD - wallMargin];
  const wr2 = [halfW - wallMargin, eaveHeight, -halfD + wallMargin];
  const wr3 = [halfW - wallMargin, 0, -halfD + wallMargin];
  const wr4 = [halfW - wallMargin, 0, halfD - wallMargin];
  const wallRightMesh = createWall('wall_right', wr1, wr2, wr3, wr4, wallRightMat);
  tentRoot.add(wallRightMesh);

  // Front Wall (optional / roll-up doorway)
  const wf1 = [-halfW + wallMargin, eaveHeight, halfD - wallMargin];
  const wf2 = [halfW - wallMargin, eaveHeight, halfD - wallMargin];
  const wf3 = [halfW - wallMargin, 0, halfD - wallMargin];
  const wf4 = [-halfW + wallMargin, 0, halfD - wallMargin];
  const wallFrontMesh = createWall('wall_front', wf1, wf2, wf3, wf4, wallFrontMat);
  wallFrontMesh.visible = false; // default open front for viewing interior
  tentRoot.add(wallFrontMesh);

  // 7. ACCESSORIES (Cast Iron Weight Plates at legs for windy outdoor use)
  const weightsGroup = new THREE.Group();
  weightsGroup.name = 'accessories_weights';
  const weightMat = new THREE.MeshStandardMaterial({
    name: 'material_accessories',
    color: new THREE.Color('#334155'),
    roughness: 0.5,
    metalness: 0.6
  });

  legCorners.forEach(([cx, cz], idx) => {
    // Horseshoe / disc cast iron weight plate
    const discGeom = new THREE.CylinderGeometry(0.14, 0.14, 0.04, 24);
    const discMesh = new THREE.Mesh(discGeom, weightMat);
    discMesh.name = `weight_plate_${idx + 1}`;
    discMesh.position.set(cx, 0.02, cz);
    weightsGroup.add(discMesh);
  });
  tentRoot.add(weightsGroup);

  return tentRoot;
}

async function exportTentGLB() {
  console.log('Generating Commercial Pop-Up Canopy Tent 3D Asset...');
  const scene = new THREE.Scene();
  const tent = createTentScene();
  scene.add(tent);

  const exporter = new GLTFExporter();

  return new Promise((resolve, reject) => {
    exporter.parse(
      scene,
      (gltf) => {
        const outputPath = path.resolve('public/models/tent.glb');
        fs.writeFileSync(outputPath, Buffer.from(gltf));
        console.log(`Successfully generated Tent GLB model at: ${outputPath}`);
        console.log(`Model Size: ${(fs.statSync(outputPath).size / 1024).toFixed(1)} KB`);
        resolve();
      },
      (error) => {
        console.error('Error exporting GLB:', error);
        reject(error);
      },
      { binary: true }
    );
  });
}

exportTentGLB();
