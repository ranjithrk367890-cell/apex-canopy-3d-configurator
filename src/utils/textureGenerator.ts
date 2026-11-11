import * as THREE from 'three';
import { TentConfiguration, PrintableSurface, LogoElement, TextElement } from '../types/configurator';

// In-memory image element cache to prevent reloading during live drag updates
const imageCache = new Map<string, HTMLImageElement>();

export function preloadImage(url: string): Promise<HTMLImageElement> {
  if (imageCache.has(url)) {
    return Promise.resolve(imageCache.get(url)!);
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageCache.set(url, img);
      resolve(img);
    };
    img.onerror = (e) => {
      console.warn('Failed to load image for canvas texture:', url, e);
      reject(e);
    };
    img.src = url;
  });
}

// Surface canvas dimensions
const SURFACE_DIMENSIONS: Record<PrintableSurface, { width: number; height: number }> = {
  'roof-front': { width: 1024, height: 1024 },
  'valance-front': { width: 2048, height: 384 },
  'wall-back': { width: 1024, height: 768 },
  'wall-left': { width: 1024, height: 768 },
  'wall-right': { width: 1024, height: 768 },
  'wall-front': { width: 1024, height: 768 },
};

/**
 * Draws the high-resolution canvas for a specific tent surface
 */
export async function renderSurfaceToCanvas(
  surfaceId: PrintableSurface,
  config: TentConfiguration,
  targetCanvas?: HTMLCanvasElement
): Promise<HTMLCanvasElement> {
  const { width, height } = SURFACE_DIMENSIONS[surfaceId];
  const canvas = targetCanvas || document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // 1. Determine background color based on surface
  let bgColor = config.roofColor;
  if (surfaceId === 'valance-front') {
    bgColor = config.matchValanceColor ? config.roofColor : config.valanceColor;
  } else if (surfaceId.startsWith('wall-')) {
    const wallKey = surfaceId.replace('wall-', '') as keyof typeof config.walls;
    bgColor = config.walls[wallKey]?.color || '#F8FAFC';
  }

  // Clear & Fill Base Fabric
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);

  // Subtle fabric texture overlay (simulated woven polyester)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.025)';
  for (let i = 0; i < width; i += 4) {
    ctx.fillRect(i, 0, 1.5, height);
  }
  for (let j = 0; j < height; j += 4) {
    ctx.fillRect(0, j, width, 1.5);
  }

  // 2. Surface-specific architectural overlays (Windows, Doors, Seams)
  if (surfaceId.startsWith('wall-')) {
    const wallKey = surfaceId.replace('wall-', '') as keyof typeof config.walls;
    const wallStyle = config.walls[wallKey]?.style || 'solid';

    if (wallStyle === 'window') {
      // Draw 3 cathedral arched windows with semi-transparent tinted glass
      const winCount = 3;
      const winWidth = 180;
      const winHeight = 320;
      const spacing = (width - winCount * winWidth) / (winCount + 1);
      const topY = 160;

      for (let w = 0; w < winCount; w++) {
        const wx = spacing + w * (winWidth + spacing);

        // Window Frame
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#CBD5E1';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.roundRect(wx, topY, winWidth, winHeight, [winWidth / 2, winWidth / 2, 8, 8]);
        ctx.fill();
        ctx.stroke();

        // Clear glass pane simulation
        ctx.fillStyle = 'rgba(219, 234, 254, 0.45)';
        ctx.beginPath();
        ctx.roundRect(wx + 8, topY + 8, winWidth - 16, winHeight - 16, [winWidth / 2 - 8, winWidth / 2 - 8, 4, 4]);
        ctx.fill();

        // Window Mullion Grids
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 4;
        // Horizontal bar
        ctx.beginPath();
        ctx.moveTo(wx + 8, topY + winHeight * 0.55);
        ctx.lineTo(wx + winWidth - 8, topY + winHeight * 0.55);
        ctx.stroke();
        // Vertical bar
        ctx.beginPath();
        ctx.moveTo(wx + winWidth / 2, topY + 16);
        ctx.lineTo(wx + winWidth / 2, topY + winHeight - 8);
        ctx.stroke();
      }
    } else if (wallStyle === 'door') {
      // Draw zippered doorway opening
      const doorWidth = 380;
      const doorX = (width - doorWidth) / 2;
      const doorY = 60;

      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 4;
      ctx.setLineDash([8, 8]);
      // Left zipper seam
      ctx.beginPath();
      ctx.moveTo(doorX, doorY);
      ctx.lineTo(doorX, height);
      ctx.stroke();
      // Right zipper seam
      ctx.beginPath();
      ctx.moveTo(doorX + doorWidth, doorY);
      ctx.lineTo(doorX + doorWidth, height);
      ctx.stroke();
      ctx.setLineDash([]);

      // Roll up strap holders at top
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(doorX + 50, doorY - 14, 30, 24);
      ctx.fillRect(doorX + doorWidth - 80, doorY - 14, 30, 24);
    }
  }

  // 3. Render Custom Design Elements (Logos & Text)
  const elements = config.surfaceDesigns[surfaceId] || [];

  for (const element of elements) {
    ctx.save();

    // Map percentage (0-100) to actual canvas coordinates
    const posX = (element.x / 100) * width;
    const posY = (element.y / 100) * height;

    ctx.translate(posX, posY);
    if (element.rotation) {
      ctx.rotate((element.rotation * Math.PI) / 180);
    }

    if (element.type === 'logo') {
      const logo = element as LogoElement;
      ctx.globalAlpha = logo.opacity ?? 1.0;

      const drawW = logo.width * logo.scale;
      const drawH = logo.height * logo.scale;

      try {
        let img = imageCache.get(logo.url);
        if (!img) {
          img = await preloadImage(logo.url);
        }
        ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      } catch (err) {
        // Fallback placeholder box
        ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
        ctx.fillRect(-drawW / 2, -drawH / 2, drawW, drawH);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '14px sans-serif';
        ctx.fillText('Logo Error', -30, 5);
      }
    } else if (element.type === 'text') {
      const textEl = element as TextElement;
      const effectiveFontSize = textEl.fontSize * textEl.scale;

      ctx.font = `${textEl.fontWeight === 'bold' ? 'bold ' : textEl.fontWeight === '800' ? '800 ' : ''}${effectiveFontSize}px ${textEl.fontFamily}`;
      ctx.fillStyle = textEl.color;
      ctx.textAlign = textEl.textAlign || 'center';
      ctx.textBaseline = 'middle';

      // Subtle shadow for legibility on colored fabrics
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 2;

      ctx.fillText(textEl.text, 0, 0);
    }

    ctx.restore();
  }

  return canvas;
}

/**
 * Creates a THREE.CanvasTexture synchronized with a printable surface
 */
export async function createSurfaceCanvasTexture(
  surfaceId: PrintableSurface,
  config: TentConfiguration,
  existingTexture?: THREE.CanvasTexture
): Promise<THREE.CanvasTexture> {
  const canvas = existingTexture ? (existingTexture.image as HTMLCanvasElement) : document.createElement('canvas');
  await renderSurfaceToCanvas(surfaceId, config, canvas);

  let texture: THREE.CanvasTexture;
  if (existingTexture) {
    texture = existingTexture;
    texture.needsUpdate = true;
  } else {
    texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
  }

  return texture;
}
