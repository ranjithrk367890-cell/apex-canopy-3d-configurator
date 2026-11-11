import React from 'react';
import { TentConfiguration, TentSize, FrameFinish } from '../../types/configurator';
import { TENT_SIZES, FRAME_FINISHES, INR_PRICING } from '../../utils/constants';
import { formatINR } from '../../utils/currency';
import { Check } from 'lucide-react';

interface GeneralOptionsProps {
  config: TentConfiguration;
  onChange: (updated: TentConfiguration) => void;
}

export const GeneralOptions: React.FC<GeneralOptionsProps> = ({ config, onChange }) => {
  return (
    <div className="space-y-6">
      {/* Tent Size Selector */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
          Canopy Footprint Size
        </label>
        <div className="grid grid-cols-1 gap-2.5">
          {TENT_SIZES.map((size) => {
            const isSelected = config.size === size.id;
            return (
              <button
                key={size.id}
                type="button"
                onClick={() => onChange({ ...config, size: size.id as TentSize })}
                className={`flex items-start justify-between p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-sky-600 bg-sky-50/70 shadow-sm ring-1 ring-sky-600'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{size.label}</span>
                    {size.id === '10x10' && (
                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-800 rounded-full">
                        Best Seller
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{size.desc}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-extrabold text-slate-900">{formatINR(size.basePrice)}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Frame Hardware Finish */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
          Hardware Frame Finish
        </label>
        <div className="grid grid-cols-3 gap-2">
          {FRAME_FINISHES.map((frame) => {
            const isSelected = config.frameFinish === frame.id;
            return (
              <button
                key={frame.id}
                type="button"
                onClick={() => onChange({ ...config, frameFinish: frame.id as FrameFinish })}
                className={`p-2.5 rounded-xl border flex flex-col items-center text-center transition-all ${
                  isSelected
                    ? 'border-sky-600 bg-sky-50 shadow-sm ring-1 ring-sky-600'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div
                  className="w-7 h-7 rounded-full border border-slate-300 shadow-inner mb-1.5 flex items-center justify-center"
                  style={{ backgroundColor: frame.hex }}
                >
                  {isSelected && <Check className="w-4 h-4 text-slate-800" />}
                </div>
                <span className="text-xs font-semibold text-slate-800">{frame.name}</span>
                <span className="text-[10px] text-slate-500 mt-0.5">
                  {frame.surcharge === 0 ? 'Included' : `+${formatINR(frame.surcharge)}`}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Accessories & Add-ons */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Field Accessories & Weight Kits
          </label>
          <span className="text-[11px] text-slate-500">Optional</span>
        </div>
        <div className="space-y-2">
          {/* Weight Plates */}
          <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer transition-colors">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={config.accessories.weightPlates}
                onChange={(e) =>
                  onChange({
                    ...config,
                    accessories: { ...config.accessories, weightPlates: e.target.checked }
                  })
                }
                className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300"
              />
              <div>
                <p className="text-xs font-bold text-slate-800">Cast-Iron Weight Plates (4-Pack)</p>
                <p className="text-[11px] text-slate-500">28 lbs anchoring ballast (renders in 3D scene)</p>
              </div>
            </div>
            <span className="text-xs font-extrabold text-slate-900">+{formatINR(INR_PRICING.accessories.weightPlates)}</span>
          </label>

          {/* Roller Bag */}
          <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer transition-colors">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={config.accessories.wheeledRollerBag}
                onChange={(e) =>
                  onChange({
                    ...config,
                    accessories: { ...config.accessories, wheeledRollerBag: e.target.checked }
                  })
                }
                className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300"
              />
              <div>
                <p className="text-xs font-bold text-slate-800">All-Terrain Wheeled Roller Bag</p>
                <p className="text-[11px] text-slate-500">Heavy-duty reinforced 1680D nylon</p>
              </div>
            </div>
            <span className="text-xs font-extrabold text-slate-900">+{formatINR(INR_PRICING.accessories.wheeledRollerBag)}</span>
          </label>

          {/* Heavy Duty Stake Kit */}
          <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer transition-colors">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={config.accessories.heavyDutyStakeKit}
                onChange={(e) =>
                  onChange({
                    ...config,
                    accessories: { ...config.accessories, heavyDutyStakeKit: e.target.checked }
                  })
                }
                className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300"
              />
              <div>
                <p className="text-xs font-bold text-slate-800">Spiral Stake & Guy Rope Kit</p>
                <p className="text-[11px] text-slate-500">High-wind outdoor tie-downs</p>
              </div>
            </div>
            <span className="text-xs font-extrabold text-slate-900">+{formatINR(INR_PRICING.accessories.heavyDutyStakeKit)}</span>
          </label>

          {/* LED Light System */}
          <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer transition-colors">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={config.accessories.ledTentLightSystem}
                onChange={(e) =>
                  onChange({
                    ...config,
                    accessories: { ...config.accessories, ledTentLightSystem: e.target.checked }
                  })
                }
                className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300"
              />
              <div>
                <p className="text-xs font-bold text-slate-800">Rechargeable LED Truss Lights</p>
                <p className="text-[11px] text-slate-500">Night market & evening event illumination</p>
              </div>
            </div>
            <span className="text-xs font-extrabold text-slate-900">+{formatINR(INR_PRICING.accessories.ledTentLightSystem)}</span>
          </label>
        </div>
      </div>
    </div>
  );
};
