import { useRef, useState, useEffect, Suspense, forwardRef, useImperativeHandle } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, ContactShadows, Html } from '@react-three/drei';
import * as THREE from 'three';
import { TentConfiguration } from '../../types/configurator';
import { identifyModelParts, applyConfigurationToModel, ModelPartMapping } from '../../utils/modelUtils';
import {
  Maximize,
  Minimize,
  RotateCcw,
  Camera,
  Layers,
  Sparkles,
  Loader2,
  Sun,
  Moon,
  Monitor,
  Box,
  MapPin,
  X
} from 'lucide-react';

interface TentViewerProps {
  config: TentConfiguration;
  onSnapshotReady?: (dataUrl: string) => void;
  show2DEditorOverlay?: boolean;
  onToggle2DEditor?: () => void;
}

export interface TentViewerHandle {
  captureSnapshot: () => string;
  resetCamera: () => void;
}

interface HotspotData {
  id: string;
  title: string;
  position: [number, number, number];
  description: string;
}

const HOTSPOTS: HotspotData[] = [
  {
    id: 'peak',
    title: 'Center Peak Mast & Tensioner',
    position: [0, 3.2, 0],
    description: '3.2m (10.5ft) peak height with internal spring mast to keep canopy taut and prevent rainwater pooling.',
  },
  {
    id: 'valance',
    title: 'Front Valance Drop Banner',
    position: [0, 2.05, 1.55],
    description: '25cm reinforced perimeter eave border designed for high-visibility company slogans & contact info.',
  },
  {
    id: 'leg',
    title: 'Telescopic Hexagonal Leg',
    position: [-1.48, 1.15, 1.48],
    description: 'Commercial aircraft-grade aluminum/steel column with quick-release push buttons and 3 height settings.',
  },
  {
    id: 'weights',
    title: 'Cast-Iron Wind Ballast Plate',
    position: [-1.48, 0.15, 1.48],
    description: '28 lbs cast-iron slotted disc interlocking over corner footpad for high-wind stability up to 55 km/h.',
  },
];

// 3D Model Component inside Canvas
function TentModel({
  config,
  wireframe,
  showHotspots,
  activeHotspot,
  onSelectHotspot,
}: {
  config: TentConfiguration;
  wireframe: boolean;
  showHotspots: boolean;
  activeHotspot: HotspotData | null;
  onSelectHotspot: (h: HotspotData | null) => void;
}) {
  const { scene } = useGLTF('/models/tent.glb');
  const partsRef = useRef<ModelPartMapping | null>(null);

  // Initialize model parts
  useEffect(() => {
    if (scene) {
      partsRef.current = identifyModelParts(scene);
    }
  }, [scene]);

  // Apply configuration updates whenever config changes
  useEffect(() => {
    if (scene && partsRef.current) {
      applyConfigurationToModel(scene, partsRef.current, config);
    }
  }, [scene, config]);

  // Toggle wireframe mode for inspection
  useEffect(() => {
    if (scene) {
      scene.traverse((node) => {
        if (node instanceof THREE.Mesh && node.material) {
          const mats = Array.isArray(node.material) ? node.material : [node.material];
          mats.forEach((m) => {
            if ('wireframe' in m) {
              m.wireframe = wireframe;
            }
          });
        }
      });
    }
  }, [scene, wireframe]);

  return (
    <group>
      <primitive object={scene} />

      {/* 3D Feature Hotspot Annotation Markers */}
      {showHotspots &&
        HOTSPOTS.map((h) => {
          // Hide weights pin if weights are disabled
          if (h.id === 'weights' && !config.accessories.weightPlates) return null;
          const isSelected = activeHotspot?.id === h.id;

          return (
            <Html key={h.id} position={h.position} center distanceFactor={10}>
              <div className="relative group">
                <button
                  type="button"
                  onClick={() => onSelectHotspot(isSelected ? null : h)}
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shadow-lg transition-transform ${
                    isSelected
                      ? 'bg-amber-500 text-white scale-125 ring-4 ring-amber-300 animate-none'
                      : 'bg-sky-600 text-white hover:scale-110 ring-2 ring-white hover:bg-sky-500 animate-pulse'
                  }`}
                  title={h.title}
                >
                  <MapPin className="w-3.5 h-3.5" />
                </button>
              </div>
            </Html>
          );
        })}
    </group>
  );
}

// Preload the GLB
useGLTF.preload('/models/tent.glb');

export const TentViewer3D = forwardRef<TentViewerHandle, TentViewerProps>(({
  config,
  onSnapshotReady,
  show2DEditorOverlay,
  onToggle2DEditor
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const controlsRef = useRef<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activePreset, setActivePreset] = useState<'front' | 'iso' | 'top' | 'inside'>('iso');

  // Enhanced Viewer State
  const [lightingEnv, setLightingEnv] = useState<'studio' | 'daylight' | 'night'>('studio');
  const [isWireframe, setIsWireframe] = useState(false);
  const [showHotspots, setShowHotspots] = useState(true);
  const [activeHotspot, setActiveHotspot] = useState<HotspotData | null>(null);

  // Imperative handle for snapshot capture & camera reset
  useImperativeHandle(ref, () => ({
    captureSnapshot: () => {
      if (canvasRef.current) {
        return canvasRef.current.toDataURL('image/jpeg', 0.9);
      }
      return '';
    },
    resetCamera: () => {
      handleCameraPreset('iso');
    }
  }));

  // Camera Presets
  const handleCameraPreset = (preset: 'front' | 'iso' | 'top' | 'inside') => {
    setActivePreset(preset);
    setActiveHotspot(null);
    const controls = controlsRef.current;
    if (!controls) return;

    switch (preset) {
      case 'front':
        controls.object.position.set(0, 1.8, 5.5);
        controls.target.set(0, 1.5, 0);
        break;
      case 'iso':
        controls.object.position.set(4.6, 2.8, 4.6);
        controls.target.set(0, 1.4, 0);
        break;
      case 'top':
        controls.object.position.set(0.1, 7.5, 0.1);
        controls.target.set(0, 0, 0);
        break;
      case 'inside':
        controls.object.position.set(0, 1.5, 0.5);
        controls.target.set(0, 2.2, 0);
        break;
    }
    controls.update();
  };

  const handleSelectHotspot = (h: HotspotData | null) => {
    setActiveHotspot(h);
    if (!h) return;
    const controls = controlsRef.current;
    if (controls) {
      controls.target.set(h.position[0], h.position[1], h.position[2]);
      controls.update();
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(console.error);
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(console.error);
    }
  };

  const handleCaptureImage = () => {
    const canvas = containerRef.current?.querySelector('canvas');
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      if (onSnapshotReady) onSnapshotReady(dataUrl);

      // Trigger instant download for customer
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `Tent_Mockup_3D_${Date.now()}.jpg`;
      a.click();
    }
  };

  // Environment styling parameters
  const isNight = lightingEnv === 'night';
  const isDaylight = lightingEnv === 'daylight';

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-[500px] flex-1 overflow-hidden select-none transition-colors duration-500 ${
        isNight
          ? 'bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950'
          : isDaylight
          ? 'bg-gradient-to-b from-sky-100 via-sky-50 to-amber-50/60'
          : 'bg-gradient-to-b from-slate-100 via-slate-50 to-slate-200'
      }`}
    >
      {/* 3D Canvas */}
      <Canvas
        shadows
        gl={{ preserveDrawingBuffer: true, antialias: true, alpha: false }}
        camera={{ position: [4.6, 2.8, 4.6], fov: 45 }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onCreated={({ gl }) => {
          canvasRef.current = gl.domElement;
          gl.setClearColor(new THREE.Color(isNight ? '#090d16' : isDaylight ? '#e0f2fe' : '#f1f5f9'));
        }}
      >
        <Suspense
          fallback={
            <Html center>
              <div className="flex flex-col items-center gap-3 bg-white/90 backdrop-blur-md px-6 py-4 rounded-xl shadow-xl border border-slate-200">
                <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
                <p className="text-xs font-semibold text-slate-700">Loading High-Fidelity 3D Tent Asset...</p>
              </div>
            </Html>
          }
        >
          {/* Lighting Environment */}
          {isNight ? (
            <>
              <ambientLight intensity={0.25} color="#334155" />
              <directionalLight position={[6, 8, 4]} intensity={0.4} color="#94a3b8" />
              {/* Warm Interior Lighting (Illuminated by LED light kit if installed) */}
              <pointLight
                position={[0, 2.2, 0]}
                intensity={config.accessories.ledTentLightSystem ? 4.5 : 1.2}
                color="#fef08a"
                distance={10}
                decay={2}
              />
            </>
          ) : isDaylight ? (
            <>
              <ambientLight intensity={0.9} color="#e0f2fe" />
              <directionalLight
                position={[10, 15, 8]}
                intensity={1.8}
                color="#fffbeb"
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
              />
              <directionalLight position={[-8, 6, -6]} intensity={0.6} color="#bae6fd" />
            </>
          ) : (
            <>
              <ambientLight intensity={0.8} />
              <directionalLight
                position={[8, 12, 6]}
                intensity={1.5}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
                shadow-bias={-0.0001}
              />
              <directionalLight position={[-8, 8, -6]} intensity={0.5} />
              <directionalLight position={[0, -4, 0]} intensity={0.2} />
            </>
          )}

          {/* Model */}
          <TentModel
            config={config}
            wireframe={isWireframe}
            showHotspots={showHotspots}
            activeHotspot={activeHotspot}
            onSelectHotspot={handleSelectHotspot}
          />

          {/* Ground Soft Shadows */}
          <ContactShadows
            position={[0, 0, 0]}
            opacity={isNight ? 0.9 : 0.65}
            scale={12}
            blur={1.6}
            far={5}
            resolution={1024}
            color={isNight ? '#020617' : '#0f172a'}
          />

          {/* Camera Orbit Controls */}
          <OrbitControls
            ref={controlsRef}
            target={[0, 1.4, 0]}
            minDistance={2.0}
            maxDistance={12.0}
            maxPolarAngle={Math.PI / 2 - 0.02} // Prevent camera clipping through ground
            enableDamping
            dampingFactor={0.06}
          />
        </Suspense>
      </Canvas>

      {/* Top Floating Controls Bar */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
        {/* Camera Perspective Angle Presets */}
        <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md p-1.5 rounded-xl shadow-lg border border-slate-200/80 pointer-events-auto">
          <button
            type="button"
            onClick={() => handleCameraPreset('iso')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activePreset === 'iso' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            3D Angle
          </button>
          <button
            type="button"
            onClick={() => handleCameraPreset('front')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activePreset === 'front' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Front
          </button>
          <button
            type="button"
            onClick={() => handleCameraPreset('top')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activePreset === 'top' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Roof Top
          </button>
          <button
            type="button"
            onClick={() => handleCameraPreset('inside')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activePreset === 'inside' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Walk-In
          </button>
        </div>

        {/* Action Controls: Hotspots, Lighting, Wireframe, 2D Studio, Snapshot, Fullscreen */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Lighting Mode Selector */}
          <div className="flex items-center bg-white/90 backdrop-blur-md p-1 rounded-xl shadow-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setLightingEnv('studio')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                lightingEnv === 'studio' ? 'bg-sky-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Studio Neutral Light"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setLightingEnv('daylight')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                lightingEnv === 'daylight' ? 'bg-amber-500 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Outdoor Daylight"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setLightingEnv('night')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                lightingEnv === 'night' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Night Market Mode (LED Glow)"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Hotspots Toggle */}
          <button
            type="button"
            onClick={() => setShowHotspots(!showHotspots)}
            className={`p-2.5 rounded-xl shadow-lg border transition-colors ${
              showHotspots
                ? 'bg-sky-600 text-white border-sky-600'
                : 'bg-white/90 text-slate-700 hover:bg-white border-slate-200'
            }`}
            title="Toggle 3D Feature Hotspot Markers"
          >
            <MapPin className="w-4 h-4" />
          </button>

          {/* Wireframe Mesh Toggle */}
          <button
            type="button"
            onClick={() => setIsWireframe(!isWireframe)}
            className={`p-2.5 rounded-xl shadow-lg border transition-colors ${
              isWireframe
                ? 'bg-amber-600 text-white border-amber-600'
                : 'bg-white/90 text-slate-700 hover:bg-white border-slate-200'
            }`}
            title="Toggle 3D Wireframe Topology Inspection"
          >
            <Box className="w-4 h-4" />
          </button>

          {onToggle2DEditor && (
            <button
              type="button"
              onClick={onToggle2DEditor}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl shadow-lg border transition-all ${
                show2DEditorOverlay
                  ? 'bg-sky-600 text-white border-sky-600'
                  : 'bg-white/95 text-slate-700 hover:text-slate-900 hover:bg-white border-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{show2DEditorOverlay ? 'Hide 2D Studio' : 'Open 2D Studio'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => handleCameraPreset('iso')}
            className="p-2.5 bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 rounded-xl shadow-lg border border-slate-200 transition-colors"
            title="Reset Camera View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleCaptureImage}
            className="p-2.5 bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 rounded-xl shadow-lg border border-slate-200 transition-colors"
            title="Download 3D Mockup Screenshot (JPG)"
          >
            <Camera className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2.5 bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 rounded-xl shadow-lg border border-slate-200 transition-colors"
            title="Toggle Fullscreen Mode"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Active Hotspot Engineering Specification Card */}
      {activeHotspot && (
        <div className="absolute bottom-14 left-4 z-20 max-w-sm bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-slate-200/90 text-slate-800 transition-all animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Engineering Specification
            </span>
            <button
              type="button"
              onClick={() => setActiveHotspot(null)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <h4 className="text-xs font-extrabold text-slate-900 mb-1">{activeHotspot.title}</h4>
          <p className="text-[11px] text-slate-600 leading-relaxed">{activeHotspot.description}</p>
        </div>
      )}

      {/* Bottom Viewer Guide Badge */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-md rounded-full shadow-md border border-slate-200/60 pointer-events-none text-slate-500 text-[11px]">
        <Sparkles className="w-3.5 h-3.5 text-sky-500" />
        <span>Rotate: Left Click + Drag | Pan: Right Click | Zoom: Scroll</span>
      </div>
    </div>
  );
});

TentViewer3D.displayName = 'TentViewer3D';
