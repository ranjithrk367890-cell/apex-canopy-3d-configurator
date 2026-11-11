import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Polyfills for Node environment
globalThis.self = globalThis;
globalThis.window = globalThis;

console.log('--- RUNNING 3D MODEL INTEGRITY UNIT TESTS ---');

const modelPath = path.resolve('public/models/tent.glb');
assert.ok(fs.existsSync(modelPath), 'Model file public/models/tent.glb must exist');
console.log(`✓ Test 1 Passed: tent.glb exists (${(fs.statSync(modelPath).size / 1024).toFixed(1)} KB)`);

const data = fs.readFileSync(modelPath);
const arrayBuffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);

const loader = new GLTFLoader();

loader.parse(
  arrayBuffer,
  '',
  (gltf) => {
    // Test 2: Bounding box & Metric Scale
    const box = new THREE.Box3().setFromObject(gltf.scene);
    const size = new THREE.Vector3();
    box.getSize(size);

    assert.ok(size.x >= 2.8 && size.x <= 3.5, `Width (${size.x.toFixed(2)}m) should be approximately 3.0m (10ft)`);
    assert.ok(size.y >= 3.0 && size.y <= 3.5, `Peak height (${size.y.toFixed(2)}m) should be approximately 3.2m (10.5ft)`);
    assert.ok(size.z >= 2.8 && size.z <= 3.5, `Depth (${size.z.toFixed(2)}m) should be approximately 3.0m (10ft)`);
    console.log(`✓ Test 2 Passed: Real-world metric dimensions verified (${size.x.toFixed(2)}m x ${size.y.toFixed(2)}m x ${size.z.toFixed(2)}m)`);

    // Test 3: Structural mesh presence
    const meshNames = new Set();
    const materialNames = new Set();

    gltf.scene.traverse((node) => {
      if (node.isMesh) {
        meshNames.add(node.name);
        const mat = node.material;
        if (Array.isArray(mat)) {
          mat.forEach(m => materialNames.add(m.name));
        } else if (mat) {
          materialNames.add(mat.name);
        }

        // UV verification on printable meshes
        if (node.name.startsWith('roof') || node.name.startsWith('valance') || node.name.startsWith('wall')) {
          assert.ok(node.geometry.attributes.uv, `Mesh "${node.name}" must have UV coordinates for 2D/3D printing`);
        }
      }
    });

    assert.ok(meshNames.has('roof'), 'Must have "roof" mesh');
    assert.ok(meshNames.has('valance_front'), 'Must have "valance_front" mesh');
    assert.ok(meshNames.has('wall_back'), 'Must have "wall_back" mesh');
    assert.ok(meshNames.has('wall_left'), 'Must have "wall_left" mesh');
    assert.ok(meshNames.has('wall_right'), 'Must have "wall_right" mesh');
    console.log(`✓ Test 3 Passed: All required meshes and UV coordinates verified (${meshNames.size} meshes total)`);

    // Test 4: Material separation
    assert.ok(materialNames.has('material_roof'), 'Must have isolated "material_roof"');
    assert.ok(materialNames.has('material_frame'), 'Must have isolated "material_frame"');
    console.log(`✓ Test 4 Passed: Isolated PBR materials verified (${materialNames.size} materials total)`);

    console.log('All 3D model integrity unit tests passed successfully!\n');
    process.exit(0);
  },
  (err) => {
    console.error('Failed to parse GLB in unit tests:', err);
    process.exit(1);
  }
);

