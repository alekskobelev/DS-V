import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { 
  RotateCw, 
  Maximize2, 
  Minimize2, 
  Box, 
  Crosshair, 
  Ruler
} from 'lucide-react';
import { PartGeometryInput } from './MetrologyEquipmentConfigurator';

interface PartVisualizer3DProps {
  partType: PartGeometryInput['partType'];
  lengthMm: number;
  widthMm: number;
  heightMm: number;
  weightKg: number;
  surfaceType: PartGeometryInput['surfaceType'];
  toleranceUm?: number;
  selectedGdt?: string[];
  recommendedDeviceTitle?: string;
  recommendedDeviceMpe?: number;
  heightClass?: string;
  showControls?: boolean;
  className?: string;
}

export const PartVisualizer3D: React.FC<PartVisualizer3DProps> = ({
  partType,
  lengthMm,
  widthMm,
  heightMm,
  weightKg,
  surfaceType,
  toleranceUm = 15,
  selectedGdt = [],
  recommendedDeviceTitle,
  recommendedDeviceMpe,
  heightClass = 'h-[340px] sm:h-[400px]',
  showControls = true,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(true);
  const [showDimensions, setShowDimensions] = useState<boolean>(true);
  const [showGdtDatums, setShowGdtDatums] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // References for Three.js scene objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const partGroupRef = useRef<THREE.Group | null>(null);
  const bboxGroupRef = useRef<THREE.Group | null>(null);
  const datumsGroupRef = useRef<THREE.Group | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Orbit controls state
  const isDraggingRef = useRef<boolean>(false);
  const prevMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const touchDistanceRef = useRef<number | null>(null);
  const cameraRotationRef = useRef<{ theta: number; phi: number; radius: number }>({
    theta: Math.PI / 4,
    phi: Math.PI / 3,
    radius: 350
  });

  // Solid material builder based on surfaceType
  const getPartMaterial = useCallback((surf: PartGeometryInput['surfaceType']) => {
    switch (surf) {
      case 'mirror_glossy':
        return new THREE.MeshStandardMaterial({
          color: 0xe2e8f0,
          roughness: 0.08,
          metalness: 0.95,
          envMapIntensity: 1.5
        });
      case 'dark_carbon':
        return new THREE.MeshStandardMaterial({
          color: 0x1e293b,
          roughness: 0.75,
          metalness: 0.25
        });
      case 'transparent':
        return new THREE.MeshPhysicalMaterial({
          color: 0x93c5fd,
          transparent: true,
          opacity: 0.55,
          roughness: 0.15,
          metalness: 0.05,
          transmission: 0.85,
          ior: 1.52,
          depthWrite: false
        });
      case 'machined_matte':
      default:
        return new THREE.MeshStandardMaterial({
          color: 0x94a3b8,
          roughness: 0.35,
          metalness: 0.85
        });
    }
  }, []);

  // Geometry generator for solid part types
  const buildPartMeshes = useCallback((
    type: PartGeometryInput['partType'],
    dims: { l: number; w: number; h: number },
    surf: PartGeometryInput['surfaceType']
  ): THREE.Group => {
    const group = new THREE.Group();
    const material = getPartMaterial(surf);

    // Normalize scale so largest dimension is ~160 units in Three.js coordinates
    const maxDim = Math.max(dims.l, dims.w, dims.h, 1);
    const scaleFactor = 160 / maxDim;
    const sx = Math.max(dims.l * scaleFactor, 10);
    const sy = Math.max(dims.h * scaleFactor, 10); // Y is up in Three.js
    const sz = Math.max(dims.w * scaleFactor, 10); // Z is depth in Three.js

    switch (type) {
      case 'housing': {
        // Main block with center cylinder bore and side flanges
        const mainGeom = new THREE.BoxGeometry(sx, sy * 0.8, sz, 16, 16, 16);
        const mainMesh = new THREE.Mesh(mainGeom, material);
        mainMesh.position.y = (sy * 0.8) / 2;
        mainMesh.castShadow = true;
        mainMesh.receiveShadow = true;
        group.add(mainMesh);

        // Bored cylinder boss on top
        const cylRadius = Math.min(sx, sz) * 0.32;
        const cylHeight = sy * 0.4;
        const cylGeom = new THREE.CylinderGeometry(cylRadius, cylRadius * 1.05, cylHeight, 32);
        const cylMesh = new THREE.Mesh(cylGeom, material);
        cylMesh.position.y = sy * 0.8 + cylHeight / 2;
        cylMesh.castShadow = true;
        group.add(cylMesh);

        // Inner bore hole (darker inner cylinder)
        const innerBoreGeom = new THREE.CylinderGeometry(cylRadius * 0.7, cylRadius * 0.7, cylHeight * 1.1, 24);
        const innerMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
        const innerMesh = new THREE.Mesh(innerBoreGeom, innerMat);
        innerMesh.position.y = sy * 0.8 + cylHeight / 2;
        group.add(innerMesh);

        // Flange bolt holes on corners
        const cornerPositions = [
          [-sx * 0.4, 0, -sz * 0.4],
          [sx * 0.4, 0, -sz * 0.4],
          [-sx * 0.4, 0, sz * 0.4],
          [sx * 0.4, 0, sz * 0.4]
        ];
        cornerPositions.forEach(([cx, , cz]) => {
          const bossGeom = new THREE.CylinderGeometry(cylRadius * 0.22, cylRadius * 0.22, sy * 0.82, 16);
          const bossMesh = new THREE.Mesh(bossGeom, material);
          bossMesh.position.set(cx, (sy * 0.8) / 2, cz);
          group.add(bossMesh);
        });

        // Stiffener ribs
        const ribGeom = new THREE.BoxGeometry(sx * 0.9, sy * 0.1, sz * 0.08);
        const ribMesh = new THREE.Mesh(ribGeom, material);
        ribMesh.position.set(0, sy * 0.4, sz * 0.45);
        group.add(ribMesh);
        break;
      }

      case 'mold_die': {
        // Base plate block
        const baseGeom = new THREE.BoxGeometry(sx, sy * 0.5, sz, 16, 16, 16);
        const baseMesh = new THREE.Mesh(baseGeom, material);
        baseMesh.position.y = (sy * 0.5) / 2;
        baseMesh.castShadow = true;
        group.add(baseMesh);

        // Cavity core insert
        const cavityGeom = new THREE.BoxGeometry(sx * 0.65, sy * 0.4, sz * 0.65, 16, 16, 16);
        const cavityMesh = new THREE.Mesh(cavityGeom, material);
        cavityMesh.position.y = sy * 0.5 + (sy * 0.4) / 2;
        cavityMesh.castShadow = true;
        group.add(cavityMesh);

        // 4 Guide pillars / Leader pins
        const pillarRadius = Math.min(sx, sz) * 0.06;
        const pillarHeight = sy * 0.7;
        const pillars = [
          [-sx * 0.42, (sy * 0.5) + pillarHeight / 2, -sz * 0.42],
          [sx * 0.42, (sy * 0.5) + pillarHeight / 2, -sz * 0.42],
          [-sx * 0.42, (sy * 0.5) + pillarHeight / 2, sz * 0.42],
          [sx * 0.42, (sy * 0.5) + pillarHeight / 2, sz * 0.42]
        ];
        pillars.forEach(([px, py, pz]) => {
          const pillarGeom = new THREE.CylinderGeometry(pillarRadius, pillarRadius, pillarHeight, 20);
          const pillarMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9, roughness: 0.15 });
          const pMesh = new THREE.Mesh(pillarGeom, pillarMat);
          pMesh.position.set(px, py, pz);
          group.add(pMesh);
        });

        // Contoured freeform cavity pocket depression simulation
        const pocketGeom = new THREE.TorusGeometry(Math.min(sx, sz) * 0.2, Math.min(sx, sz) * 0.05, 16, 32);
        const pocketMesh = new THREE.Mesh(pocketGeom, material);
        pocketMesh.rotation.x = Math.PI / 2;
        pocketMesh.position.y = sy * 0.9;
        group.add(pocketMesh);
        break;
      }

      case 'impeller_blade': {
        // Central hub
        const hubRadiusBottom = Math.min(sx, sz) * 0.4;
        const hubRadiusTop = Math.min(sx, sz) * 0.22;
        const hubHeight = sy * 0.85;
        const hubGeom = new THREE.CylinderGeometry(hubRadiusTop, hubRadiusBottom, hubHeight, 32);
        const hubMesh = new THREE.Mesh(hubGeom, material);
        hubMesh.position.y = hubHeight / 2;
        hubMesh.castShadow = true;
        group.add(hubMesh);

        // Center shaft bore
        const shaftGeom = new THREE.CylinderGeometry(hubRadiusTop * 0.45, hubRadiusTop * 0.45, hubHeight * 1.1, 24);
        const shaftMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });
        const shaftMesh = new THREE.Mesh(shaftGeom, shaftMat);
        shaftMesh.position.y = hubHeight / 2;
        group.add(shaftMesh);

        // Twisted aerodynamic blades (8 blades)
        const bladeCount = 8;
        for (let b = 0; b < bladeCount; b++) {
          const angle = (b / bladeCount) * Math.PI * 2;
          const bladeGroup = new THREE.Group();
          
          const bladeWidth = Math.min(sx, sz) * 0.45;
          const bladeHeight = sy * 0.65;
          const bladeGeom = new THREE.BoxGeometry(bladeWidth, bladeHeight, 2.5, 8, 8, 2);
          
          // Twist vertices slightly to mimic 3D aerodynamic airfoil
          const pos = bladeGeom.attributes.position;
          for (let i = 0; i < pos.count; i++) {
            const vy = pos.getY(i);
            const vx = pos.getX(i);
            const twist = (vy / bladeHeight) * 0.45;
            pos.setZ(i, pos.getZ(i) + Math.sin(vx * 0.15) * 4 + twist * 6);
          }
          bladeGeom.computeVertexNormals();

          const bladeMesh = new THREE.Mesh(bladeGeom, material);
          bladeMesh.position.set(bladeWidth / 2 + hubRadiusBottom * 0.35, bladeHeight / 2, 0);
          bladeMesh.rotation.z = 0.2;
          bladeMesh.rotation.y = 0.3;
          bladeMesh.castShadow = true;
          
          bladeGroup.rotation.y = angle;
          bladeGroup.add(bladeMesh);
          group.add(bladeGroup);
        }
        break;
      }

      case 'frame_weldment': {
        // Welded machine base frame: 4 outer tubes + cross braces
        const beamThick = Math.min(sx, sz, sy) * 0.12;
        
        // Base perimeter 4 beams
        const beamGeomX = new THREE.BoxGeometry(sx, beamThick, beamThick);
        const beamGeomZ = new THREE.BoxGeometry(beamThick, beamThick, sz);

        // Front & Back X-beams
        const bX1 = new THREE.Mesh(beamGeomX, material);
        bX1.position.set(0, beamThick / 2, -sz / 2 + beamThick / 2);
        const bX2 = new THREE.Mesh(beamGeomX, material);
        bX2.position.set(0, beamThick / 2, sz / 2 - beamThick / 2);
        group.add(bX1, bX2);

        // Left & Right Z-beams
        const bZ1 = new THREE.Mesh(beamGeomZ, material);
        bZ1.position.set(-sx / 2 + beamThick / 2, beamThick / 2, 0);
        const bZ2 = new THREE.Mesh(beamGeomZ, material);
        bZ2.position.set(sx / 2 - beamThick / 2, beamThick / 2, 0);
        group.add(bZ1, bZ2);

        // 4 Vertical Uprights
        const vertGeom = new THREE.BoxGeometry(beamThick, sy, beamThick);
        const corners = [
          [-sx / 2 + beamThick / 2, -sz / 2 + beamThick / 2],
          [sx / 2 - beamThick / 2, -sz / 2 + beamThick / 2],
          [-sx / 2 + beamThick / 2, sz / 2 - beamThick / 2],
          [sx / 2 - beamThick / 2, sz / 2 - beamThick / 2],
        ];
        corners.forEach(([cx, cz]) => {
          const vMesh = new THREE.Mesh(vertGeom, material);
          vMesh.position.set(cx, sy / 2, cz);
          vMesh.castShadow = true;
          group.add(vMesh);
        });

        // Top frame
        const topX = new THREE.Mesh(beamGeomX, material);
        topX.position.set(0, sy - beamThick / 2, 0);
        group.add(topX);

        // Diagonal brace
        const diagLen = Math.sqrt(sx * sx + sy * sy) * 0.7;
        const diagGeom = new THREE.BoxGeometry(diagLen, beamThick * 0.8, beamThick * 0.8);
        const diagMesh = new THREE.Mesh(diagGeom, material);
        diagMesh.position.set(0, sy / 2, -sz / 2 + beamThick / 2);
        diagMesh.rotation.z = Math.atan2(sy, sx);
        group.add(diagMesh);
        break;
      }

      case 'sheet_metal': {
        // Stamped sheet metal bracket with curved flanges and cutouts
        const thickness = Math.max(sy * 0.08, 3);
        const mainPlateGeom = new THREE.BoxGeometry(sx * 0.85, thickness, sz * 0.85, 12, 2, 12);
        const mainPlate = new THREE.Mesh(mainPlateGeom, material);
        mainPlate.position.set(0, thickness / 2, 0);
        group.add(mainPlate);

        // Upward 90-degree bent flanges
        const flangeHeight = sy * 0.7;
        const flangeGeom = new THREE.BoxGeometry(sx * 0.85, flangeHeight, thickness);
        const flangeBack = new THREE.Mesh(flangeGeom, material);
        flangeBack.position.set(0, flangeHeight / 2, -sz * 0.425);
        group.add(flangeBack);

        // Side return lips
        const sideFlangeGeom = new THREE.BoxGeometry(thickness, flangeHeight * 0.6, sz * 0.4);
        const sideFlange = new THREE.Mesh(sideFlangeGeom, material);
        sideFlange.position.set(sx * 0.425, flangeHeight * 0.3, 0);
        group.add(sideFlange);

        // Lightening hole ring
        const holeRingGeom = new THREE.TorusGeometry(Math.min(sx, sz) * 0.18, thickness * 0.6, 12, 24);
        const holeRing = new THREE.Mesh(holeRingGeom, material);
        holeRing.rotation.x = Math.PI / 2;
        holeRing.position.set(0, thickness, 0);
        group.add(holeRing);
        break;
      }

      case 'tooling_shaft':
      default: {
        // Stepped precision shaft: 4 stepped cylinder sections along X-axis
        const steps = [
          { r: Math.min(sy, sz) * 0.22, len: sx * 0.25 },
          { r: Math.min(sy, sz) * 0.38, len: sx * 0.35 },
          { r: Math.min(sy, sz) * 0.48, len: sx * 0.25 },
          { r: Math.min(sy, sz) * 0.28, len: sx * 0.15 }
        ];

        let currentOffset = -sx / 2;
        steps.forEach((step, idx) => {
          const stepGeom = new THREE.CylinderGeometry(step.r, step.r, step.len, 32);
          const stepMesh = new THREE.Mesh(stepGeom, material);
          stepMesh.rotation.z = Math.PI / 2;
          stepMesh.position.set(currentOffset + step.len / 2, step.r, 0);
          stepMesh.castShadow = true;
          stepMesh.receiveShadow = true;
          group.add(stepMesh);

          // Keyway on main journal
          if (idx === 1) {
            const keywayGeom = new THREE.BoxGeometry(step.len * 0.6, step.r * 0.3, step.r * 0.3);
            const keywayMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });
            const keyMesh = new THREE.Mesh(keywayGeom, keywayMat);
            keyMesh.position.set(currentOffset + step.len / 2, step.r * 1.85, 0);
            group.add(keyMesh);
          }

          currentOffset += step.len;
        });
        break;
      }
    }

    return group;
  }, [getPartMaterial]);

  // Build Bounding Box Wireframe with Dimensions
  const buildBoundingBoxGroup = useCallback((dims: { l: number; w: number; h: number }): THREE.Group => {
    const group = new THREE.Group();
    const maxDim = Math.max(dims.l, dims.w, dims.h, 1);
    const scaleFactor = 160 / maxDim;
    const sx = Math.max(dims.l * scaleFactor, 10);
    const sy = Math.max(dims.h * scaleFactor, 10);
    const sz = Math.max(dims.w * scaleFactor, 10);

    // Box wireframe cage
    const boxGeom = new THREE.BoxGeometry(sx, sy, sz);
    const edgesGeom = new THREE.EdgesGeometry(boxGeom);
    const lineMat = new THREE.LineDashedMaterial({
      color: 0x3b82f6,
      dashSize: 6,
      gapSize: 4,
      transparent: true,
      opacity: 0.65
    });
    const bboxLines = new THREE.LineSegments(edgesGeom, lineMat);
    bboxLines.computeLineDistances();
    bboxLines.position.y = sy / 2;
    group.add(bboxLines);

    // Corner axes helper
    const axes = new THREE.AxesHelper(Math.min(sx, sy, sz) * 0.35);
    axes.position.set(-sx / 2, 0, -sz / 2);
    group.add(axes);

    return group;
  }, []);

  // Build GD&T Datums & Inspection Points
  const buildDatumsGroup = useCallback((
    _type: PartGeometryInput['partType'],
    dims: { l: number; w: number; h: number }
  ): THREE.Group => {
    const group = new THREE.Group();
    const maxDim = Math.max(dims.l, dims.w, dims.h, 1);
    const scaleFactor = 160 / maxDim;
    const sx = Math.max(dims.l * scaleFactor, 10);
    const sy = Math.max(dims.h * scaleFactor, 10);
    const sz = Math.max(dims.w * scaleFactor, 10);

    // Datum flags: A (Bottom Base), B (Side), C (End)
    const datums = [
      { label: '[A]', pos: [0, 0, sz / 2 + 10], color: 0x10b981 },
      { label: '[B]', pos: [-sx / 2 - 12, sy / 2, 0], color: 0x3b82f6 },
      { label: '[C]', pos: [0, sy + 12, 0], color: 0x8b5cf6 }
    ];

    datums.forEach((d) => {
      // Small sphere marker
      const sphereGeom = new THREE.SphereGeometry(3.5, 16, 16);
      const sphereMat = new THREE.MeshBasicMaterial({ color: d.color });
      const sphereMesh = new THREE.Mesh(sphereGeom, sphereMat);
      sphereMesh.position.set(d.pos[0], d.pos[1], d.pos[2]);
      group.add(sphereMesh);

      // Leader line to surface
      const points = [
        new THREE.Vector3(d.pos[0], d.pos[1], d.pos[2]),
        new THREE.Vector3(d.pos[0] * 0.7, d.pos[1] * 0.7, d.pos[2] * 0.7)
      ];
      const lineGeom = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({ color: d.color, linewidth: 2 });
      const line = new THREE.Line(lineGeom, lineMat);
      group.add(line);
    });

    // Touch probe points (red inspection dots)
    const probePoints = [
      [sx * 0.25, sy * 0.8, sz * 0.2],
      [-sx * 0.25, sy * 0.8, -sz * 0.2],
      [sx * 0.35, sy * 0.2, 0],
      [0, sy * 0.5, sz * 0.35]
    ];
    probePoints.forEach(([px, py, pz]) => {
      const probeDotGeom = new THREE.SphereGeometry(2.5, 12, 12);
      const probeDotMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
      const probeMesh = new THREE.Mesh(probeDotGeom, probeDotMat);
      probeMesh.position.set(px, py, pz);
      group.add(probeMesh);
    });

    return group;
  }, []);

  // Initialize Three.js Scene
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 400;
    const height = containerRef.current.clientHeight || 340;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Background gradient color
    scene.background = new THREE.Color(0x0f172a); // Slate-900

    // Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 1, 2000);
    cameraRef.current = camera;

    // Position camera based on spherical coords
    const updateCameraPos = () => {
      const { theta, phi, radius } = cameraRotationRef.current;
      camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
      camera.position.y = radius * Math.cos(phi);
      camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
      camera.lookAt(0, 30, 0);
    };
    updateCameraPos();

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(180, 250, 150);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.6);
    fillLight.position.set(-150, 100, -100);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x818cf8, 0.5);
    rimLight.position.set(0, -100, -180);
    scene.add(rimLight);

    // Metrology Granite Inspection Table / Floor Grid
    const gridHelper = new THREE.GridHelper(320, 32, 0x3b82f6, 0x1e293b);
    gridHelper.position.y = -0.5;
    scene.add(gridHelper);

    // Granite Plate Base
    const tableGeom = new THREE.BoxGeometry(340, 12, 340);
    const tableMat = new THREE.MeshStandardMaterial({
      color: 0x090d16,
      roughness: 0.9,
      metalness: 0.1
    });
    const tableMesh = new THREE.Mesh(tableGeom, tableMat);
    tableMesh.position.y = -6.5;
    tableMesh.receiveShadow = true;
    scene.add(tableMesh);

    // Animation Loop
    let lastTime = performance.now();
    const animate = () => {
      const now = performance.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      if (isAutoRotating && !isDraggingRef.current) {
        cameraRotationRef.current.theta += delta * 0.45;
        updateCameraPos();
      }

      renderer.render(scene, camera);
      animFrameIdRef.current = requestAnimationFrame(animate);
    };

    animFrameIdRef.current = requestAnimationFrame(animate);

    // Resize Observer
    const handleResize = () => {
      if (!containerRef.current || !renderer || !camera) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(containerRef.current);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      resizeObserver.disconnect();
      renderer.dispose();
    };
  }, []);

  // Update Geometry & Meshes when inputs change
  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    // Clean up old part
    if (partGroupRef.current) scene.remove(partGroupRef.current);
    if (bboxGroupRef.current) scene.remove(bboxGroupRef.current);
    if (datumsGroupRef.current) scene.remove(datumsGroupRef.current);

    // Build new solid part
    const dims = { l: lengthMm, w: widthMm, h: heightMm };
    const partGroup = buildPartMeshes(partType, dims, surfaceType);
    partGroupRef.current = partGroup;
    scene.add(partGroup);

    // Bounding Box
    if (showDimensions) {
      const bboxGroup = buildBoundingBoxGroup(dims);
      bboxGroupRef.current = bboxGroup;
      scene.add(bboxGroup);
    }

    // Datums & Points
    if (showGdtDatums) {
      const datumsGroup = buildDatumsGroup(partType, dims);
      datumsGroupRef.current = datumsGroup;
      scene.add(datumsGroup);
    }
  }, [
    partType,
    lengthMm,
    widthMm,
    heightMm,
    surfaceType,
    showDimensions,
    showGdtDatums,
    buildPartMeshes,
    buildBoundingBoxGroup,
    buildDatumsGroup
  ]);

  // Mouse / Touch Orbit Controls Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    prevMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current || !cameraRef.current) return;
    const dx = e.clientX - prevMousePosRef.current.x;
    const dy = e.clientY - prevMousePosRef.current.y;
    prevMousePosRef.current = { x: e.clientX, y: e.clientY };

    cameraRotationRef.current.theta -= dx * 0.008;
    cameraRotationRef.current.phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, cameraRotationRef.current.phi - dy * 0.008));

    const { theta, phi, radius } = cameraRotationRef.current;
    cameraRef.current.position.x = radius * Math.sin(phi) * Math.sin(theta);
    cameraRef.current.position.y = radius * Math.cos(phi);
    cameraRef.current.position.z = radius * Math.sin(phi) * Math.cos(theta);
    cameraRef.current.lookAt(0, 30, 0);
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!cameraRef.current) return;
    cameraRotationRef.current.radius = Math.max(120, Math.min(650, cameraRotationRef.current.radius + e.deltaY * 0.4));
    const { theta, phi, radius } = cameraRotationRef.current;
    cameraRef.current.position.x = radius * Math.sin(phi) * Math.sin(theta);
    cameraRef.current.position.y = radius * Math.cos(phi);
    cameraRef.current.position.z = radius * Math.sin(phi) * Math.cos(theta);
    cameraRef.current.lookAt(0, 30, 0);
  };

  // Touch Support (1-finger orbit, 2-finger pinch-to-zoom)
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      isDraggingRef.current = true;
      touchDistanceRef.current = null;
      prevMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2) {
      isDraggingRef.current = false;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchDistanceRef.current = Math.hypot(dx, dy);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!cameraRef.current) return;

    // 1-finger orbit drag
    if (e.touches.length === 1 && isDraggingRef.current) {
      const dx = e.touches[0].clientX - prevMousePosRef.current.x;
      const dy = e.touches[0].clientY - prevMousePosRef.current.y;
      prevMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };

      cameraRotationRef.current.theta -= dx * 0.01;
      cameraRotationRef.current.phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, cameraRotationRef.current.phi - dy * 0.01));

      const { theta, phi, radius } = cameraRotationRef.current;
      cameraRef.current.position.x = radius * Math.sin(phi) * Math.sin(theta);
      cameraRef.current.position.y = radius * Math.cos(phi);
      cameraRef.current.position.z = radius * Math.sin(phi) * Math.cos(theta);
      cameraRef.current.lookAt(0, 30, 0);
    } 
    // 2-finger pinch-to-zoom
    else if (e.touches.length === 2 && touchDistanceRef.current !== null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const currentDist = Math.hypot(dx, dy);
      const delta = touchDistanceRef.current - currentDist;
      touchDistanceRef.current = currentDist;

      cameraRotationRef.current.radius = Math.max(120, Math.min(650, cameraRotationRef.current.radius + delta * 0.8));
      const { theta, phi, radius } = cameraRotationRef.current;
      cameraRef.current.position.x = radius * Math.sin(phi) * Math.sin(theta);
      cameraRef.current.position.y = radius * Math.cos(phi);
      cameraRef.current.position.z = radius * Math.sin(phi) * Math.cos(theta);
      cameraRef.current.lookAt(0, 30, 0);
    }
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
    touchDistanceRef.current = null;
  };

  // Preset Camera Angles
  const setCameraPreset = (angle: 'iso' | 'top' | 'front' | 'side') => {
    if (!cameraRef.current) return;
    setIsAutoRotating(false);
    switch (angle) {
      case 'iso':
        cameraRotationRef.current = { theta: Math.PI / 4, phi: Math.PI / 3, radius: 340 };
        break;
      case 'top':
        cameraRotationRef.current = { theta: 0, phi: 0.12, radius: 340 };
        break;
      case 'front':
        cameraRotationRef.current = { theta: 0, phi: Math.PI / 2.05, radius: 340 };
        break;
      case 'side':
        cameraRotationRef.current = { theta: Math.PI / 2, phi: Math.PI / 2.05, radius: 340 };
        break;
    }
    const { theta, phi, radius } = cameraRotationRef.current;
    cameraRef.current.position.x = radius * Math.sin(phi) * Math.sin(theta);
    cameraRef.current.position.y = radius * Math.cos(phi);
    cameraRef.current.position.z = radius * Math.sin(phi) * Math.cos(theta);
    cameraRef.current.lookAt(0, 30, 0);
  };

  const partTypeLabel = useMemo(() => {
    switch (partType) {
      case 'housing': return 'Корпусная деталь / Картер';
      case 'mold_die': return 'Пресс-форма / Штамп';
      case 'impeller_blade': return 'Крыльчатка / Лопаточный венец';
      case 'frame_weldment': return 'Сварная рама / Станина';
      case 'sheet_metal': return 'Листовая штамповка';
      case 'tooling_shaft': return 'Ступенчатый вал / Шпиндель';
    }
  }, [partType]);

  return (
    <div 
      ref={containerRef}
      className={`relative bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col ${heightClass} ${className} ${
        isFullscreen ? 'fixed inset-4 z-50 h-auto max-h-none' : ''
      }`}
    >
      {/* Top Overlay Badge & Quick Status */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-2 pointer-events-none">
        <div className="px-2.5 py-1 rounded-lg bg-slate-900/90 backdrop-blur-md border border-slate-700 text-white flex items-center gap-1.5 shadow-lg pointer-events-auto">
          <Box className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-xs font-bold">{partTypeLabel}</span>
        </div>

        <div className="px-2 py-1 rounded-lg bg-blue-950/80 backdrop-blur-md border border-blue-800/80 text-blue-200 font-mono text-[11px] shadow-sm pointer-events-auto">
          {lengthMm} × {widthMm} × {heightMm} мм • {weightKg} кг
        </div>
      </div>

      {/* Top Right Tool Buttons */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setIsAutoRotating(prev => !prev)}
          className={`p-2 rounded-lg border text-xs transition-all cursor-pointer ${
            isAutoRotating 
              ? 'bg-blue-600 text-white border-blue-500 shadow-sm' 
              : 'bg-slate-900/80 backdrop-blur-md text-slate-300 border-slate-700 hover:text-white hover:bg-slate-800'
          }`}
          title={isAutoRotating ? 'Остановить авто-вращение' : 'Включить авто-вращение'}
        >
          <RotateCw className={`w-3.5 h-3.5 ${isAutoRotating ? 'animate-spin' : ''}`} />
        </button>

        <button
          type="button"
          onClick={() => setIsFullscreen(prev => !prev)}
          className="p-2 rounded-lg bg-slate-900/80 backdrop-blur-md text-slate-300 border border-slate-700 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          title={isFullscreen ? 'Свернуть' : 'Развернуть на весь экран'}
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* 3D WebGL Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="w-full h-full cursor-grab active:cursor-grabbing touch-none block"
      />

      {/* Bottom Floating Control Bar - Camera Presets & Layer Toggles on a Single Horizontal Line */}
      {showControls && (
        <div className="absolute bottom-3 inset-x-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          {/* Camera Preset Angles */}
          <div className="flex items-center gap-1 bg-slate-900/90 backdrop-blur-md border border-slate-700/90 p-1 rounded-xl shadow-lg pointer-events-auto">
            <span className="text-[10px] text-slate-400 font-bold px-1.5 hidden sm:inline">Ракурс:</span>
            {[
              { id: 'iso', label: '3D Изометрия' },
              { id: 'top', label: 'XY Верх' },
              { id: 'front', label: 'XZ Перед' },
              { id: 'side', label: 'YZ Бок' }
            ].map((cam) => (
              <button
                key={cam.id}
                type="button"
                onClick={() => setCameraPreset(cam.id as any)}
                className="px-2 py-1 rounded-lg text-[10px] font-mono font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {cam.label}
              </button>
            ))}
          </div>

          {/* Toggle Layers (Dimensions, GD&T Datums) */}
          <div className="flex items-center gap-1 bg-slate-900/90 backdrop-blur-md border border-slate-700/90 p-1 rounded-xl shadow-lg pointer-events-auto">
            <button
              type="button"
              onClick={() => setShowDimensions(prev => !prev)}
              className={`px-2 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                showDimensions 
                  ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40 shadow-xs' 
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
              title="Габаритный куб и координатные оси"
            >
              <Ruler className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold">Габариты</span>
            </button>
            <button
              type="button"
              onClick={() => setShowGdtDatums(prev => !prev)}
              className={`px-2 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                showGdtDatums 
                  ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 shadow-xs' 
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
              title="Базы [A][B][C] и контрольные точки"
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold">Базы</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
