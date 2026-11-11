import * as THREE from 'three';
import { TentConfiguration, PrintableSurface } from '../types/configurator';
import { createSurfaceCanvasTexture } from './textureGenerator';

export interface ModelPartMapping {
  roofMesh: THREE.Mesh | null;
  valanceMeshes: THREE.Mesh[];
  frameLegsGroup: THREE.Object3D | null;
  frameTrussesGroup: THREE.Object3D | null;
  walls: {
    front: THREE.Mesh | null;
    back: THREE.Mesh | null;
    left: THREE.Mesh | null;
    right: THREE.Mesh | null;
  };
  accessoriesGroup: THREE.Object3D | null;
  allMeshes: THREE.Mesh[];
}

/**
 * Traverses the loaded GLB/GLTF hierarchy and identifies tent components
 * by explicit names or intelligent heuristic keyword matching.
 */
export function identifyModelParts(scene: THREE.Object3D): ModelPartMapping {
  const mapping: ModelPartMapping = {
    roofMesh: null,
    valanceMeshes: [],
    frameLegsGroup: null,
    frameTrussesGroup: null,
    walls: { front: null, back: null, left: null, right: null },
    accessoriesGroup: null,
    allMeshes: [],
  };

  scene.traverse((node) => {
    const name = (node.name || '').toLowerCase();

    if (node instanceof THREE.Mesh) {
      mapping.allMeshes.push(node);
      node.castShadow = true;
      node.receiveShadow = true;

      // Identify Roof Canopy
      if (name === 'roof' || (name.includes('roof') && !name.includes('rafter')) || name.includes('canopy')) {
        mapping.roofMesh = node;
      }
      // Identify Valance Borders
      else if (name.startsWith('valance_') || name.includes('valance') || name.includes('border') || name.includes('trim')) {
        mapping.valanceMeshes.push(node);
      }
      // Identify Sidewalls
      else if (name === 'wall_back' || name.includes('wall_back') || name.includes('back_wall')) {
        mapping.walls.back = node;
      } else if (name === 'wall_left' || name.includes('wall_left') || name.includes('left_wall')) {
        mapping.walls.left = node;
      } else if (name === 'wall_right' || name.includes('wall_right') || name.includes('right_wall')) {
        mapping.walls.right = node;
      } else if (name === 'wall_front' || name.includes('wall_front') || name.includes('front_wall')) {
        mapping.walls.front = node;
      }
    }

    // Identify Groups
    if (name === 'frame_legs' || name.includes('legs')) {
      mapping.frameLegsGroup = node;
    } else if (name === 'frame_trusses' || name.includes('truss') || name.includes('frame')) {
      mapping.frameTrussesGroup = node;
    } else if (name === 'accessories_weights' || name.includes('weight') || name.includes('accessories')) {
      mapping.accessoriesGroup = node;
    }
  });

  return mapping;
}

// Texture instance cache per surface to prevent memory leaks
const textureMap = new Map<PrintableSurface, THREE.CanvasTexture>();

/**
 * Synchronizes the 3D model materials, textures, and mesh visibilities with the current configuration
 */
export async function applyConfigurationToModel(
  _scene: THREE.Object3D,
  parts: ModelPartMapping,
  config: TentConfiguration
) {
  // 1. Frame Finish / Color
  let frameColor = new THREE.Color('#94A3B8');
  let frameRoughness = 0.35;
  let frameMetalness = 0.85;

  if (config.frameFinish === 'matte-black') {
    frameColor = new THREE.Color('#1E293B');
    frameRoughness = 0.55;
    frameMetalness = 0.5;
  } else if (config.frameFinish === 'powder-white') {
    frameColor = new THREE.Color('#F1F5F9');
    frameRoughness = 0.3;
    frameMetalness = 0.3;
  }

  // Update Frame materials (legs & trusses)
  const updateFrameMaterial = (obj: THREE.Object3D | null) => {
    if (!obj) return;
    obj.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const mat = (Array.isArray(child.material) ? child.material[0] : child.material) as THREE.MeshStandardMaterial;
        if (mat.name === 'material_frame' || mat.name.includes('frame') || mat.name.includes('metal')) {
          mat.color.copy(frameColor);
          mat.roughness = frameRoughness;
          mat.metalness = frameMetalness;
          mat.needsUpdate = true;
        }
      }
    });
  };

  updateFrameMaterial(parts.frameLegsGroup);
  updateFrameMaterial(parts.frameTrussesGroup);

  // 2. Synchronize Roof Canopy (Color + Canvas Texture with custom print)
  if (parts.roofMesh) {
    const existingTex = textureMap.get('roof-front');
    const updatedTex = await createSurfaceCanvasTexture('roof-front', config, existingTex);
    textureMap.set('roof-front', updatedTex);

    let mat = parts.roofMesh.material as THREE.MeshStandardMaterial;
    if (!mat || Array.isArray(mat)) {
      mat = new THREE.MeshStandardMaterial({ name: 'material_roof', roughness: 0.6, metalness: 0.1 });
      parts.roofMesh.material = mat;
    }
    mat.map = updatedTex;
    mat.color.set('#FFFFFF'); // Base tint neutral so canvas colors render true
    mat.roughness = 0.65;
    mat.metalness = 0.05;
    mat.needsUpdate = true;
  }

  // 3. Synchronize Valances (Borders)
  const valanceTex = await createSurfaceCanvasTexture('valance-front', config, textureMap.get('valance-front'));
  textureMap.set('valance-front', valanceTex);

  const valanceColor = new THREE.Color(config.matchValanceColor ? config.roofColor : config.valanceColor);

  parts.valanceMeshes.forEach((mesh) => {
    let mat = mesh.material as THREE.MeshStandardMaterial;
    if (!mat || Array.isArray(mat)) {
      mat = new THREE.MeshStandardMaterial({ name: 'material_valance' });
      mesh.material = mat;
    }

    if (mesh.name === 'valance_front') {
      // Front valance gets the custom texture
      mat.map = valanceTex;
      mat.color.set('#FFFFFF');
    } else {
      // Side and rear valances use solid valance color
      mat.map = null;
      mat.color.copy(valanceColor);
    }
    mat.roughness = 0.65;
    mat.metalness = 0.05;
    mat.needsUpdate = true;
  });

  // 4. Synchronize Sidewalls (Visibility, Color, Wall Style, Prints)
  const wallMappings: Array<{
    key: keyof typeof config.walls;
    surfaceId: PrintableSurface;
    mesh: THREE.Mesh | null;
  }> = [
    { key: 'back', surfaceId: 'wall-back', mesh: parts.walls.back },
    { key: 'left', surfaceId: 'wall-left', mesh: parts.walls.left },
    { key: 'right', surfaceId: 'wall-right', mesh: parts.walls.right },
    { key: 'front', surfaceId: 'wall-front', mesh: parts.walls.front },
  ];

  for (const { key, surfaceId, mesh } of wallMappings) {
    if (mesh) {
      const wallCfg = config.walls[key];
      mesh.visible = wallCfg.enabled;

      if (wallCfg.enabled) {
        const wallTex = await createSurfaceCanvasTexture(surfaceId, config, textureMap.get(surfaceId));
        textureMap.set(surfaceId, wallTex);

        let mat = mesh.material as THREE.MeshStandardMaterial;
        if (!mat || Array.isArray(mat)) {
          mat = new THREE.MeshStandardMaterial({ name: `material_${surfaceId}`, side: THREE.DoubleSide });
          mesh.material = mat;
        }
        mat.map = wallTex;
        mat.color.set('#FFFFFF'); // Tint neutral so canvas graphics show with exact fidelity
        mat.roughness = 0.7;
        mat.metalness = 0.05;
        mat.needsUpdate = true;
      }
    }
  }

  // 5. Synchronize Accessories (Weight plates)
  if (parts.accessoriesGroup) {
    parts.accessoriesGroup.visible = config.accessories.weightPlates;
  }
}
