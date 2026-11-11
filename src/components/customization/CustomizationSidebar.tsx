import React, { useState } from 'react';
import { TentConfiguration, PrintableSurface } from '../../types/configurator';
import { PRINTABLE_SURFACES } from '../../utils/constants';
import { GeneralOptions } from './GeneralOptions';
import { ColorOptions } from './ColorOptions';
import { LogoUploader } from './LogoUploader';
import { TextEditor } from './TextEditor';
import {
  SlidersHorizontal,
  Palette,
  Sparkles,
  Layers
} from 'lucide-react';

interface CustomizationSidebarProps {
  config: TentConfiguration;
  onChange: (updated: TentConfiguration) => void;
  onOpen2DStudio?: () => void;
}

export const CustomizationSidebar: React.FC<CustomizationSidebarProps> = ({
  config,
  onChange,
  onOpen2DStudio
}) => {
  const [activeTab, setActiveTab] = useState<'model' | 'colors' | 'branding'>('model');

  const activeSurfaceMeta = PRINTABLE_SURFACES.find(s => s.id === config.activeSurface) || PRINTABLE_SURFACES[0];

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 shadow-sm overflow-hidden select-none">
      {/* Sidebar Header */}
      <div className="px-5 py-4 border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Product Configurator</h2>
            <p className="text-xs text-slate-500">Commercial Event Canopy Series</p>
          </div>
          <div className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold">
            {config.size} Pro
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-3 gap-1.5 mt-3.5 p-1 bg-slate-100/90 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('model')}
            className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'model'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-sky-600" />
            <span>Hardware</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('colors')}
            className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'colors'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Palette className="w-3.5 h-3.5 text-amber-500" />
            <span>Colors & Walls</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('branding')}
            className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'branding'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Custom Print</span>
          </button>
        </div>
      </div>

      {/* Surface Selector Bar (Active only when in branding tab) */}
      {activeTab === 'branding' && (
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
            Select Printable Tent Surface:
          </label>
          <select
            value={config.activeSurface}
            onChange={(e) => onChange({ ...config, activeSurface: e.target.value as PrintableSurface })}
            className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
          >
            {PRINTABLE_SURFACES.map((surf) => (
              <option key={surf.id} value={surf.id}>
                {surf.name} {surf.id.startsWith('wall-') && !config.walls[surf.id.replace('wall-', '') as keyof typeof config.walls]?.enabled ? '(Wall currently detached)' : ''}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-500 mt-1">{activeSurfaceMeta.description}</p>
        </div>
      )}

      {/* Scrollable Tab Content */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
        {activeTab === 'model' && <GeneralOptions config={config} onChange={onChange} />}
        {activeTab === 'colors' && <ColorOptions config={config} onChange={onChange} />}
        {activeTab === 'branding' && (
          <div className="space-y-6">
            <LogoUploader config={config} onChange={onChange} />
            <div className="border-t border-slate-200 pt-4">
              <TextEditor config={config} onChange={onChange} />
            </div>
            {onOpen2DStudio && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onOpen2DStudio}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-sky-300 bg-sky-50/80 hover:bg-sky-100 text-sky-800 text-xs font-bold transition-all shadow-sm"
                >
                  <Layers className="w-4 h-4 text-sky-600" />
                  <span>Open Interactive 2D Studio Canvas</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
