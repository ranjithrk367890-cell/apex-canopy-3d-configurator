import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  TentConfiguration,
  DesignElement,
  LogoElement,
  TextElement
} from '../../types/configurator';
import { PRINTABLE_SURFACES } from '../../utils/constants';
import { renderSurfaceToCanvas } from '../../utils/textureGenerator';
import {
  Move,
  RotateCw,
  Trash2,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Undo2,
  Layers
} from 'lucide-react';

interface DesignCanvas2DProps {
  config: TentConfiguration;
  onChange: (updatedConfig: TentConfiguration) => void;
}

export const DesignCanvas2D: React.FC<DesignCanvas2DProps> = ({ config, onChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  // Interaction State for Drag / Resize / Rotate
  const [isInteracting, setIsInteracting] = useState<'drag' | 'resize' | 'rotate' | null>(null);
  const [interactionStart, setInteractionStart] = useState<{
    mouseX: number;
    mouseY: number;
    elementX: number;
    elementY: number;
    scale: number;
    rotation: number;
  } | null>(null);

  // History state for Undo
  const [history, setHistory] = useState<DesignElement[][]>([]);

  const activeSurface = config.activeSurface;
  const currentElements = config.surfaceDesigns[activeSurface] || [];
  const surfaceMeta = PRINTABLE_SURFACES.find(s => s.id === activeSurface) || PRINTABLE_SURFACES[0];

  // Save history snapshot before making changes
  const pushHistory = useCallback(() => {
    setHistory(prev => [...prev.slice(-15), JSON.parse(JSON.stringify(currentElements))]);
  }, [currentElements]);

  const handleUndo = () => {
    if (history.length === 0) return;
    const prevElements = history[history.length - 1];
    setHistory(prev => prev.slice(0, -1));

    const updatedDesigns = {
      ...config.surfaceDesigns,
      [activeSurface]: prevElements
    };
    onChange({ ...config, surfaceDesigns: updatedDesigns });
    if (selectedElementId && !prevElements.some(e => e.id === selectedElementId)) {
      setSelectedElementId(null);
    }
  };

  const handleResetSurface = () => {
    pushHistory();
    const updatedDesigns = {
      ...config.surfaceDesigns,
      [activeSurface]: []
    };
    onChange({ ...config, surfaceDesigns: updatedDesigns });
    setSelectedElementId(null);
  };

  // Re-draw 2D Canvas whenever configuration, active surface, or elements change
  useEffect(() => {
    let isCancelled = false;
    const canvas = canvasRef.current;
    if (!canvas) return;

    renderSurfaceToCanvas(activeSurface, config, canvas).then(() => {
      if (isCancelled) return;
      // Draw UI selection overlay if an element is selected
      if (selectedElementId) {
        drawSelectionOverlay(canvas);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [config, activeSurface, selectedElementId]);

  // Draw selection bounding box and transform handles over the rendered canvas
  const drawSelectionOverlay = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const el = currentElements.find(e => e.id === selectedElementId);
    if (!el) return;

    const width = canvas.width;
    const height = canvas.height;

    const posX = (el.x / 100) * width;
    const posY = (el.y / 100) * height;

    let elW = 200;
    let elH = 80;

    if (el.type === 'logo') {
      const logo = el as LogoElement;
      elW = logo.width * logo.scale;
      elH = logo.height * logo.scale;
    } else if (el.type === 'text') {
      const textEl = el as TextElement;
      const fontSize = textEl.fontSize * textEl.scale;
      ctx.font = `${textEl.fontWeight === 'bold' ? 'bold ' : ''}${fontSize}px ${textEl.fontFamily}`;
      const metrics = ctx.measureText(textEl.text);
      elW = metrics.width + 30;
      elH = fontSize * 1.4;
    }

    ctx.save();
    ctx.translate(posX, posY);
    if (el.rotation) {
      ctx.rotate((el.rotation * Math.PI) / 180);
    }

    // Bounding Box
    ctx.strokeStyle = '#0284C7';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(-elW / 2 - 8, -elH / 2 - 8, elW + 16, elH + 16);
    ctx.setLineDash([]);

    // Corner Resize Handle (Bottom-Right)
    const handleSize = 12;
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#0284C7';
    ctx.lineWidth = 2.5;
    ctx.fillRect(elW / 2 + 8 - handleSize / 2, elH / 2 + 8 - handleSize / 2, handleSize, handleSize);
    ctx.strokeRect(elW / 2 + 8 - handleSize / 2, elH / 2 + 8 - handleSize / 2, handleSize, handleSize);

    // Rotate Handle (Top-Center)
    ctx.beginPath();
    ctx.moveTo(0, -elH / 2 - 8);
    ctx.lineTo(0, -elH / 2 - 28);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, -elH / 2 - 28, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#0284C7';
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  };

  // Convert mouse coordinate on canvas element to percentage [0..100]
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0, rawX: 0, rawY: 0, width: 0, height: 0 };
    const rect = canvas.getBoundingClientRect();
    const rawX = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const rawY = ((e.clientY - rect.top) / rect.height) * canvas.height;
    return {
      x: (rawX / canvas.width) * 100,
      y: (rawY / canvas.height) * 100,
      rawX,
      rawY,
      width: canvas.width,
      height: canvas.height,
    };
  };

  // Hit test to select element or start drag/resize/rotate
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e);
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Check if clicking existing selected element's handles
    if (selectedElementId) {
      const sel = currentElements.find(el => el.id === selectedElementId);
      if (sel) {
        const posX = (sel.x / 100) * coords.width;
        const posY = (sel.y / 100) * coords.height;

        let elW = sel.type === 'logo' ? (sel as LogoElement).width * sel.scale : 220;
        let elH = sel.type === 'logo' ? (sel as LogoElement).height * sel.scale : 70;

        // Rotate handle check
        const rotHandleX = posX;
        const rotHandleY = posY - elH / 2 - 28;
        const distRot = Math.hypot(coords.rawX - rotHandleX, coords.rawY - rotHandleY);
        if (distRot < 20) {
          pushHistory();
          setIsInteracting('rotate');
          setInteractionStart({
            mouseX: e.clientX,
            mouseY: e.clientY,
            elementX: sel.x,
            elementY: sel.y,
            scale: sel.scale,
            rotation: sel.rotation || 0,
          });
          return;
        }

        // Resize handle check (bottom right)
        const resizeHandleX = posX + elW / 2 + 8;
        const resizeHandleY = posY + elH / 2 + 8;
        const distResize = Math.hypot(coords.rawX - resizeHandleX, coords.rawY - resizeHandleY);
        if (distResize < 20) {
          pushHistory();
          setIsInteracting('resize');
          setInteractionStart({
            mouseX: e.clientX,
            mouseY: e.clientY,
            elementX: sel.x,
            elementY: sel.y,
            scale: sel.scale,
            rotation: sel.rotation || 0,
          });
          return;
        }
      }
    }

    // Check if clicked any element (iterate reverse order so top elements get priority)
    for (let i = currentElements.length - 1; i >= 0; i--) {
      const el = currentElements[i];
      const posX = (el.x / 100) * coords.width;
      const posY = (el.y / 100) * coords.height;

      let elW = 200;
      let elH = 80;
      if (el.type === 'logo') {
        const logo = el as LogoElement;
        elW = logo.width * logo.scale;
        elH = logo.height * logo.scale;
      } else if (el.type === 'text') {
        const textEl = el as TextElement;
        elW = textEl.text.length * textEl.fontSize * 0.6 * textEl.scale;
        elH = textEl.fontSize * 1.4 * textEl.scale;
      }

      const dx = coords.rawX - posX;
      const dy = coords.rawY - posY;

      if (Math.abs(dx) <= elW / 2 + 10 && Math.abs(dy) <= elH / 2 + 10) {
        setSelectedElementId(el.id);
        pushHistory();
        setIsInteracting('drag');
        setInteractionStart({
          mouseX: e.clientX,
          mouseY: e.clientY,
          elementX: el.x,
          elementY: el.y,
          scale: el.scale,
          rotation: el.rotation || 0,
        });
        return;
      }
    }

    // Clicked empty area
    setSelectedElementId(null);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isInteracting || !interactionStart || !selectedElementId) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const deltaPixelX = e.clientX - interactionStart.mouseX;
    const deltaPixelY = e.clientY - interactionStart.mouseY;

    const deltaPercentX = (deltaPixelX / canvas.clientWidth) * 100;
    const deltaPercentY = (deltaPixelY / canvas.clientHeight) * 100;

    const updatedElements = currentElements.map((el) => {
      if (el.id !== selectedElementId) return el;

      if (isInteracting === 'drag') {
        const newX = Math.max(5, Math.min(95, interactionStart.elementX + deltaPercentX));
        const newY = Math.max(5, Math.min(95, interactionStart.elementY + deltaPercentY));
        return { ...el, x: Math.round(newX * 10) / 10, y: Math.round(newY * 10) / 10 };
      } else if (isInteracting === 'resize') {
        const scaleDelta = (deltaPixelX + deltaPixelY) * 0.005;
        const newScale = Math.max(0.2, Math.min(3.5, interactionStart.scale + scaleDelta));
        return { ...el, scale: Math.round(newScale * 100) / 100 };
      } else if (isInteracting === 'rotate') {
        const rotDelta = Math.round(deltaPixelX * 0.8);
        return { ...el, rotation: (interactionStart.rotation + rotDelta) % 360 };
      }
      return el;
    });

    const updatedDesigns = {
      ...config.surfaceDesigns,
      [activeSurface]: updatedElements,
    };
    onChange({ ...config, surfaceDesigns: updatedDesigns });
  };

  const handleMouseUp = () => {
    setIsInteracting(null);
    setInteractionStart(null);
  };

  // Keyboard shortcut for deleting selected element
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElementId) {
        // Prevent deleting if focus is inside an input or textarea
        if (['INPUT', 'TEXTAREA'].includes((document.activeElement?.tagName || ''))) return;

        pushHistory();
        const updatedElements = currentElements.filter(el => el.id !== selectedElementId);
        const updatedDesigns = {
          ...config.surfaceDesigns,
          [activeSurface]: updatedElements,
        };
        onChange({ ...config, surfaceDesigns: updatedDesigns });
        setSelectedElementId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementId, currentElements, activeSurface, config, onChange, pushHistory]);

  const selectedElement = currentElements.find(e => e.id === selectedElementId);

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-xl">
      {/* 2D Canvas Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-200">
            2D Panel Surface Editor:
          </span>
          <span className="text-xs font-bold px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
            {surfaceMeta.name}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleUndo}
            disabled={history.length === 0}
            className="p-1.5 text-slate-400 hover:text-slate-100 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 rounded transition-colors"
            title="Undo Last Action"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleResetSurface}
            className="p-1.5 text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 rounded transition-colors"
            title="Clear All Graphics on this Surface"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Interactive Canvas Area */}
      <div
        ref={containerRef}
        className="relative flex-1 flex items-center justify-center p-4 bg-slate-950/60 overflow-hidden cursor-crosshair select-none"
      >
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="max-w-full max-h-[380px] w-auto h-auto rounded-lg shadow-2xl border border-slate-700/80 object-contain"
        />

        {currentElements.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-slate-500">
            <Move className="w-8 h-8 mb-2 opacity-40 animate-pulse" />
            <p className="text-xs font-medium">No graphics placed on this panel yet.</p>
            <p className="text-[11px] text-slate-400">Use the Left Panel to upload a Logo or add Custom Text.</p>
          </div>
        )}
      </div>

      {/* Selected Element Quick Controls Floating Bar */}
      {selectedElement && (
        <div className="flex items-center justify-between px-4 py-2 bg-slate-800/95 border-t border-slate-700 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-300">
              {selectedElement.type === 'logo' ? `Logo: ${(selectedElement as LogoElement).name}` : `Text: "${(selectedElement as TextElement).text.substring(0, 18)}..."`}
            </span>
            <span className="text-slate-400 text-[11px]">
              X: {Math.round(selectedElement.x)}% | Y: {Math.round(selectedElement.y)}% | Scale: {Math.round(selectedElement.scale * 100)}%
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const newScale = Math.min(3.0, selectedElement.scale + 0.15);
                const updatedElements = currentElements.map(e => e.id === selectedElement.id ? { ...e, scale: newScale } : e);
                onChange({ ...config, surfaceDesigns: { ...config.surfaceDesigns, [activeSurface]: updatedElements } });
              }}
              className="p-1 hover:bg-slate-700 rounded text-slate-300"
              title="Enlarge"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                const newScale = Math.max(0.3, selectedElement.scale - 0.15);
                const updatedElements = currentElements.map(e => e.id === selectedElement.id ? { ...e, scale: newScale } : e);
                onChange({ ...config, surfaceDesigns: { ...config.surfaceDesigns, [activeSurface]: updatedElements } });
              }}
              className="p-1 hover:bg-slate-700 rounded text-slate-300"
              title="Shrink"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                const newRot = ((selectedElement.rotation || 0) + 45) % 360;
                const updatedElements = currentElements.map(e => e.id === selectedElement.id ? { ...e, rotation: newRot } : e);
                onChange({ ...config, surfaceDesigns: { ...config.surfaceDesigns, [activeSurface]: updatedElements } });
              }}
              className="p-1 hover:bg-slate-700 rounded text-slate-300"
              title="Rotate 45°"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                pushHistory();
                const updatedElements = currentElements.filter(el => el.id !== selectedElementId);
                onChange({ ...config, surfaceDesigns: { ...config.surfaceDesigns, [activeSurface]: updatedElements } });
                setSelectedElementId(null);
              }}
              className="p-1 hover:bg-rose-950 text-rose-400 rounded"
              title="Delete Selected Element"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
