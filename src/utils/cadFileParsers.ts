import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';

/**
 * Format bytes to readable Russian file size (КБ, МБ, ГБ)
 */
export function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0 || isNaN(bytes)) return '0 КБ';
  const k = 1024;
  const sizes = ['Б', 'КБ', 'МБ', 'ГБ'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const val = parseFloat((bytes / Math.pow(k, i)).toFixed(1));
  return `${val} ${sizes[i] || 'КБ'}`;
}

/**
 * Center geometry around origin and scale bounding box to target scene size
 */
export function normalizeAndCenterGeometry(geom: THREE.BufferGeometry, targetSize: number = 3.6) {
  geom.computeBoundingBox();
  if (!geom.boundingBox) return;
  const center = new THREE.Vector3();
  geom.boundingBox.getCenter(center);
  geom.translate(-center.x, -center.y, -center.z);

  const size = new THREE.Vector3();
  geom.boundingBox.getSize(size);
  const maxDim = Math.max(size.x, size.y, size.z);
  if (maxDim > 0) {
    const scale = targetSize / maxDim;
    geom.scale(scale, scale, scale);
  }
}

/**
 * Parse binary or ASCII STL file buffer into Three.js BufferGeometry
 */
export function parseStlBuffer(buffer: ArrayBuffer): THREE.BufferGeometry {
  const loader = new STLLoader();
  const geom = loader.parse(buffer);
  geom.computeVertexNormals();
  normalizeAndCenterGeometry(geom, 3.6);
  return geom;
}

/**
 * Parse Point Cloud text (.xyz, .pts, .asc, .txt, .csv)
 */
export function parsePointCloudText(text: string): { geometry: THREE.BufferGeometry; pointCount: number } {
  const lines = text.split(/\r?\n/);
  const positions: number[] = [];
  const colors: number[] = [];
  let hasColors = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('#') || line.startsWith('//')) continue;
    const parts = line.split(/[\s,;]+/).map(Number).filter(n => !isNaN(n));
    if (parts.length >= 3) {
      positions.push(parts[0], parts[1], parts[2]);
      if (parts.length >= 6) {
        hasColors = true;
        const r = parts[3] > 1 ? parts[3] / 255 : parts[3];
        const g = parts[4] > 1 ? parts[4] / 255 : parts[4];
        const b = parts[5] > 1 ? parts[5] / 255 : parts[5];
        colors.push(r, g, b);
      }
    }
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  if (hasColors && colors.length === positions.length) {
    geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  }
  normalizeAndCenterGeometry(geom, 3.6);
  return { geometry: geom, pointCount: positions.length / 3 };
}

/**
 * Parse STEP (.stp, .step) text representation to BufferGeometry
 */
export function parseStepText(text: string): { geometry: THREE.BufferGeometry; pointCount: number; facetCount: number } {
  const pointsMap = new Map<number, [number, number, number]>();
  
  // Extract CARTESIAN_POINT entities
  const cartesianRegex = /#(\d+)\s*=\s*CARTESIAN_POINT\s*\([^,]*,?\s*\(\s*([-\d.eE+]+)\s*,\s*([-\d.eE+]+)\s*,\s*([-\d.eE+]+)\s*\)\s*\)/g;
  let match;
  while ((match = cartesianRegex.exec(text)) !== null) {
    const id = parseInt(match[1], 10);
    const x = parseFloat(match[2]);
    const y = parseFloat(match[3]);
    const z = parseFloat(match[4]);
    if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
      pointsMap.set(id, [x, y, z]);
    }
  }

  // Extract POLY_LOOP polygon faces
  const polyLoopRegex = /#\d+\s*=\s*POLY_LOOP\s*\([^,]*,?\s*\(([^)]+)\)\s*\)/g;
  const triangles: number[] = [];
  while ((match = polyLoopRegex.exec(text)) !== null) {
    const ids = match[1].split(',').map(s => parseInt(s.replace(/#/g, '').trim(), 10));
    if (ids.length >= 3) {
      const p0 = pointsMap.get(ids[0]);
      if (p0) {
        for (let i = 1; i < ids.length - 1; i++) {
          const p1 = pointsMap.get(ids[i]);
          const p2 = pointsMap.get(ids[i + 1]);
          if (p1 && p2) {
            triangles.push(...p0, ...p1, ...p2);
          }
        }
      }
    }
  }

  const geom = new THREE.BufferGeometry();
  if (triangles.length > 0) {
    geom.setAttribute('position', new THREE.Float32BufferAttribute(triangles, 3));
    geom.computeVertexNormals();
  } else if (pointsMap.size > 0) {
    const flat: number[] = [];
    pointsMap.forEach(([x, y, z]) => flat.push(x, y, z));
    geom.setAttribute('position', new THREE.Float32BufferAttribute(flat, 3));
  }
  normalizeAndCenterGeometry(geom, 3.6);
  return { 
    geometry: geom, 
    pointCount: pointsMap.size, 
    facetCount: Math.floor(triangles.length / 9) 
  };
}
