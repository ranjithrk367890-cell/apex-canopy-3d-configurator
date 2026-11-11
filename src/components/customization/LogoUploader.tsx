import React, { useRef, useState } from 'react';
import { TentConfiguration, LogoElement } from '../../types/configurator';
import { Upload, Trash2, AlertCircle, Check } from 'lucide-react';

interface LogoUploaderProps {
  config: TentConfiguration;
  onChange: (updated: TentConfiguration) => void;
}

const SAMPLE_LOGOS = [
  { name: 'Summit Outdoor', url: '/assets/logos/summit_outdoor.svg' },
  { name: 'TechNova Pro', url: '/assets/logos/technova.svg' },
];

export const LogoUploader: React.FC<LogoUploaderProps> = ({ config, onChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const activeSurface = config.activeSurface;
  const currentElements = config.surfaceDesigns[activeSurface] || [];
  const currentLogo = currentElements.find(e => e.type === 'logo') as LogoElement | undefined;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Validate File Format (PNG, JPG, JPEG, SVG, WebP)
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage('Invalid file format. Please upload a high-resolution PNG, JPG, or SVG.');
      return;
    }

    // 2. Validate File Size (Maximum 6MB)
    const maxSizeInBytes = 6 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      setErrorMessage(`File is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max allowed size is 6MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        const newLogo: LogoElement = {
          id: `logo-${Date.now()}`,
          type: 'logo',
          url: dataUrl,
          name: file.name,
          x: 50,
          y: activeSurface === 'valance-front' ? 50 : 55,
          width: 320,
          height: Math.round(320 / aspectRatio),
          aspectRatio,
          rotation: 0,
          scale: 1.0,
          opacity: 1.0,
        };

        // Replace any existing logo on this surface with the new one
        const filteredElements = currentElements.filter(e => e.type !== 'logo');
        const updatedDesigns = {
          ...config.surfaceDesigns,
          [activeSurface]: [...filteredElements, newLogo],
        };
        onChange({ ...config, surfaceDesigns: updatedDesigns });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    // Reset file input so re-uploading the same file triggers change
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleLoadSample = (sample: typeof SAMPLE_LOGOS[0]) => {
    setErrorMessage(null);
    const newLogo: LogoElement = {
      id: `logo-${Date.now()}`,
      type: 'logo',
      url: sample.url,
      name: sample.name,
      x: 50,
      y: activeSurface === 'valance-front' ? 50 : 55,
      width: 320,
      height: 128,
      aspectRatio: 2.5,
      rotation: 0,
      scale: 1.0,
      opacity: 1.0,
    };

    const filteredElements = currentElements.filter(e => e.type !== 'logo');
    const updatedDesigns = {
      ...config.surfaceDesigns,
      [activeSurface]: [...filteredElements, newLogo],
    };
    onChange({ ...config, surfaceDesigns: updatedDesigns });
  };

  const handleRemoveLogo = () => {
    const updatedElements = currentElements.filter(e => e.type !== 'logo');
    const updatedDesigns = {
      ...config.surfaceDesigns,
      [activeSurface]: updatedElements,
    };
    onChange({ ...config, surfaceDesigns: updatedDesigns });
  };

  const updateLogoProperty = (updates: Partial<LogoElement>) => {
    if (!currentLogo) return;
    const updatedElements = currentElements.map(e => (e.id === currentLogo.id ? { ...e, ...updates } : e));
    const updatedDesigns = {
      ...config.surfaceDesigns,
      [activeSurface]: updatedElements,
    };
    onChange({ ...config, surfaceDesigns: updatedDesigns });
  };

  return (
    <div className="space-y-4">
      {/* Upload Box */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
          Upload Custom Vector or Raster Logo
        </label>
        <div
          onClick={() => fileInputRef.current?.click()}
          className="p-5 border-2 border-dashed border-slate-300 hover:border-sky-500 rounded-xl bg-slate-50 hover:bg-sky-50/40 cursor-pointer flex flex-col items-center justify-center text-center transition-all group"
        >
          <Upload className="w-8 h-8 text-slate-400 group-hover:text-sky-600 mb-2 transition-colors" />
          <p className="text-xs font-bold text-slate-800">
            Click to upload your logo file
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            PNG, JPG, or SVG • Up to 6MB
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {errorMessage && (
          <div className="flex items-center gap-2 mt-2 p-2.5 rounded-lg bg-rose-50 text-rose-700 text-xs border border-rose-200">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Preset Sample Logos */}
      <div>
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
          Or try sample logos:
        </span>
        <div className="grid grid-cols-2 gap-2">
          {SAMPLE_LOGOS.map((sample) => (
            <button
              key={sample.name}
              type="button"
              onClick={() => handleLoadSample(sample)}
              className="px-3 py-2 rounded-lg border border-slate-200 bg-white hover:border-sky-500 hover:bg-sky-50/50 text-xs font-semibold text-slate-700 text-left transition-colors flex items-center justify-between"
            >
              <span>{sample.name}</span>
              <Check className="w-3.5 h-3.5 text-sky-600 opacity-60" />
            </button>
          ))}
        </div>
      </div>

      {/* Uploaded Logo Controls & Adjustments */}
      {currentLogo && (
        <div className="p-3.5 rounded-xl border border-slate-300 bg-white shadow-sm space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-lg border border-slate-200 bg-slate-900 p-1 flex items-center justify-center overflow-hidden">
                <img src={currentLogo.url} alt={currentLogo.name} className="max-w-full max-h-full object-contain" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 truncate max-w-[170px]">{currentLogo.name}</p>
                <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                  <Check className="w-3 h-3" /> Applied to 3D surface
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRemoveLogo}
              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
              title="Remove Logo"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Logo Scale Slider */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-slate-700">Logo Scale</span>
              <span className="font-bold text-sky-700">{Math.round(currentLogo.scale * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.3"
              max="2.5"
              step="0.05"
              value={currentLogo.scale}
              onChange={(e) => updateLogoProperty({ scale: parseFloat(e.target.value) })}
              className="w-full accent-sky-600"
            />
          </div>

          {/* Logo Vertical Position Slider */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-slate-700">Vertical Height</span>
              <span className="font-bold text-sky-700">{Math.round(currentLogo.y)}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="90"
              step="1"
              value={currentLogo.y}
              onChange={(e) => updateLogoProperty({ y: parseInt(e.target.value) })}
              className="w-full accent-sky-600"
            />
          </div>

          {/* Logo Horizontal Position Slider */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-slate-700">Horizontal Alignment</span>
              <span className="font-bold text-sky-700">{Math.round(currentLogo.x)}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="90"
              step="1"
              value={currentLogo.x}
              onChange={(e) => updateLogoProperty({ x: parseInt(e.target.value) })}
              className="w-full accent-sky-600"
            />
          </div>
        </div>
      )}
    </div>
  );
};
