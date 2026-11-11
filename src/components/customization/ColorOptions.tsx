import React from 'react';
import { TentConfiguration, WallStyle } from '../../types/configurator';
import { COLOR_PALETTE, INR_PRICING } from '../../utils/constants';
import { formatINR } from '../../utils/currency';
import { Check, Eye, EyeOff } from 'lucide-react';

interface ColorOptionsProps {
  config: TentConfiguration;
  onChange: (updated: TentConfiguration) => void;
}

export const ColorOptions: React.FC<ColorOptionsProps> = ({ config, onChange }) => {
  const wallSides: Array<{ id: keyof typeof config.walls; name: string; positionDesc: string }> = [
    { id: 'back', name: 'Back Wall', positionDesc: 'Primary 10ft backdrop behind booth' },
    { id: 'left', name: 'Left Wall', positionDesc: 'Side partition' },
    { id: 'right', name: 'Right Wall', positionDesc: 'Side partition' },
    { id: 'front', name: 'Front Wall', positionDesc: 'Optional zippered enclosure' },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Canopy Roof Fabric Color */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Canopy Roof Fabric Color
          </label>
          <span className="text-xs font-semibold text-sky-700">{config.roofColorName}</span>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {COLOR_PALETTE.map((color) => {
            const isSelected = config.roofColor.toLowerCase() === color.hex.toLowerCase();
            return (
              <button
                key={color.hex}
                type="button"
                onClick={() => {
                  onChange({
                    ...config,
                    roofColor: color.hex,
                    roofColorName: color.name,
                    valanceColor: config.matchValanceColor ? color.hex : config.valanceColor,
                  });
                }}
                className={`group relative h-9 rounded-xl border flex items-center justify-center transition-all ${
                  isSelected ? 'border-sky-600 scale-105 shadow-md ring-2 ring-sky-600' : 'border-slate-300 hover:scale-105'
                }`}
                style={{ backgroundColor: color.hex }}
                title={`${color.name} (${color.hex})`}
              >
                {isSelected && (
                  <Check className={`w-4 h-4 ${color.isDark ? 'text-white' : 'text-slate-900'}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Valance Border Drop Trim */}
      <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70">
        <div className="flex items-center justify-between mb-2.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Valance Drop Border
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={config.matchValanceColor}
              onChange={(e) => {
                const match = e.target.checked;
                onChange({
                  ...config,
                  matchValanceColor: match,
                  valanceColor: match ? config.roofColor : config.valanceColor,
                });
              }}
              className="w-3.5 h-3.5 rounded text-sky-600 border-slate-300"
            />
            <span className="text-[11px] font-medium text-slate-600">Match Roof Color</span>
          </label>
        </div>

        {!config.matchValanceColor && (
          <div className="grid grid-cols-5 gap-2 mt-2 pt-2 border-t border-slate-200">
            {COLOR_PALETTE.map((color) => {
              const isSelected = config.valanceColor.toLowerCase() === color.hex.toLowerCase();
              return (
                <button
                  key={color.hex}
                  type="button"
                  onClick={() => onChange({ ...config, valanceColor: color.hex })}
                  className={`h-8 rounded-lg border flex items-center justify-center transition-all ${
                    isSelected ? 'border-sky-600 ring-2 ring-sky-600 scale-105' : 'border-slate-300'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={`Valance: ${color.name}`}
                >
                  {isSelected && (
                    <Check className={`w-3.5 h-3.5 ${color.isDark ? 'text-white' : 'text-slate-900'}`} />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Modular Sidewalls (Individual Customization & Visibility) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Modular Sidewalls & Enclosures
          </label>
          <span className="text-[11px] text-slate-500">Individual Paneling</span>
        </div>

        <div className="space-y-3">
          {wallSides.map(({ id, name, positionDesc }) => {
            const wall = config.walls[id];
            return (
              <div
                key={id}
                className={`p-3 rounded-xl border transition-all ${
                  wall.enabled
                    ? 'border-slate-300 bg-white shadow-sm'
                    : 'border-slate-200 bg-slate-50/60 opacity-80'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const updated = {
                          ...config,
                          walls: {
                            ...config.walls,
                            [id]: { ...wall, enabled: !wall.enabled },
                          },
                        };
                        onChange(updated);
                      }}
                      className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                        wall.enabled
                          ? 'bg-sky-100 text-sky-800 hover:bg-sky-200'
                          : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                      }`}
                    >
                      {wall.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      <span>{wall.enabled ? 'Installed' : 'Detached'}</span>
                    </button>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{name}</p>
                      <p className="text-[10px] text-slate-500">{positionDesc}</p>
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-slate-700">
                    {wall.enabled
                      ? (wall.style === 'door'
                          ? `+${formatINR(INR_PRICING.walls.door)}`
                          : wall.style === 'window'
                          ? `+${formatINR(INR_PRICING.walls.window)}`
                          : `+${formatINR(INR_PRICING.walls.solid)}`)
                      : 'No Cost'}
                  </span>
                </div>

                {wall.enabled && (
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    {/* Wall Style Selector */}
                    <div>
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                        Panel Style:
                      </span>
                      <div className="grid grid-cols-3 gap-1.5">
                        {(['solid', 'window', 'door'] as WallStyle[]).map((style) => (
                          <button
                            key={style}
                            type="button"
                            onClick={() => {
                              onChange({
                                ...config,
                                walls: {
                                  ...config.walls,
                                  [id]: { ...wall, style },
                                },
                              });
                            }}
                            className={`py-1 px-1.5 text-[11px] font-semibold rounded-lg border text-center capitalize transition-all ${
                              wall.style === style
                                ? 'bg-sky-600 text-white border-sky-600'
                                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                            }`}
                          >
                            {style === 'window' ? 'Cathedral' : style === 'door' ? 'Zip Door' : 'Solid'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Wall Fabric Color Swatches */}
                    <div>
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                        Fabric Color:
                      </span>
                      <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                        {COLOR_PALETTE.map((color) => {
                          const isSel = wall.color.toLowerCase() === color.hex.toLowerCase();
                          return (
                            <button
                              key={color.hex}
                              type="button"
                              onClick={() => {
                                onChange({
                                  ...config,
                                  walls: {
                                    ...config.walls,
                                    [id]: { ...wall, color: color.hex },
                                  },
                                });
                              }}
                              className={`w-6 h-6 rounded-full border flex-shrink-0 transition-transform ${
                                isSel ? 'ring-2 ring-sky-600 scale-110 border-white' : 'border-slate-300'
                              }`}
                              style={{ backgroundColor: color.hex }}
                              title={color.name}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
