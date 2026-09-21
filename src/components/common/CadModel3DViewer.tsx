import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { 
  RotateCw, 
  RotateCcw,
  Layers, 
  Eye, 
  EyeOff,
  Maximize2, 
  Minimize2, 
  Camera, 
  Compass, 
  Activity, 
  Scissors, 
  Info,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  Box,
  Cpu,
  Scan,
  Grid,
  Disc,
  Filter,
  Check,
  Download,
  Loader2,
  HardDrive,
  Lock,
  Crosshair,
  ShieldCheck,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Model3DItem, InspectionPoint, ViewerMode, GeometryPresetType, canUserManage3DModels } from '../../types';
import { DEFAULT_3D_MODELS } from '../../data/default3dModels';
import { parseStlBuffer, parsePointCloudText, parseStepText } from '../../utils/cadFileParsers';

export type { ViewerMode, Model3DItem, InspectionPoint };
export type PresetModelType = string;
export type ShadingStyle = 'default' | 'glossy_chrome' | 'matte_titanium' | 'cad_blue' | 'gold_brass' | 'flat_shading' | 'wire_overlay' | 'normals';

interface CadModel3DViewerProps {
  initialModel?: string;
  initialMode?: ViewerMode;
  customModels?: Model3DItem[];
  className?: string;
  showTitle?: boolean;
  onModelSelect?: (modelId: string) => void;
  compactHeight?: boolean;
}

export const CadModel3DViewer: React.FC<CadModel3DViewerProps> = ({
  initialModel,
  initialMode = 'colormap',
  customModels,
  className = '',
  showTitle = true,
  onModelSelect,
  compactHeight = false
}) => {
  const { models3D: contextModels, currentUser, showToast } = useApp();
  const canManage3D = canUserManage3DModels(currentUser);
  const availableModels = customModels && customModels.length > 0 
    ? customModels 
    : (contextModels && contextModels.length > 0 ? contextModels : DEFAULT_3D_MODELS);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameIdRef = useRef<number | null>(null);

  const [activeModelId, setActiveModelId] = useState<string>(() => {
    if (initialModel && availableModels.some(m => m.id === initialModel)) {
      return initialModel;
    }
    return availableModels[0]?.id || 'impeller';
  });

  const [activeMode, setActiveMode] = useState<ViewerMode>(initialMode);
  const [activeShading, setActiveShading] = useState<ShadingStyle>('default');
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(true);
  const [isClipping, setIsClipping] = useState<boolean>(false);
  const [clipAxis, setClipAxis] = useState<'y' | 'x' | 'z'>('y');
  const [clipOffset, setClipOffset] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showUi, setShowUi] = useState<boolean>(typeof window !== 'undefined' ? window.innerWidth >= 768 : true);
  const [selectedPoint, setSelectedPoint] = useState<InspectionPoint | null>(null);
  const [renderFps, setRenderFps] = useState<number>(60);

  // Metrology 3D Projected Inspection Callouts & Trihedron Labels
  const [projectedCallouts, setProjectedCallouts] = useState<Array<{
    id: string;
    name: string;
    shortLabel: string;
    surfaceName: string;
    deviation: number;
    status: 'nominal' | 'warning' | 'critical';
    screenX: number;
    screenY: number;
    badgeX: number;
    badgeY: number;
    ctrlX: number;
    ctrlY: number;
    isVisible: boolean;
    dotColor: string;
    lineColor: string;
  }>>([]);

  const [axesLabels, setAxesLabels] = useState<{
    x: { x: number; y: number; visible: boolean };
    y: { x: number; y: number; visible: boolean };
    z: { x: number; y: number; visible: boolean };
  }>({
    x: { x: 0, y: 0, visible: false },
    y: { x: 0, y: 0, visible: false },
    z: { x: 0, y: 0, visible: false },
  });

  // Sync active model if initialModel changes
  useEffect(() => {
    if (initialModel && availableModels.some(m => m.id === initialModel)) {
      setActiveModelId(initialModel);
    }
  }, [initialModel, availableModels]);

  const currentModel = useMemo(() => {
    return availableModels.find(m => m.id === activeModelId) || availableModels[0] || DEFAULT_3D_MODELS[0];
  }, [availableModels, activeModelId]);

  // Geometry cache for custom uploaded files (.stl, .stp, .xyz, etc.)
  const [loadedGeometries, setLoadedGeometries] = useState<Record<string, THREE.BufferGeometry>>({});
  const [isLoadingCustomFile, setIsLoadingCustomFile] = useState<boolean>(false);
  const [customFileError, setCustomFileError] = useState<string | null>(null);

  // Active custom file based on the selected mode
  const activeCustomFile = useMemo(() => {
    if (activeMode === 'cad' && currentModel.cadFileUrl) {
      return {
        url: currentModel.cadFileUrl,
        name: currentModel.cadFileName || currentModel.cadFileUrl.split('/').pop() || 'model_cad.stp',
        size: currentModel.cadFileSize,
        type: 'cad' as const
      };
    }
    if ((activeMode === 'mesh' || activeMode === 'colormap') && (currentModel.scanMeshUrl || currentModel.customMeshUrl)) {
      const url = (currentModel.scanMeshUrl || currentModel.customMeshUrl)!;
      return {
        url,
        name: currentModel.scanMeshFileName || url.split('/').pop() || 'scan_mesh.stl',
        size: currentModel.scanMeshFileSize,
        type: 'mesh' as const
      };
    }
    if (activeMode === 'points' && (currentModel.pointCloudUrl || currentModel.scanMeshUrl)) {
      const url = (currentModel.pointCloudUrl || currentModel.scanMeshUrl)!;
      return {
        url,
        name: currentModel.pointCloudFileName || url.split('/').pop() || 'point_cloud.xyz',
        size: currentModel.pointCloudFileSize,
        type: 'points' as const
      };
    }
    return null;
  }, [activeMode, currentModel]);

  // Load custom 3D files on demand
  useEffect(() => {
    if (!activeCustomFile) return;
    const { url, name } = activeCustomFile;
    if (loadedGeometries[url]) return;

    let isCancelled = false;
    setIsLoadingCustomFile(true);
    setCustomFileError(null);

    const loadGeometry = async () => {
      try {
        const lower = (name || url).toLowerCase();
        let geom: THREE.BufferGeometry | null = null;

        if (lower.endsWith('.stl')) {
          const res = await fetch(url);
          const buf = await res.arrayBuffer();
          geom = parseStlBuffer(buf);
        } else if (lower.endsWith('.xyz') || lower.endsWith('.pts') || lower.endsWith('.asc') || lower.endsWith('.txt')) {
          const res = await fetch(url);
          const text = await res.text();
          geom = parsePointCloudText(text).geometry;
        } else if (lower.endsWith('.stp') || lower.endsWith('.step')) {
          const res = await fetch(url);
          const text = await res.text();
          geom = parseStepText(text).geometry;
        } else {
          const res = await fetch(url);
          const buf = await res.arrayBuffer();
          try {
            geom = parseStlBuffer(buf);
          } catch {
            const dec = new TextDecoder();
            geom = parsePointCloudText(dec.decode(buf)).geometry;
          }
        }

        if (!isCancelled && geom) {
          setLoadedGeometries(prev => ({ ...prev, [url]: geom }));
        }
      } catch (err: any) {
        console.error('Failed to load custom 3D file:', err);
        if (!isCancelled) {
          setCustomFileError('Не удалось загрузить файл геометрии');
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingCustomFile(false);
        }
      }
    };

    loadGeometry();

    return () => {
      isCancelled = true;
    };
  }, [activeCustomFile, loadedGeometries]);

  // Three.js instances ref
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const clipPlaneRef = useRef<THREE.Plane>(new THREE.Plane(new THREE.Vector3(0, -1, 0), 0));
  const planeHelperRef = useRef<THREE.PlaneHelper | null>(null);
  const markerGroupRef = useRef<THREE.Group | null>(null);
  const polarGridRef = useRef<THREE.Group | null>(null);
  const centralAxesRef = useRef<THREE.Group | null>(null);

  // Interaction controls state
  const isDraggingRef = useRef<boolean>(false);
  const isPanningRef = useRef<boolean>(false);
  const previousMousePositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const sphericalRef = useRef<{ radius: number; theta: number; phi: number }>({
    radius: 7.2,
    theta: Math.PI / 3.5,
    phi: Math.PI / 3
  });
  const targetLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));

  // Build high-detail complex geometries
  const buildComplexIndustrialGeometry = useCallback((geometryType: GeometryPresetType) => {
    const group = new THREE.Group();

    if (geometryType === 'procedural_impeller') {
      // --- 1. HIGH PRECISION 5-AXIS BLISK / IMPELLER ---
      // Aerodynamic Hub with contoured spline profile
      const hubPoints: THREE.Vector2[] = [
        new THREE.Vector2(0.35, -1.2), // central bore bottom
        new THREE.Vector2(1.8, -1.2),  // base flange
        new THREE.Vector2(1.75, -0.9),
        new THREE.Vector2(1.5, -0.6),
        new THREE.Vector2(1.2, -0.1),
        new THREE.Vector2(0.9, 0.5),
        new THREE.Vector2(0.65, 1.1),
        new THREE.Vector2(0.4, 1.3),  // nose tip
        new THREE.Vector2(0.0, 1.35)  // nose apex
      ];
      const hubGeo = new THREE.LatheGeometry(hubPoints, 64);
      const hubMesh = new THREE.Mesh(hubGeo);
      group.add(hubMesh);

      // Central spline shaft bore (cutout cylinder representation)
      const shaftGeo = new THREE.CylinderGeometry(0.35, 0.35, 2.5, 32);
      const shaftMesh = new THREE.Mesh(shaftGeo);
      shaftMesh.position.y = 0;
      group.add(shaftMesh);

      // Keyway slot detail
      const keywayGeo = new THREE.BoxGeometry(0.18, 2.4, 0.2);
      keywayGeo.translate(0.36, 0, 0);
      const keywayMesh = new THREE.Mesh(keywayGeo);
      group.add(keywayMesh);

      // 14 Curved Aerodynamic Blades (7 main + 7 splitter blades)
      const numBlades = 14;
      for (let i = 0; i < numBlades; i++) {
        const isSplitter = i % 2 === 1;
        const angle = (i / numBlades) * Math.PI * 2;
        
        // Aerodynamic airfoil shape with leading/trailing curve
        const bladeShape = new THREE.Shape();
        if (!isSplitter) {
          // Full-span main blade
          bladeShape.moveTo(0.2, -0.8);
          bladeShape.bezierCurveTo(1.0, -0.7, 1.8, -0.5, 2.2, -0.8); // Root to tip trailing
          bladeShape.bezierCurveTo(2.35, -0.2, 2.1, 0.6, 1.6, 1.2);   // Tip leading edge
          bladeShape.bezierCurveTo(1.1, 0.9, 0.6, 0.6, 0.2, 0.3);     // Top shroud blend
          bladeShape.bezierCurveTo(0.1, -0.2, 0.15, -0.5, 0.2, -0.8);
        } else {
          // Intermediate splitter blade (shorter inlet)
          bladeShape.moveTo(0.3, -0.75);
          bladeShape.bezierCurveTo(1.1, -0.65, 1.7, -0.5, 2.1, -0.78);
          bladeShape.bezierCurveTo(2.2, -0.3, 1.9, 0.3, 1.4, 0.7);
          bladeShape.bezierCurveTo(0.9, 0.5, 0.5, 0.3, 0.3, -0.1);
          bladeShape.bezierCurveTo(0.2, -0.4, 0.25, -0.6, 0.3, -0.75);
        }

        const extrudeSettings: THREE.ExtrudeGeometryOptions = {
          steps: 8,
          depth: isSplitter ? 0.06 : 0.09,
          bevelEnabled: true,
          bevelThickness: 0.03,
          bevelSize: 0.02,
          bevelSegments: 4
        };

        const bladeGeo = new THREE.ExtrudeGeometry(bladeShape, extrudeSettings);
        bladeGeo.center();
        
        // Apply spatial aerodynamic lean and 3D twist
        bladeGeo.rotateZ(isSplitter ? -0.42 : -0.36);
        bladeGeo.rotateX(0.18);
        bladeGeo.rotateY(angle);
        
        const rOffset = isSplitter ? 0.95 : 1.05;
        bladeGeo.translate(Math.cos(angle) * rOffset, 0.15, Math.sin(angle) * rOffset);

        const bladeMesh = new THREE.Mesh(bladeGeo);
        group.add(bladeMesh);
      }

      // Bottom backplate balancing ring with scallops
      const ringGeo = new THREE.TorusGeometry(1.65, 0.12, 16, 64);
      ringGeo.rotateX(Math.PI / 2);
      ringGeo.translate(0, -1.15, 0);
      const ringMesh = new THREE.Mesh(ringGeo);
      group.add(ringMesh);

    } else if (geometryType === 'procedural_mold') {
      // --- 2. HIGH PRECISION INJECTION MOLD DIE / MATRIX ---
      // Heavy Steel Die Base Plate
      const baseBlockGeo = new THREE.BoxGeometry(3.6, 1.4, 3.6, 16, 8, 16);
      baseBlockGeo.translate(0, -0.2, 0);
      const baseMesh = new THREE.Mesh(baseBlockGeo);
      group.add(baseMesh);

      // 4 Guide Bushings at corners (Втулки направляющих колонок DME)
      const cornerOffsets = [
        [-1.45, -1.45], [1.45, -1.45],
        [-1.45, 1.45], [1.45, 1.45]
      ];
      cornerOffsets.forEach(([cx, cz]) => {
        const bushingGeo = new THREE.CylinderGeometry(0.32, 0.32, 1.7, 32);
        bushingGeo.translate(cx, -0.05, cz);
        const bushingMesh = new THREE.Mesh(bushingGeo);
        group.add(bushingMesh);

        // Chamfered Entry Ring
        const ringGeo = new THREE.TorusGeometry(0.32, 0.05, 12, 32);
        ringGeo.rotateX(Math.PI / 2);
        ringGeo.translate(cx, 0.52, cz);
        const ringMesh = new THREE.Mesh(ringGeo);
        group.add(ringMesh);
      });

      // Central Molded Part Cavity with Stepped Pockets
      const cavityCenterGeo = new THREE.CylinderGeometry(1.1, 0.95, 0.8, 48);
      cavityCenterGeo.translate(0, 0.45, 0);
      const cavityCenterMesh = new THREE.Mesh(cavityCenterGeo);
      group.add(cavityCenterMesh);

      // Core Stiffener Pins & Ribs in the Cavity
      const ribGeo1 = new THREE.BoxGeometry(1.6, 0.6, 0.15);
      ribGeo1.translate(0, 0.5, 0);
      const ribMesh1 = new THREE.Mesh(ribGeo1);
      group.add(ribMesh1);

      const ribGeo2 = new THREE.BoxGeometry(0.15, 0.6, 1.6);
      ribGeo2.translate(0, 0.5, 0);
      const ribMesh2 = new THREE.Mesh(ribGeo2);
      group.add(ribMesh2);

      // 4 Side Cooling Channels (Каналы охлаждения с резьбовыми заглушками)
      const coolingGeo1 = new THREE.CylinderGeometry(0.12, 0.12, 3.8, 16);
      coolingGeo1.rotateZ(Math.PI / 2);
      coolingGeo1.translate(0, -0.4, 0.8);
      const coolingMesh1 = new THREE.Mesh(coolingGeo1);
      group.add(coolingMesh1);

      const coolingGeo2 = new THREE.CylinderGeometry(0.12, 0.12, 3.8, 16);
      coolingGeo2.rotateX(Math.PI / 2);
      coolingGeo2.translate(-0.8, -0.4, 0);
      const coolingMesh2 = new THREE.Mesh(coolingGeo2);
      group.add(coolingMesh2);

      // Side Clamping Slots (Пазы под прихваты)
      const slotGeoLeft = new THREE.BoxGeometry(0.3, 0.4, 2.2);
      slotGeoLeft.translate(-1.75, -0.3, 0);
      const slotMeshLeft = new THREE.Mesh(slotGeoLeft);
      group.add(slotMeshLeft);

      const slotGeoRight = new THREE.BoxGeometry(0.3, 0.4, 2.2);
      slotGeoRight.translate(1.75, -0.3, 0);
      const slotMeshRight = new THREE.Mesh(slotGeoRight);
      group.add(slotMeshRight);

    } else if (geometryType === 'procedural_housing') {
      // --- 3. HIGH PRECISION GEARBOX HOUSING (КОРПУС РЕДУКТОРА) ---
      // Main Cast Housing Body
      const bodyGeo = new THREE.CylinderGeometry(1.6, 1.8, 2.2, 48, 12);
      const bodyMesh = new THREE.Mesh(bodyGeo);
      group.add(bodyMesh);

      // Front Circular Bolt Flange with 8 Counterbore Holes
      const flangeGeo = new THREE.CylinderGeometry(2.3, 2.3, 0.28, 48);
      flangeGeo.translate(0, -0.95, 0);
      const flangeMesh = new THREE.Mesh(flangeGeo);
      group.add(flangeMesh);

      // 8 Bolt Bosses around Flange
      for (let i = 0; i < 8; i++) {
        const ang = (i / 8) * Math.PI * 2;
        const boltHoleGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.35, 16);
        boltHoleGeo.translate(Math.cos(ang) * 1.95, -0.95, Math.sin(ang) * 1.95);
        const boltHoleMesh = new THREE.Mesh(boltHoleGeo);
        group.add(boltHoleMesh);
      }

      // Dual Horizontal Bearing Bores (Ступенчатые расточки под подшипники)
      const bore1Geo = new THREE.CylinderGeometry(0.9, 0.9, 2.4, 36);
      bore1Geo.rotateX(Math.PI / 2);
      bore1Geo.translate(0, 0.2, 0);
      const bore1Mesh = new THREE.Mesh(bore1Geo);
      group.add(bore1Mesh);

      const bore2Geo = new THREE.CylinderGeometry(0.65, 0.65, 2.6, 36);
      bore2Geo.rotateZ(Math.PI / 2);
      bore2Geo.translate(0, 0.2, 0);
      const bore2Mesh = new THREE.Mesh(bore2Geo);
      group.add(bore2Mesh);

      // External Stiffening Gusset Ribs (Ребра жесткости)
      for (let i = 0; i < 4; i++) {
        const ribAng = (i / 4) * Math.PI * 2 + Math.PI / 4;
        const ribGeo = new THREE.BoxGeometry(0.16, 1.6, 1.2);
        ribGeo.rotateY(ribAng);
        ribGeo.translate(Math.cos(ribAng) * 1.1, -0.1, Math.sin(ribAng) * 1.1);
        const ribMesh = new THREE.Mesh(ribGeo);
        group.add(ribMesh);
      }

      // Top Inspection Cover Flange
      const topCoverFlangeGeo = new THREE.BoxGeometry(1.8, 0.2, 1.8);
      topCoverFlangeGeo.translate(0, 1.15, 0);
      const topCoverFlangeMesh = new THREE.Mesh(topCoverFlangeGeo);
      group.add(topCoverFlangeMesh);

      // Oil Drain Boss on lower side
      const drainBossGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.4, 16);
      drainBossGeo.rotateZ(Math.PI / 2);
      drainBossGeo.translate(1.7, -0.7, 0);
      const drainBossMesh = new THREE.Mesh(drainBossGeo);
      group.add(drainBossMesh);

    } else if (geometryType === 'procedural_bevel_gear') {
      // --- 4. HIGH PRECISION SPIRAL BEVEL GEAR & SHAFT (ВАЛ-ШЕСТЕРНЯ) ---
      // Stepped Pinion Shaft
      const shaftPoints: THREE.Vector2[] = [
        new THREE.Vector2(0.2, -1.8), // center bore
        new THREE.Vector2(0.4, -1.8), // spline section
        new THREE.Vector2(0.4, -0.9),
        new THREE.Vector2(0.55, -0.85), // bearing seat Ø25
        new THREE.Vector2(0.55, -0.1),
        new THREE.Vector2(0.7, -0.05),  // gear seat Ø35
        new THREE.Vector2(0.85, 0.4),
        new THREE.Vector2(1.7, 0.9),   // conical gear crown outer
        new THREE.Vector2(1.5, 1.3),   // top bevel face
        new THREE.Vector2(0.3, 1.3),   // inner face
        new THREE.Vector2(0.0, 1.1)    // lathe center
      ];
      const shaftLatheGeo = new THREE.LatheGeometry(shaftPoints, 64);
      const shaftMesh = new THREE.Mesh(shaftLatheGeo);
      group.add(shaftMesh);

      // 18 Curved Spiral Hypoid Teeth
      const numTeeth = 18;
      for (let i = 0; i < numTeeth; i++) {
        const ang = (i / numTeeth) * Math.PI * 2;
        const toothShape = new THREE.Shape();
        toothShape.moveTo(-0.12, 0);
        toothShape.lineTo(0.12, 0);
        toothShape.lineTo(0.08, 0.65);
        toothShape.lineTo(-0.08, 0.65);
        toothShape.closePath();

        const toothExtrude: THREE.ExtrudeGeometryOptions = {
          steps: 6,
          depth: 0.9,
          bevelEnabled: true,
          bevelThickness: 0.04,
          bevelSize: 0.03
        };
        const toothGeo = new THREE.ExtrudeGeometry(toothShape, toothExtrude);
        toothGeo.center();
        toothGeo.rotateX(-0.55); // bevel angle
        toothGeo.rotateZ(0.35);  // spiral twist
        toothGeo.rotateY(ang);
        toothGeo.translate(Math.cos(ang) * 1.25, 0.95, Math.sin(ang) * 1.25);
        const toothMesh = new THREE.Mesh(toothGeo);
        group.add(toothMesh);
      }

      // Spline Grooves on the bottom shaft
      for (let i = 0; i < 12; i++) {
        const ang = (i / 12) * Math.PI * 2;
        const splineGeo = new THREE.BoxGeometry(0.06, 0.85, 0.08);
        splineGeo.translate(Math.cos(ang) * 0.41, -1.35, Math.sin(ang) * 0.41);
        const splineMesh = new THREE.Mesh(splineGeo);
        group.add(splineMesh);
      }

    } else if (geometryType === 'procedural_volute') {
      // --- 5. CENTRIFUGAL VOLUTE CASING / TURBINE HOUSING (УЛИТКА) ---
      // Spiral Expanding Torus Segments
      const spiralSegments = 32;
      for (let i = 0; i < spiralSegments; i++) {
        const t = i / spiralSegments;
        const angle = t * Math.PI * 2;
        const radius = 0.8 + t * 0.85; // expanding spiral radius
        const tubeRadius = 0.35 + t * 0.3; // expanding tube cross-section

        const segGeo = new THREE.CylinderGeometry(tubeRadius, tubeRadius * 1.05, 0.3, 24);
        segGeo.rotateX(Math.PI / 2);
        segGeo.rotateZ(angle);
        segGeo.translate(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
        const segMesh = new THREE.Mesh(segGeo);
        group.add(segMesh);
      }

      // Center Suction Flange (Всасывающий патрубок Ду80)
      const suctionGeo = new THREE.CylinderGeometry(0.7, 0.7, 1.4, 36);
      suctionGeo.rotateX(Math.PI / 2);
      suctionGeo.translate(0, 0, 0.7);
      const suctionMesh = new THREE.Mesh(suctionGeo);
      group.add(suctionMesh);

      const suctionFlangeGeo = new THREE.CylinderGeometry(1.1, 1.1, 0.2, 36);
      suctionFlangeGeo.rotateX(Math.PI / 2);
      suctionFlangeGeo.translate(0, 0, 1.35);
      const suctionFlangeMesh = new THREE.Mesh(suctionFlangeGeo);
      group.add(suctionFlangeMesh);

      // Tangential Discharge Neck & Flange (Напорный фланец Ду50)
      const dischargeGeo = new THREE.CylinderGeometry(0.55, 0.55, 1.5, 32);
      dischargeGeo.translate(1.65, 0.7, 0);
      const dischargeMesh = new THREE.Mesh(dischargeGeo);
      group.add(dischargeMesh);

      const dischargeFlangeGeo = new THREE.CylinderGeometry(0.95, 0.95, 0.2, 32);
      dischargeFlangeGeo.translate(1.65, 1.45, 0);
      const dischargeFlangeMesh = new THREE.Mesh(dischargeFlangeGeo);
      group.add(dischargeFlangeMesh);

      // Mounting Foot Bracket
      const footGeo = new THREE.BoxGeometry(2.4, 0.25, 1.6);
      footGeo.translate(0, -1.1, 0);
      const footMesh = new THREE.Mesh(footGeo);
      group.add(footMesh);

    } else {
      // Fallback High-Quality Solid Gear
      const defaultGeo = new THREE.CylinderGeometry(1.5, 1.5, 1.8, 64, 16);
      const defaultMesh = new THREE.Mesh(defaultGeo);
      group.add(defaultMesh);
    }

    return group;
  }, []);

  // Compute realistic GD&T Colormap vertex deviation colors
  const applyMetrologyColorMap = (geometry: THREE.BufferGeometry, minTol: number, maxTol: number) => {
    const pos = geometry.attributes.position;
    if (!pos) return;

    const count = pos.count;
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);

      // Realistic pseudo-harmonic deviation field simulating machining tolerances
      const pseudoDev = Math.sin(x * 2.8) * Math.cos(z * 2.5) * 0.035 + (Math.sin(y * 4.0) * 0.015);
      
      // Normalize deviation to [0, 1] relative to [minTol, maxTol]
      const range = maxTol - minTol || 0.1;
      const normalized = THREE.MathUtils.clamp((pseudoDev - minTol) / range, 0, 1);

      // Metrological Rainbow Gradient: Blue (under) -> Cyan -> Green (nominal) -> Yellow -> Red (over)
      const color = new THREE.Color();
      if (normalized < 0.25) {
        // Deep Blue to Cyan (-0.05 ... -0.025)
        color.setRGB(0.0, normalized * 4, 1.0);
      } else if (normalized < 0.5) {
        // Cyan to Pure Green (-0.025 ... 0.0)
        const t = (normalized - 0.25) * 4;
        color.setRGB(0.0, 1.0, 1.0 - t);
      } else if (normalized < 0.75) {
        // Green to Yellow (0.0 ... +0.025)
        const t = (normalized - 0.5) * 4;
        color.setRGB(t, 1.0, 0.0);
      } else {
        // Yellow to Bright Red (+0.025 ... +0.05)
        const t = (normalized - 0.75) * 4;
        color.setRGB(1.0, 1.0 - t, 0.0);
      }

      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  };

  // Rebuild 3D Scene based on active model and mode
  const rebuild3DScene = useCallback(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    // Clean previous models
    if (modelGroupRef.current) {
      scene.remove(modelGroupRef.current);
    }
    if (markerGroupRef.current) {
      scene.remove(markerGroupRef.current);
    }

    const newModelGroup = new THREE.Group();
    const newMarkerGroup = new THREE.Group();

    // 1. Construct geometry: either from user-uploaded custom 3D file or procedural preset
    const clippingPlanes = isClipping && clipPlaneRef.current ? [clipPlaneRef.current] : [];
    const customGeom = activeCustomFile ? loadedGeometries[activeCustomFile.url] : null;

    const getPointColor = (shd: ShadingStyle): number => {
      switch (shd) {
        case 'glossy_chrome': return 0xf8fafc;
        case 'matte_titanium': return 0x94a3b8;
        case 'cad_blue': return 0x2563eb;
        case 'gold_brass': return 0xfbbf24;
        case 'flat_shading': return 0x0284c7;
        case 'normals': return 0x10b981;
        default: return 0x38bdf8;
      }
    };

    const buildMeshMaterial = (mode: ViewerMode, shd: ShadingStyle): THREE.Material => {
      const isWire = mode === 'mesh';
      
      if (shd === 'normals') {
        return new THREE.MeshNormalMaterial({
          wireframe: isWire,
          clippingPlanes,
          clipShadows: true,
          side: THREE.DoubleSide
        });
      }

      if (shd === 'glossy_chrome') {
        return new THREE.MeshPhysicalMaterial({
          color: new THREE.Color(0xf1f5f9),
          metalness: 0.95,
          roughness: 0.08,
          clearcoat: 0.95,
          clearcoatRoughness: 0.05,
          reflectivity: 0.98,
          wireframe: isWire,
          clippingPlanes,
          clipShadows: true,
          side: THREE.DoubleSide
        });
      }

      if (shd === 'matte_titanium') {
        return new THREE.MeshStandardMaterial({
          color: new THREE.Color(0x94a3b8),
          metalness: 0.45,
          roughness: 0.65,
          wireframe: isWire,
          clippingPlanes,
          clipShadows: true,
          side: THREE.DoubleSide
        });
      }

      if (shd === 'cad_blue') {
        return new THREE.MeshPhysicalMaterial({
          color: new THREE.Color(0x2563eb),
          metalness: 0.78,
          roughness: 0.2,
          clearcoat: 0.5,
          clearcoatRoughness: 0.15,
          reflectivity: 0.85,
          wireframe: isWire,
          clippingPlanes,
          clipShadows: true,
          side: THREE.DoubleSide
        });
      }

      if (shd === 'gold_brass') {
        return new THREE.MeshPhysicalMaterial({
          color: new THREE.Color(0xd97706),
          metalness: 0.88,
          roughness: 0.18,
          clearcoat: 0.4,
          clearcoatRoughness: 0.1,
          reflectivity: 0.9,
          wireframe: isWire,
          clippingPlanes,
          clipShadows: true,
          side: THREE.DoubleSide
        });
      }

      if (shd === 'flat_shading') {
        if (mode === 'colormap') {
          return new THREE.MeshStandardMaterial({
            vertexColors: true,
            flatShading: true,
            roughness: 0.4,
            metalness: 0.2,
            clippingPlanes,
            clipShadows: true,
            side: THREE.DoubleSide
          });
        }
        return new THREE.MeshStandardMaterial({
          color: new THREE.Color(0x0284c7),
          flatShading: true,
          roughness: 0.45,
          metalness: 0.2,
          wireframe: isWire,
          clippingPlanes,
          clipShadows: true,
          side: THREE.DoubleSide
        });
      }

      if (shd === 'wire_overlay') {
        if (mode === 'colormap') {
          return new THREE.MeshStandardMaterial({
            vertexColors: true,
            roughness: 0.35,
            metalness: 0.25,
            clippingPlanes,
            clipShadows: true,
            side: THREE.DoubleSide
          });
        }
        return new THREE.MeshStandardMaterial({
          color: new THREE.Color(0x38bdf8),
          roughness: 0.3,
          metalness: 0.3,
          clippingPlanes,
          clipShadows: true,
          side: THREE.DoubleSide
        });
      }

      // Default Shading per mode
      if (mode === 'colormap') {
        return new THREE.MeshStandardMaterial({
          vertexColors: true,
          roughness: 0.35,
          metalness: 0.25,
          clippingPlanes,
          clipShadows: true,
          side: THREE.DoubleSide
        });
      } else if (mode === 'cad') {
        return new THREE.MeshPhysicalMaterial({
          color: new THREE.Color(0x3b82f6),
          metalness: 0.75,
          roughness: 0.22,
          clearcoat: 0.4,
          clearcoatRoughness: 0.1,
          reflectivity: 0.8,
          clippingPlanes,
          clipShadows: true,
          side: THREE.DoubleSide
        });
      } else if (mode === 'mesh') {
        return new THREE.MeshStandardMaterial({
          color: new THREE.Color(0x60a5fa),
          wireframe: true,
          roughness: 0.5,
          metalness: 0.3,
          clippingPlanes,
          clipShadows: true,
          side: THREE.DoubleSide
        });
      }

      return new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x60a5fa),
        clippingPlanes,
        side: THREE.DoubleSide
      });
    };

    if (customGeom) {
      const geom = customGeom.clone();
      if (activeMode === 'colormap') {
        applyMetrologyColorMap(geom, currentModel.minTolerance, currentModel.maxTolerance);
      }

      if (activeMode === 'points') {
        const ptsMat = new THREE.PointsMaterial({
          color: new THREE.Color(getPointColor(activeShading)),
          size: 0.035,
          sizeAttenuation: true,
          vertexColors: geom.getAttribute('color') !== undefined
        });
        const pts = new THREE.Points(geom, ptsMat);
        newModelGroup.add(pts);
      } else {
        const mat = buildMeshMaterial(activeMode, activeShading);
        const mesh = new THREE.Mesh(geom, mat);
        newModelGroup.add(mesh);

        // Optional wireframe overlay
        if (activeShading === 'wire_overlay' && activeMode !== 'mesh') {
          const wireMat = new THREE.MeshBasicMaterial({
            color: 0x38bdf8,
            wireframe: true,
            transparent: true,
            opacity: 0.35,
            clippingPlanes
          });
          const wireMesh = new THREE.Mesh(geom, wireMat);
          newModelGroup.add(wireMesh);
        }
      }
    } else {
      // 2. Setup procedural geometry
      const baseGroup = buildComplexIndustrialGeometry(currentModel.geometryType);

      baseGroup.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          let geom = child.geometry.clone();
          child.geometry = geom;

          if (activeMode === 'colormap') {
            applyMetrologyColorMap(geom, currentModel.minTolerance, currentModel.maxTolerance);
          }

          if (activeMode === 'points') {
            const ptsMat = new THREE.PointsMaterial({
              color: new THREE.Color(getPointColor(activeShading)),
              size: 0.035,
              sizeAttenuation: true
            });
            const pts = new THREE.Points(geom, ptsMat);
            newModelGroup.add(pts);
            child.visible = false;
          } else {
            child.material = buildMeshMaterial(activeMode, activeShading);
            
            if (activeShading === 'wire_overlay' && activeMode !== 'mesh') {
              const wireMat = new THREE.MeshBasicMaterial({
                color: 0x38bdf8,
                wireframe: true,
                transparent: true,
                opacity: 0.35,
                clippingPlanes
              });
              const wireMesh = new THREE.Mesh(geom, wireMat);
              newModelGroup.add(wireMesh);
            }
          }
        }
      });

      newModelGroup.add(baseGroup);
    }

    scene.add(newModelGroup);
    modelGroupRef.current = newModelGroup;

    // 3. Add interactive 3D inspection markers
    const pointsList = currentModel.inspectionPoints || [];
    pointsList.forEach((pt) => {
      const markerRoot = new THREE.Group();
      markerRoot.position.set(...pt.coords);

      // Marker sphere pin
      const pinColor = pt.status === 'nominal' ? 0x10b981 : (pt.status === 'warning' ? 0xf59e0b : 0xef4444);
      const sphereGeo = new THREE.SphereGeometry(0.12, 16, 16);
      const sphereMat = new THREE.MeshBasicMaterial({ color: pinColor });
      const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
      sphereMesh.userData = { inspectionPoint: pt };

      // Pulsing halo ring
      const ringGeo = new THREE.RingGeometry(0.15, 0.22, 24);
      const ringMat = new THREE.MeshBasicMaterial({ 
        color: pinColor, 
        side: THREE.DoubleSide, 
        transparent: true, 
        opacity: 0.6 
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.lookAt(new THREE.Vector3(0, 1, 0));

      markerRoot.add(sphereMesh);
      markerRoot.add(ringMesh);
      newMarkerGroup.add(markerRoot);
    });

    scene.add(newMarkerGroup);
    markerGroupRef.current = newMarkerGroup;

    // 4. Central Trihedron Coordinate Axes placed directly on the part (at 0, 0, 0)
    const centralAxesGroup = new THREE.Group();
    centralAxesGroup.name = 'centralAxesGroup';

    const axisLength = 1.35;
    const shaftRadius = 0.022;
    const headLength = 0.28;
    const headRadius = 0.065;

    // Chrome center origin sphere
    const originSphereGeo = new THREE.SphereGeometry(0.065, 20, 20);
    const originSphereMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.9,
      roughness: 0.1,
      clippingPlanes: [] // Never clip coordinate origin
    });
    const originSphere = new THREE.Mesh(originSphereGeo, originSphereMat);
    centralAxesGroup.add(originSphere);

    const buildAxisArrow = (direction: THREE.Vector3, colorHex: number) => {
      const arrowGroup = new THREE.Group();
      const shaftGeo = new THREE.CylinderGeometry(shaftRadius, shaftRadius, axisLength - headLength, 16);
      shaftGeo.translate(0, (axisLength - headLength) / 2, 0);
      const mat = new THREE.MeshStandardMaterial({
        color: colorHex,
        emissive: colorHex,
        emissiveIntensity: 0.35,
        metalness: 0.4,
        roughness: 0.2,
        clippingPlanes: [] // Keep visible even when part is sectioned
      });
      const shaft = new THREE.Mesh(shaftGeo, mat);

      const coneGeo = new THREE.ConeGeometry(headRadius, headLength, 20);
      coneGeo.translate(0, axisLength - headLength / 2, 0);
      const cone = new THREE.Mesh(coneGeo, mat);

      arrowGroup.add(shaft);
      arrowGroup.add(cone);

      const defaultDir = new THREE.Vector3(0, 1, 0);
      const quat = new THREE.Quaternion().setFromUnitVectors(defaultDir, direction.clone().normalize());
      arrowGroup.setRotationFromQuaternion(quat);

      return arrowGroup;
    };

    // X - Red
    centralAxesGroup.add(buildAxisArrow(new THREE.Vector3(1, 0, 0), 0xef4444));
    // Y - Green
    centralAxesGroup.add(buildAxisArrow(new THREE.Vector3(0, 1, 0), 0x10b981));
    // Z - Cyan
    centralAxesGroup.add(buildAxisArrow(new THREE.Vector3(0, 0, 1), 0x06b6d4));

    // Situated directly in the center of the part
    newModelGroup.add(centralAxesGroup);
    centralAxesRef.current = centralAxesGroup;

  }, [currentModel, activeMode, activeShading, isClipping, activeCustomFile, loadedGeometries, buildComplexIndustrialGeometry]);

  // Metrology 3D screen projection calculator for inspection callouts and coordinate labels
  const updateProjections = useCallback(() => {
    if (!cameraRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (w <= 0 || h <= 0) return;

    const pts = currentModel.inspectionPoints || [];
    const projCallouts: Array<{
      id: string;
      name: string;
      shortLabel: string;
      surfaceName: string;
      deviation: number;
      status: 'nominal' | 'warning' | 'critical';
      screenX: number;
      screenY: number;
      badgeX: number;
      badgeY: number;
      ctrlX: number;
      ctrlY: number;
      isVisible: boolean;
      dotColor: string;
      lineColor: string;
    }> = [];

    pts.slice(0, 4).forEach((pt, idx) => {
      const v = new THREE.Vector3(...pt.coords);
      if (modelGroupRef.current) {
        v.applyMatrix4(modelGroupRef.current.matrixWorld);
      }
      v.project(cameraRef.current!);

      const isVisible = v.z < 1.0;
      const screenX = ((v.x + 1) / 2) * w;
      const screenY = ((-v.y + 1) / 2) * h;

      // Radially offset callout badge for clear leader line display
      const isRight = screenX >= w / 2;
      const isTop = screenY <= h / 2;

      const offsetX = isRight ? (90 + (idx % 2) * 35) : -(90 + (idx % 2) * 35);
      const offsetY = isTop ? -(42 + (idx % 2) * 22) : (42 + (idx % 2) * 22);

      const badgeX = THREE.MathUtils.clamp(screenX + offsetX, 210, Math.max(220, w - 190));
      const badgeY = THREE.MathUtils.clamp(screenY + offsetY, 55, Math.max(65, h - 55));

      const ctrlX = screenX + (badgeX - screenX) * 0.2;
      const ctrlY = screenY + (badgeY - screenY) * 0.8;

      const dotColor = pt.deviation > 0.035 ? '#ef4444' : (pt.deviation < -0.035 ? '#06b6d4' : '#10b981');
      const lineColor = '#38bdf8';

      projCallouts.push({
        id: pt.id,
        name: pt.name,
        shortLabel: `P${idx + 1}`,
        surfaceName: pt.surfaceName,
        deviation: pt.deviation,
        status: pt.status,
        screenX,
        screenY,
        badgeX,
        badgeY,
        ctrlX,
        ctrlY,
        isVisible,
        dotColor,
        lineColor
      });
    });

    // 3D Axis Labels projection (at tips of arrows on the part)
    const tipDist = 1.45;
    const xTip = new THREE.Vector3(tipDist, 0, 0);
    const yTip = new THREE.Vector3(0, tipDist, 0);
    const zTip = new THREE.Vector3(0, 0, tipDist);

    if (modelGroupRef.current) {
      xTip.applyMatrix4(modelGroupRef.current.matrixWorld);
      yTip.applyMatrix4(modelGroupRef.current.matrixWorld);
      zTip.applyMatrix4(modelGroupRef.current.matrixWorld);
    }

    xTip.project(cameraRef.current!);
    yTip.project(cameraRef.current!);
    zTip.project(cameraRef.current!);

    setAxesLabels({
      x: { x: ((xTip.x + 1) / 2) * w, y: ((-xTip.y + 1) / 2) * h, visible: xTip.z < 1 },
      y: { x: ((yTip.x + 1) / 2) * w, y: ((-yTip.y + 1) / 2) * h, visible: yTip.z < 1 },
      z: { x: ((zTip.x + 1) / 2) * w, y: ((-zTip.y + 1) / 2) * h, visible: zTip.z < 1 },
    });

    setProjectedCallouts(projCallouts);
  }, [currentModel]);

  const updateProjectionsRef = useRef(updateProjections);
  useEffect(() => {
    updateProjectionsRef.current = updateProjections;
  }, [updateProjections]);

  // Keep auto-rotate ref synchronized to eliminate stale closure in animation loop
  const isAutoRotatingRef = useRef<boolean>(isAutoRotating);
  useEffect(() => {
    isAutoRotatingRef.current = isAutoRotating;
  }, [isAutoRotating]);

  // Dynamically update clipping plane and material clipping state without recreating scene
  const updateClippingPlanes = useCallback(() => {
    if (!clipPlaneRef.current) return;

    if (clipAxis === 'y') {
      clipPlaneRef.current.normal.set(0, -1, 0);
    } else if (clipAxis === 'x') {
      clipPlaneRef.current.normal.set(-1, 0, 0);
    } else {
      clipPlaneRef.current.normal.set(0, 0, -1);
    }
    clipPlaneRef.current.constant = clipOffset;

    // Apply globally to WebGLRenderer
    if (rendererRef.current) {
      rendererRef.current.clippingPlanes = isClipping ? [clipPlaneRef.current] : [];
    }

    // Apply locally to all child materials
    if (modelGroupRef.current) {
      modelGroupRef.current.traverse((child) => {
        if ('material' in child && child.material) {
          const mats = Array.isArray(child.material) ? child.material : [child.material];
          mats.forEach((mat) => {
            mat.clippingPlanes = isClipping ? [clipPlaneRef.current] : [];
            mat.clipShadows = true;
            mat.needsUpdate = true;
          });
        }
      });
    }

    // Update PlaneHelper
    if (sceneRef.current) {
      if (isClipping) {
        if (!planeHelperRef.current) {
          const helper = new THREE.PlaneHelper(clipPlaneRef.current, 5, 0xf59e0b);
          sceneRef.current.add(helper);
          planeHelperRef.current = helper;
        } else {
          planeHelperRef.current.plane = clipPlaneRef.current;
          planeHelperRef.current.visible = true;
        }
      } else if (planeHelperRef.current) {
        planeHelperRef.current.visible = false;
      }
    }
  }, [isClipping, clipAxis, clipOffset]);

  useEffect(() => {
    updateClippingPlanes();
  }, [updateClippingPlanes]);

  // Initialize Three.js WebGL Engine (once on mount)
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 450;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f1d);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    cameraRef.current = camera;

    // 3. Renderer with antialiasing and local clipping
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.localClippingEnabled = true;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;

    // 4. Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
    keyLight.position.set(6, 10, 8);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x93c5fd, 1.2);
    fillLight.position.set(-8, 4, -6);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.4);
    rimLight.position.set(0, -6, -8);
    scene.add(rimLight);

    // 5. Grid Helper Plane & Polar Target Inspection Grid
    const polarGridGroup = new THREE.Group();
    polarGridGroup.name = 'polarTargetGrid';

    const polarRadii = [0.8, 1.6, 2.4, 3.2, 4.0];
    polarRadii.forEach((r, idx) => {
      const circleGeo = new THREE.BufferGeometry();
      const segments = 64;
      const positions = new Float32Array((segments + 1) * 3);
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        positions[i * 3] = r * Math.cos(theta);
        positions[i * 3 + 1] = 0;
        positions[i * 3 + 2] = r * Math.sin(theta);
      }
      circleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const lineMat = new THREE.LineBasicMaterial({
        color: idx % 2 === 1 ? 0x1e3a8a : 0x0f2744,
        transparent: true,
        opacity: 0.5
      });
      const circle = new THREE.Line(circleGeo, lineMat);
      polarGridGroup.add(circle);
    });

    // Radial crosshairs along X and Z
    const crossGeo = new THREE.BufferGeometry();
    const crossPoints = new Float32Array([
      -4.5, 0, 0,  4.5, 0, 0,
      0, 0, -4.5,  0, 0, 4.5
    ]);
    crossGeo.setAttribute('position', new THREE.BufferAttribute(crossPoints, 3));
    const crossMat = new THREE.LineBasicMaterial({
      color: 0x1e3a8a,
      transparent: true,
      opacity: 0.4
    });
    const cross = new THREE.LineSegments(crossGeo, crossMat);
    polarGridGroup.add(cross);

    polarGridGroup.position.y = -1.6;
    scene.add(polarGridGroup);
    polarGridRef.current = polarGridGroup;

    const gridHelper = new THREE.GridHelper(10, 20, 0x1e293b, 0x091224);
    gridHelper.position.y = -1.6;
    scene.add(gridHelper);

    // 6. Initial Model Load
    rebuild3DScene();

    // 7. Animation & Render Loop
    let frameCount = 0;
    let lastFpsUpdate = performance.now();

    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      // FPS Counter
      frameCount++;
      const now = performance.now();
      if (now - lastFpsUpdate >= 1000) {
        setRenderFps(Math.round((frameCount * 1000) / (now - lastFpsUpdate)));
        frameCount = 0;
        lastFpsUpdate = now;
      }

      // Auto rotation
      if (isAutoRotatingRef.current && !isDraggingRef.current) {
        sphericalRef.current.theta += 0.001;
      }

      // Camera position update from spherical coords
      const { radius, theta, phi } = sphericalRef.current;
      const x = radius * Math.sin(phi) * Math.sin(theta);
      const y = radius * Math.cos(phi);
      const z = radius * Math.sin(phi) * Math.cos(theta);

      camera.position.set(x, y, z).add(targetLookAtRef.current);
      camera.lookAt(targetLookAtRef.current);

      renderer.render(scene, camera);

      // Metrology callouts and axes projections
      if (frameCount % 2 === 0 || isDraggingRef.current || isPanningRef.current) {
        updateProjectionsRef.current();
      }
    };

    animate();

    // 8. Resize Observer for fluid container dimensions
    const resizeObserver = new ResizeObserver((entries) => {
      window.requestAnimationFrame(() => {
        for (const entry of entries) {
          const { width: newW, height: newH } = entry.contentRect;
          if (newW > 0 && newH > 0) {
            camera.aspect = newW / newH;
            camera.updateProjectionMatrix();
            renderer.setSize(newW, newH);
          }
        }
      });
    });

    resizeObserver.observe(container);

    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      document.removeEventListener('fullscreenchange', handleFsChange);
      resizeObserver.disconnect();
      renderer.dispose();
    };
  }, []); // Run once on mount

  // Rebuild scene when model or mode changes
  useEffect(() => {
    rebuild3DScene();
  }, [rebuild3DScene]);

  // Mouse & Touch Controls (Orbit, Pan, Zoom, Click to Inspect)
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 2 || e.shiftKey) {
      isPanningRef.current = true;
    } else {
      isDraggingRef.current = true;
    }
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const deltaX = e.clientX - previousMousePositionRef.current.x;
    const deltaY = e.clientY - previousMousePositionRef.current.y;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };

    if (isDraggingRef.current) {
      sphericalRef.current.theta -= deltaX * 0.008;
      sphericalRef.current.phi = THREE.MathUtils.clamp(
        sphericalRef.current.phi - deltaY * 0.008,
        0.1,
        Math.PI - 0.1
      );
    } else if (isPanningRef.current) {
      targetLookAtRef.current.y += deltaY * 0.008;
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDraggingRef.current && Math.abs(e.movementX) < 3 && Math.abs(e.movementY) < 3) {
      performRaycast(e.clientX, e.clientY);
    }
    isDraggingRef.current = false;
    isPanningRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    sphericalRef.current.radius = THREE.MathUtils.clamp(
      sphericalRef.current.radius + e.deltaY * 0.006,
      2.5,
      18.0
    );
  };

  // Touch Handlers for Mobile Devices
  const touchStartRef = useRef<{ x: number; y: number; dist: number }>({ x: 0, y: 0, dist: 0 });

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      isDraggingRef.current = true;
      touchStartRef.current.x = e.touches[0].clientX;
      touchStartRef.current.y = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
      isDraggingRef.current = false;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchStartRef.current.dist = Math.hypot(dx, dy);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1 && isDraggingRef.current) {
      const dx = e.touches[0].clientX - touchStartRef.current.x;
      const dy = e.touches[0].clientY - touchStartRef.current.y;
      touchStartRef.current.x = e.touches[0].clientX;
      touchStartRef.current.y = e.touches[0].clientY;

      sphericalRef.current.theta -= dx * 0.008;
      sphericalRef.current.phi = THREE.MathUtils.clamp(
        sphericalRef.current.phi - dy * 0.008,
        0.1,
        Math.PI - 0.1
      );
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const newDist = Math.hypot(dx, dy);
      const deltaDist = touchStartRef.current.dist - newDist;
      touchStartRef.current.dist = newDist;

      sphericalRef.current.radius = THREE.MathUtils.clamp(
        sphericalRef.current.radius + deltaDist * 0.02,
        2.5,
        18.0
      );
    }
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
  };

  // Raycasting for interactive inspection marker detection
  const performRaycast = (clientX: number, clientY: number) => {
    if (!canvasRef.current || !cameraRef.current || !markerGroupRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);

    const intersects = raycaster.intersectObjects(markerGroupRef.current.children, true);
    if (intersects.length > 0) {
      const obj = intersects[0].object;
      if (obj.userData?.inspectionPoint) {
        setSelectedPoint(obj.userData.inspectionPoint);
      }
    }
  };

  // Camera preset views
  const setCameraView = (view: 'iso' | 'top' | 'front' | 'right') => {
    setIsAutoRotating(false);
    targetLookAtRef.current.set(0, 0, 0);
    if (view === 'iso') {
      sphericalRef.current = { radius: 7.2, theta: Math.PI / 3.5, phi: Math.PI / 3 };
    } else if (view === 'top') {
      sphericalRef.current = { radius: 7.2, theta: 0, phi: 0.01 };
    } else if (view === 'front') {
      sphericalRef.current = { radius: 7.2, theta: 0, phi: Math.PI / 2 };
    } else if (view === 'right') {
      sphericalRef.current = { radius: 7.2, theta: Math.PI / 2, phi: Math.PI / 2 };
    }
  };

  const resetCamera = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCameraView('iso');
  };

  // Take High-Res Screenshot with company watermark for guests
  const captureScreenshot = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!canvasRef.current || !rendererRef.current || !sceneRef.current || !cameraRef.current) return;
    rendererRef.current.render(sceneRef.current, cameraRef.current);
    
    const mainCanvas = canvasRef.current;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = mainCanvas.width;
    tempCanvas.height = mainCanvas.height;
    const ctx = tempCanvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(mainCanvas, 0, 0);
    
    if (!canManage3D) {
      // Apply copyright watermark for regular visitors
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText('ООО «ДС-Инжиниринг» • ds-enginering.ru • Образец 3D-контроля', 20, tempCanvas.height - 20);
      ctx.restore();
    }

    const dataUrl = tempCanvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `ds-engineering-3d-model-${currentModel.id}-${activeMode}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    if (!canManage3D) {
      showToast('Снимок экрана сохранен с защитным водяным знаком компании');
    }
  };

  // Toggle Fullscreen with fallback
  const toggleFullscreen = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsFullscreen((prev) => {
      const next = !prev;
      if (next) {
        try {
          if (containerRef.current?.requestFullscreen) {
            containerRef.current.requestFullscreen().catch(() => {});
          }
        } catch {
          // CSS simulated fullscreen is always active
        }
      } else {
        try {
          if (document.fullscreenElement && document.exitFullscreen) {
            document.exitFullscreen().catch(() => {});
          }
        } catch {
          // ignore
        }
      }
      return next;
    });
  };

  return (
    <div 
      ref={containerRef}
      className={`relative w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800 text-white shadow-sm flex flex-col select-none transition-all duration-300 ${
        isFullscreen ? 'fixed inset-0 z-[9999] rounded-none h-screen w-screen' : (compactHeight ? 'h-[460px] sm:h-[500px] max-h-[520px]' : 'h-[500px] sm:h-[560px] lg:h-[580px] max-h-[600px]')
      } ${className}`}
    >
      {/* Top Header Bar: Clean Non-Overlapping Layout */}
      <div className="h-10 sm:h-11 bg-slate-900/95 border-b border-slate-800/80 px-4 sm:px-4 flex items-center justify-between gap-2 z-20 shrink-0 select-none">
        {showTitle && (
          <div className="flex items-center gap-2 shrink-0">
            
            <div className="hidden xs:block">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-extrabold text-white tracking-wide uppercase">
                  3D WebGL Метрология
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.2 rounded text-[8px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  ISO 1101
                </span>
              </div>
              <div className="text-[9px] text-slate-400 flex items-center gap-1.5">
                <span>FPS: {renderFps}</span>
                <span>•</span>
                <span>Точек: {currentModel.pointCount.toLocaleString('ru-RU')}</span>
              </div>
            </div>
          </div>
        )}

        {/* Right side: Dynamic 3D Models Selector Tabs & Fullscreen */}
        <div className="flex items-center gap-1.5 overflow-hidden max-w-full justify-end flex-1">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 no-scrollbar">
            {availableModels.map((m) => {
              const isActive = m.id === activeModelId;
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    setActiveModelId(m.id);
                    setSelectedPoint(null);
                    if (onModelSelect) onModelSelect(m.id);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                  title={m.name}
                >
                  {m.geometryType === 'procedural_impeller' && <Sparkles className="w-3 h-3 text-amber-300" />}
                  {m.geometryType === 'procedural_mold' && <Box className="w-3 h-3 text-blue-300" />}
                  {m.geometryType === 'procedural_housing' && <Cpu className="w-3 h-3 text-emerald-300" />}
                  {m.geometryType === 'procedural_bevel_gear' && <Disc className="w-3 h-3 text-purple-300" />}
                  {m.geometryType === 'procedural_volute' && <Activity className="w-3 h-3 text-cyan-300" />}
                  {m.geometryType === 'custom_url' && <Grid className="w-3 h-3 text-slate-300" />}
                <span className="truncate max-w-[90px] sm:max-w-[120px]">{m.name.split('(')[0].trim()}</span>
                </button>
              );
            })}
          </div>

          <div className="w-px h-4 bg-slate-700 shrink-0" />
          
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Выйти из полноэкранного режима' : 'Во весь экран'}
            className="p-1.5 shrink-0 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer flex"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 3D Viewport Area */}
      <div className="relative flex-1 w-full overflow-hidden">
        {/* Blueprint Diagonal Metrology Watermark */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center select-none z-[1]">
          <div className="transform -rotate-25 text-slate-700/15 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black uppercase tracking-[0.25em] text-center whitespace-nowrap">
            ООО «ДС-ИНЖИНИРИНГ» • ЛИЦЕНЗИЯ № 25 • СЕРТИФИКАЦИЯ • ГОСТ Р ИСО/МЭК 17025 • МЕТРОЛОГИЯ
          </div>
        </div>

        {/* 3D WebGL Canvas */}
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onContextMenu={(e) => e.preventDefault()}
          className="w-full h-full cursor-grab active:cursor-grabbing block relative z-[2]"
        />

        {/* SVG Inspection Leader Lines & Surface Markers Overlay */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-[5]">
          {activeMode === 'colormap' && projectedCallouts.filter(c => c.isVisible).map((c) => (
            <g key={c.id}>
              {/* Outer halo ring */}
              <circle
                cx={c.screenX}
                cy={c.screenY}
                r="9"
                fill="none"
                stroke={c.dotColor}
                strokeWidth="1.2"
                strokeDasharray="3 2"
                opacity="0.8"
              />
              {/* Core point dot */}
              <circle
                cx={c.screenX}
                cy={c.screenY}
                r="4.5"
                fill={c.dotColor}
                stroke="#ffffff"
                strokeWidth="1.5"
              />
              {/* Smooth curved leader line connecting part to callout badge */}
              <path
                d={`M ${c.screenX} ${c.screenY} Q ${c.ctrlX} ${c.ctrlY} ${c.badgeX} ${c.badgeY}`}
                fill="none"
                stroke={c.lineColor}
                strokeWidth="1.6"
                strokeLinecap="round"
                opacity="0.85"
              />
            </g>
          ))}
        </svg>

        {/* 3D Coordinate Axis Labels (X, Y, Z) Anchored directly to Part's Center Trihedron */}
        {axesLabels.x.visible && (
          <div
            style={{ left: `${axesLabels.x.x}px`, top: `${axesLabels.x.y}px` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none font-mono font-black text-xs text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.9)] select-none z-[6]"
          >
            X
          </div>
        )}
        {axesLabels.y.visible && (
          <div
            style={{ left: `${axesLabels.y.x}px`, top: `${axesLabels.y.y}px` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none font-mono font-black text-xs text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.9)] select-none z-[6]"
          >
            Y
          </div>
        )}
        {axesLabels.z.visible && (
          <div
            style={{ left: `${axesLabels.z.x}px`, top: `${axesLabels.z.y}px` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none font-mono font-black text-xs text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.9)] select-none z-[6]"
          >
            Z
          </div>
        )}

        {/* HTML Inspection Callout Badges with Delta Values */}
        {activeMode === 'colormap' && projectedCallouts.filter(c => c.isVisible).map((c) => (
          <button
            key={c.id}
            type="button"
            style={{
              left: `${c.badgeX}px`,
              top: `${c.badgeY}px`,
              transform: 'translate(-50%, -50%)'
            }}
            onClick={() => {
              const pt = currentModel.inspectionPoints?.find(p => p.id === c.id) || null;
              setSelectedPoint(pt);
            }}
            title={`${c.name} (${c.surfaceName})`}
            className={`absolute pointer-events-auto cursor-pointer transition-all duration-150 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold tracking-tight shadow-sm border flex items-center gap-1.5 z-[7] ${
              selectedPoint?.id === c.id
                ? 'bg-slate-900 border-white text-white ring-2 ring-sky-400 scale-105 shadow-sky-500/20'
                : 'bg-slate-950/90 hover:bg-slate-900 border-cyan-500/80 text-cyan-300 hover:border-cyan-300'
            }`}
          >
            <span className={c.status === 'nominal' ? 'text-emerald-400' : c.status === 'warning' ? 'text-amber-400' : 'text-red-400'}>
              {c.shortLabel}:
            </span>
            <span>
              {c.deviation > 0 ? `+${c.deviation.toFixed(3)}` : c.deviation.toFixed(3)} мм
            </span>
          </button>
        ))}

        {/* Floating Reopen Button when UI is hidden */}
        {!showUi && (
          <button
            onClick={() => setShowUi(true)}
            className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1.5 bg-slate-950/90 hover:bg-slate-900 backdrop-blur-md px-4 py-1.5 rounded-xl border border-slate-700/80 shadow-sm text-xs font-semibold text-sky-400 hover:text-white transition-all duration-200 cursor-pointer animate-fade-in pointer-events-auto"
            title="Открыть панель режимов и настроек"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Панель режимов</span>
          </button>
        )}

        {/* Top-Left: Render Mode Menu & Integrated Section Slider */}
        <div className={`absolute top-2.5 left-2.5 z-20 flex flex-col gap-1.5 pointer-events-auto max-w-[220px] sm:max-w-[240px] transition-all duration-300 ${!showUi ? '-translate-x-[150%] opacity-0 pointer-events-none' : 'translate-x-0 opacity-100'}`}>
          <div className="bg-slate-950/90 backdrop-blur-md p-2 sm:p-2.5 rounded-xl border border-slate-700/80 shadow-sm">
            {/* Header: РЕЖИМ ОТОБРАЖЕНИЯ: with Close Button */}
            <div className="flex items-center justify-between mb-1 px-1">
              <div className="text-[9px] sm:text-[10px] font-extrabold text-slate-400 tracking-wider uppercase">
                РЕЖИМ ОТОБРАЖЕНИЯ:
              </div>
              <button
                onClick={() => setShowUi(false)}
                title="Закрыть панель (вернуться к 3D-сцене)"
                className="p-1 -mr-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 4 Uniform Modes with Icons and Labels */}
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setActiveMode('colormap')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer text-left ${
                  activeMode === 'colormap'
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
                title="Метрологическая карта отклонений с цветовым градиентом GD&T"
              >
                <Activity className="w-4 h-4 text-sky-300 shrink-0" />
                <span className="whitespace-nowrap">Карта отклонений (GD&T)</span>
              </button>

              <button
                onClick={() => setActiveMode('cad')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer text-left ${
                  activeMode === 'cad'
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
                title="Твердотельная модель САПР (форматы STEP / IGES)"
              >
                <Box className="w-4 h-4 text-blue-300 shrink-0" />
                <span className="whitespace-nowrap">САПР / CAD-модель (STEP)</span>
              </button>

              <button
                onClick={() => setActiveMode('mesh')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer text-left ${
                  activeMode === 'mesh'
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
                title="Полигональная сетка 3D-сканирования (формат STL Mesh)"
              >
                <Grid className="w-4 h-4 text-indigo-300 shrink-0" />
                <span className="whitespace-nowrap">Сетка скана (3D-сетка STL)</span>
              </button>

              <button
                onClick={() => setActiveMode('points')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer text-left ${
                  activeMode === 'points'
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
                title="Облако точек лазерного сканирования (XYZ Laser)"
              >
                <Layers className="w-4 h-4 text-cyan-300 shrink-0" />
                <span className="whitespace-nowrap">Облако точек (Лазер XYZ)</span>
              </button>
            </div>

            {/* Shading / Material Selection in ALL modes */}
            <div className="mt-2.5 pt-2.5 border-t border-slate-800">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Закраска / Материал:
                </span>
              </div>
              <select
                value={activeShading}
                onChange={(e) => setActiveShading(e.target.value as ShadingStyle)}
                className="w-full bg-slate-800/90 text-white text-[11px] rounded-lg px-2 py-1.5 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer"
              >
                <option value="default">По умолчанию / GD&T</option>
                <option value="glossy_chrome">Глянцевый хром</option>
                <option value="matte_titanium">Матовый титан</option>
                <option value="cad_blue">Инженерный CAD (Синий)</option>
                <option value="gold_brass">Золото / Латунь</option>
                <option value="flat_shading">Граненый (Flat Shading)</option>
                <option value="wire_overlay">Каркас поверх (Wire+Solid)</option>
                <option value="normals">Нормали поверхности (RGB)</option>
              </select>
            </div>

            {/* Integrated Clipping Plane Controls */}
            <div className="mt-2.5 pt-2.5 border-t border-slate-800">
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isClipping}
                    onChange={(e) => setIsClipping(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-600 text-sky-600 focus:ring-sky-500 bg-slate-800 cursor-pointer"
                  />
                  <span>Сечение: <span className={isClipping ? 'text-amber-400' : 'text-slate-400'}>{isClipping ? 'ВКЛ' : 'ВЫКЛ'}</span></span>
                </label>

                {/* Axis buttons [X] [Y] [Z] */}
                <div className="flex items-center bg-slate-800 rounded p-0.5 text-[10px] font-bold">
                  {(['x', 'y', 'z'] as const).map((axis) => (
                    <button
                      key={axis}
                      onClick={() => setClipAxis(axis)}
                      disabled={!isClipping}
                      className={`px-1.5 py-0.5 rounded transition-all uppercase cursor-pointer ${
                        clipAxis === axis && isClipping
                          ? 'bg-sky-600 text-white font-extrabold'
                          : 'text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed'
                      }`}
                    >
                      {axis}
                    </button>
                  ))}
                </div>
              </div>

              {/* Offset slider & display */}
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="-2.0"
                  max="2.0"
                  step="0.05"
                  disabled={!isClipping}
                  value={clipOffset}
                  onChange={(e) => setClipOffset(parseFloat(e.target.value))}
                  className="flex-1 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500 disabled:opacity-40"
                />
                <span className="font-mono text-[10px] text-slate-300 min-w-[48px] text-right font-bold">
                  {clipOffset > 0 ? `+${clipOffset.toFixed(2)}` : clipOffset.toFixed(2)} мм
                </span>
              </div>
            </div>
          </div>

          {/* Mobile "Close Panel" Button */}
          <button
            onClick={() => setShowUi(false)}
            className="md:hidden w-full flex items-center justify-center gap-1.5 bg-slate-900/95 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-700/80 shadow-sm text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer text-xs font-semibold"
          >
            <X className="w-4 h-4" />
            <span>Закрыть панель</span>
          </button>

          {/* Custom uploaded file badge / indicator */}
          {isLoadingCustomFile && (
            <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-blue-500/40 text-[11px] text-blue-300 shadow-lg animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400 shrink-0" />
              <span>Загрузка 3D-файла геометрии...</span>
            </div>
          )}

          {!isLoadingCustomFile && activeCustomFile && (
            <div className="flex items-center justify-between gap-2 bg-slate-900/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-emerald-500/40 text-[11px] text-emerald-300 shadow-lg">
              <div className="flex items-center gap-1.5 truncate">
                <HardDrive className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="font-semibold truncate max-w-[140px]" title={activeCustomFile.name}>
                  {activeCustomFile.name}
                </span>
                {activeCustomFile.size && (
                  <span className="text-[10px] text-slate-400 font-mono">
                    ({activeCustomFile.size})
                  </span>
                )}
              </div>

              {canManage3D ? (
                <a
                  href={activeCustomFile.url}
                  target="_blank"
                  rel="noreferrer"
                  download={activeCustomFile.name}
                  title="Скачать исходный 3D-файл (Доступно администраторам и модераторам)"
                  className="text-emerald-400 hover:text-white bg-emerald-500/20 hover:bg-emerald-500/40 px-2 py-0.5 rounded transition-colors flex items-center gap-1 text-[10px] font-semibold shrink-0"
                >
                  <Download className="w-3 h-3" />
                  <span>Скачать</span>
                </a>
              ) : (
                <div 
                  className="flex items-center gap-1 text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 shrink-0 cursor-help"
                  title="Файлы CAD, сеток STL и облаков точек защищены авторским правом «ДС-Инжиниринг». Скачивание разрешено только авторизованным сотрудникам."
                >
                  <Lock className="w-3 h-3 text-amber-400" />
                  <span>Защищено</span>
                </div>
              )}
            </div>
          )}

          {customFileError && (
            <div className="flex items-center gap-1.5 bg-red-950/80 backdrop-blur-md px-2.5 py-1 rounded-xl border border-red-500/40 text-[10px] text-red-300 shadow-lg">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <span>{customFileError} (процедурный CAD)</span>
            </div>
          )}

          {/* Selected Inspection Point Callout Card */}
          {selectedPoint && (
            <div className="bg-slate-900/95 backdrop-blur-md p-3 rounded-xl border border-cyan-500/50 shadow-sm w-full animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${
                    selectedPoint.status === 'nominal' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {selectedPoint.status === 'nominal' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white leading-tight">{selectedPoint.name}</h4>
                    <div className="text-[10px] text-slate-400">{selectedPoint.surfaceName}</div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPoint(null)}
                  className="text-slate-400 hover:text-white text-xs p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800 text-[10px]">
                <div className="bg-slate-950/60 p-1.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 text-[9px] block">Отклонение Δ:</span>
                  <span className={`font-mono font-bold text-xs ${
                    selectedPoint.deviation >= 0 ? 'text-emerald-400' : 'text-blue-400'
                  }`}>
                    {selectedPoint.deviation > 0 ? `+${selectedPoint.deviation.toFixed(3)}` : selectedPoint.deviation.toFixed(3)} мм
                  </span>
                </div>
                <div className="bg-slate-950/60 p-1.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 text-[9px] block">Статус допуска:</span>
                  <span className={`font-bold ${
                    selectedPoint.status === 'nominal' ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {selectedPoint.status === 'nominal' ? 'В ДОПУСКЕ (OK)' : 'ПРЕДУПРЕЖДЕНИЕ'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Interactive GD&T Navigation & Pulsar Hint Banner */}
        <div className="absolute top-2.5 sm:top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/85 backdrop-blur-md border border-cyan-500/40 text-cyan-200 text-[10px] sm:text-xs font-semibold shadow-lg shadow-cyan-950/50">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          <span className="truncate">Интерактивный GD&T-анализ: вращайте деталь для инспекции допуска формы</span>
        </div>

        {/* Top-Right: GD&T Comparison Scale & Inspection Metrics (Mode-aware visibility) */}
        {activeMode !== 'cad' && (
          <div className={`absolute top-2.5 right-2.5 z-20 flex items-start gap-2 pointer-events-auto transition-all duration-300 ${!showUi ? 'translate-x-[150%] opacity-0 pointer-events-none' : 'translate-x-0 opacity-100'}`}>
            {/* Metrology Comparison Scale (Displayed ONLY in 'colormap' / GD&T mode) */}
            {activeMode === 'colormap' && (
              <div className="bg-slate-900/90 backdrop-blur-md px-2 py-1.5 rounded-xl border border-slate-800/90 shadow-sm flex flex-col items-center select-none font-mono">
                {/* Top Out-of-Tolerance Cap (Solid Red Box) */}
                <div 
                  className="w-4 sm:w-5 h-2.5 sm:h-3 bg-[#FF0000] border border-black/90 rounded-[1px] shadow-sm mb-0.5" 
                  title="Припуск > +0.15 мм (Выход за верхнее поле допуска)"
                />

                {/* Main Graduated Scale with Values, Pointer Arrows, Dashed Ticks & Stepped Color Bar */}
                <div className="relative flex items-stretch gap-1 h-36 sm:h-44 text-[9px] sm:text-[10px]">
                  {/* Left Values and Pointers Column */}
                  <div className="flex flex-col justify-between items-end text-right font-bold tracking-tight pr-0.5 select-none py-0.5">
                    {/* 0,15 */}
                    <div className="flex items-center gap-0.5 leading-none text-slate-200">
                      <span>0,15</span>
                      <svg className="w-1.5 h-2 text-slate-300 dark:text-slate-100 fill-current shrink-0" viewBox="0 0 6 8">
                        <polygon points="0,0 6,4 0,8" />
                      </svg>
                    </div>

                    {/* 0,12 */}
                    <div className="flex items-center gap-0.5 leading-none text-slate-400 text-[8px] sm:text-[9px]">
                      <span>0,12</span>
                      <span className="w-1 border-t border-dashed border-slate-500/80"></span>
                    </div>

                    {/* 0,09 */}
                    <div className="flex items-center gap-0.5 leading-none text-slate-400 text-[8px] sm:text-[9px]">
                      <span>0,09</span>
                      <span className="w-1 border-t border-dashed border-slate-500/80"></span>
                    </div>

                    {/* 0,06 */}
                    <div className="flex items-center gap-0.5 leading-none text-slate-400 text-[8px] sm:text-[9px]">
                      <span>0,06</span>
                      <span className="w-1 border-t border-dashed border-slate-500/80"></span>
                    </div>

                    {/* 0,03 (Upper tolerance threshold in Green) */}
                    <div className="flex items-center gap-0.5 leading-none text-[#00D000] font-black">
                      <span>0,03</span>
                      <svg className="w-1.5 h-2 text-[#00D000] fill-current shrink-0" viewBox="0 0 6 8">
                        <polygon points="0,0 6,4 0,8" />
                      </svg>
                    </div>

                    {/* 0,0 (Center nominal) */}
                    <div className="flex items-center gap-0.5 leading-none text-slate-200 font-bold">
                      <span>0,0</span>
                      <svg className="w-1.5 h-2 text-slate-300 dark:text-slate-100 fill-current shrink-0" viewBox="0 0 6 8">
                        <polygon points="0,0 6,4 0,8" />
                      </svg>
                    </div>

                    {/* -0,03 (Lower tolerance threshold in Green) */}
                    <div className="flex items-center gap-0.5 leading-none text-[#00D000] font-black">
                      <span>-0,03</span>
                      <svg className="w-1.5 h-2 text-[#00D000] fill-current shrink-0" viewBox="0 0 6 8">
                        <polygon points="0,0 6,4 0,8" />
                      </svg>
                    </div>

                    {/* -0,06 */}
                    <div className="flex items-center gap-0.5 leading-none text-slate-400 text-[8px] sm:text-[9px]">
                      <span>-0,06</span>
                      <span className="w-1 border-t border-dashed border-slate-500/80"></span>
                    </div>

                    {/* -0,09 */}
                    <div className="flex items-center gap-0.5 leading-none text-slate-400 text-[8px] sm:text-[9px]">
                      <span>-0,09</span>
                      <span className="w-1 border-t border-dashed border-slate-500/80"></span>
                    </div>

                    {/* -0,12 */}
                    <div className="flex items-center gap-0.5 leading-none text-slate-400 text-[8px] sm:text-[9px]">
                      <span>-0,12</span>
                      <span className="w-1 border-t border-dashed border-slate-500/80"></span>
                    </div>

                    {/* -0,15 */}
                    <div className="flex items-center gap-0.5 leading-none text-slate-200">
                      <span>-0,15</span>
                      <svg className="w-1.5 h-2 text-slate-300 dark:text-slate-100 fill-current shrink-0" viewBox="0 0 6 8">
                        <polygon points="0,0 6,4 0,8" />
                      </svg>
                    </div>
                  </div>

                  {/* Right Stepped Colored Bar Column */}
                  <div className="relative w-4 sm:w-5 h-full rounded-[1px] overflow-hidden border border-black/90 flex flex-col shadow-inner">
                    {/* Upper Positive Stepped Gradients (+0.15 to +0.03) */}
                    <div className="flex-[3] flex flex-col">
                      <div className="flex-1 bg-[#FF2200]" title="+0.15 .. +0.12 мм" />
                      <div className="flex-1 bg-[#FF5500]" title="+0.12 .. +0.09 мм" />
                      <div className="flex-1 bg-[#FF8800]" title="+0.09 .. +0.06 мм" />
                      <div className="flex-1 bg-[#FFB700]" title="+0.06 .. +0.03 мм" />
                    </div>

                    {/* Tolerance In-Spec Band (+0.03 to -0.03) with Dashed Perimeter */}
                    <div 
                      className="flex-[2] bg-[#00A800] border-2 border-dashed border-black/95 relative z-10 flex items-center justify-center shadow-[inset_0_0_2px_rgba(0,0,0,0.4)]" 
                      title="Поле допуска: ±0.030 мм (В допуске)"
                    >
                      <div className="w-full h-px bg-white/40" />
                    </div>

                    {/* Lower Negative Stepped Gradients (-0.03 to -0.15) */}
                    <div className="flex-[3] flex flex-col">
                      <div className="flex-1 bg-[#00C8FF]" title="-0.03 .. -0.06 мм" />
                      <div className="flex-1 bg-[#0090FF]" title="-0.06 .. -0.09 мм" />
                      <div className="flex-1 bg-[#0055FF]" title="-0.09 .. -0.12 мм" />
                      <div className="flex-1 bg-[#0015E0]" title="-0.12 .. -0.15 мм" />
                    </div>
                  </div>
                </div>

                {/* Bottom Out-of-Tolerance Cap (Solid Blue Box) */}
                <div 
                  className="w-4 sm:w-5 h-2.5 sm:h-3 bg-[#0000FF] border border-black/90 rounded-[1px] shadow-sm mt-0.5" 
                  title="Недобор < -0.15 мм (Выход за нижнее поле допуска)"
                />
              </div>
            )}

            {/* Inspection Summary Metrics Block */}
            <div className="bg-slate-950/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-slate-800/80 shadow-sm flex flex-col gap-1.5 min-w-[115px] sm:min-w-[125px] text-right font-mono">
              {/* Point Count or Triangle Count Metric (Displayed for colormap, mesh, points) */}
              <div>
                <div className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  {activeMode === 'mesh' ? 'КОЛИЧЕСТВО ТРЕУГОЛЬНИКОВ:' : 'ТОЧЕК СКАНА:'}
                </div>
                <div className="text-xs sm:text-sm font-black text-white">
                  {activeMode === 'mesh'
                    ? (currentModel.triangleCount || Math.round(currentModel.pointCount * 2)).toLocaleString('ru-RU')
                    : currentModel.pointCount.toLocaleString('ru-RU')}
                </div>
              </div>

              {/* Accuracy / Error Metric (Displayed for colormap, mesh, points) */}
              <div>
                <div className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  ПОГРЕШНОСТЬ:
                </div>
                <div className="text-[11px] sm:text-xs font-bold text-cyan-400">
                  0.018 мм
                </div>
              </div>

              {/* Tolerance % and Audit Status (Displayed ONLY in 'colormap' / GD&T mode) */}
              {activeMode === 'colormap' && (
                <>
                  <div>
                    <div className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                      В ДОПУСКЕ ±0.030:
                    </div>
                    <div className="text-[11px] sm:text-xs font-bold text-emerald-400">
                      94.2 %
                    </div>
                  </div>

                  <div className="pt-0.5 border-t border-slate-800/80">
                    <div className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                      АУДИТ ГОСТ:
                    </div>
                    <div className="text-[11px] sm:text-xs font-black text-emerald-400 tracking-wider">
                      СООТВЕТСТВУЕТ
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Bottom Toolset Bar: Views, Security Notice, Auto-rotate, Screenshot, Fullscreen */}
        <div className="absolute bottom-0 left-0 right-0 h-10 bg-slate-950/95 border-t border-slate-800/80 px-2 sm:px-4 flex items-center justify-between gap-2 z-20 shrink-0 select-none text-[11px] overflow-x-auto no-scrollbar">
          {/* Security and Copyright Notice */}
          <div className="flex items-center gap-1 sm:gap-1.5 text-slate-400 shrink-0" title="Файлы защищены авторским правом ООО «ДС-Инжиниринг»">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <Lock className="w-3 h-3 text-amber-400/80 shrink-0" />
            <span className="hidden sm:inline truncate text-[10px] sm:text-[11px]">
              Файлы защищены авторским правом.
            </span>
          </div>

          {/* Quick Camera Views & Tools */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <button
              onClick={() => setIsAutoRotating(prev => !prev)}
              title={isAutoRotating ? 'Остановить автовращение' : 'Включить автовращение 360°'}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isAutoRotating ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <RotateCw className={`w-3.5 h-3.5 ${isAutoRotating ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={resetCamera}
              title="Сбросить ориентацию камеры (Изометрия)"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Crosshair className="w-3.5 h-3.5" />
            </button>

            <div className="h-4 w-px bg-slate-800 mx-0.5" />

            {/* Quick Views */}
            <div className="flex items-center gap-1 text-[11px] font-medium">
              <button
                onClick={() => setCameraView('top')}
                className="px-2 py-1 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Сверху
              </button>
              <button
                onClick={() => setCameraView('front')}
                className="px-2 py-1 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Спереди
              </button>
              <button
                onClick={() => setCameraView('right')}
                className="px-2 py-1 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Сбоку
              </button>
              <button
                onClick={() => setCameraView('iso')}
                className="px-2 py-1 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Изо
              </button>
            </div>

            <div className="h-4 w-px bg-slate-800 mx-0.5" />

            <button
              onClick={captureScreenshot}
              title="Сделать снимок экрана (PNG)"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setShowUi(!showUi)}
              title={showUi ? 'Скрыть панели инструментов' : 'Показать панели инструментов'}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            >
              {showUi ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
