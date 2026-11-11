import React, { useState } from 'react';
import { TentConfiguration, TextElement } from '../../types/configurator';
import { AVAILABLE_FONTS } from '../../utils/constants';
import { Type, Trash2, AlignLeft, AlignCenter, AlignRight, Bold, Plus } from 'lucide-react';

interface TextEditorProps {
  config: TentConfiguration;
  onChange: (updated: TentConfiguration) => void;
}

export const TextEditor: React.FC<TextEditorProps> = ({ config, onChange }) => {
  const activeSurface = config.activeSurface;
  const currentElements = config.surfaceDesigns[activeSurface] || [];
  const currentTextEl = currentElements.find(e => e.type === 'text') as TextElement | undefined;

  const [inputVal, setInputVal] = useState(currentTextEl?.text || '');

  // Add new text element if none exists on current surface
  const handleAddText = () => {
    const newText: TextElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      text: inputVal.trim() || 'YOUR BRAND SLOGAN',
      fontSize: activeSurface === 'valance-front' ? 28 : 42,
      fontFamily: 'Montserrat',
      color: '#FFFFFF',
      fontWeight: 'bold',
      textAlign: 'center',
      x: 50,
      y: activeSurface === 'valance-front' ? 50 : 75,
      rotation: 0,
      scale: 1.0,
    };

    const filtered = currentElements.filter(e => e.type !== 'text');
    const updatedDesigns = {
      ...config.surfaceDesigns,
      [activeSurface]: [...filtered, newText],
    };
    onChange({ ...config, surfaceDesigns: updatedDesigns });
  };

  const updateTextProperty = (updates: Partial<TextElement>) => {
    if (!currentTextEl) return;
    const updated = currentElements.map(e => e.id === currentTextEl.id ? { ...e, ...updates } : e);
    const updatedDesigns = {
      ...config.surfaceDesigns,
      [activeSurface]: updated,
    };
    onChange({ ...config, surfaceDesigns: updatedDesigns });
  };

  const handleRemoveText = () => {
    const filtered = currentElements.filter(e => e.type !== 'text');
    const updatedDesigns = {
      ...config.surfaceDesigns,
      [activeSurface]: filtered,
    };
    onChange({ ...config, surfaceDesigns: updatedDesigns });
    setInputVal('');
  };

  return (
    <div className="space-y-4">
      {/* If no text element exists */}
      {!currentTextEl ? (
        <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 flex flex-col items-center text-center">
          <Type className="w-8 h-8 text-slate-400 mb-2" />
          <p className="text-xs font-bold text-slate-800">Add Custom Printed Text / Slogan</p>
          <p className="text-[11px] text-slate-500 mb-3">Company name, website address, or phone number</p>
          <button
            type="button"
            onClick={handleAddText}
            className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold shadow transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Text Element
          </button>
        </div>
      ) : (
        /* Text Editor Controls */
        <div className="p-3.5 rounded-xl border border-slate-300 bg-white shadow-sm space-y-3.5">
          {/* Header & Remove */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Type className="w-4 h-4 text-sky-600" /> Custom Printed Text
            </span>
            <button
              type="button"
              onClick={handleRemoveText}
              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
              title="Remove Text"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Text Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Text Content</label>
            <input
              type="text"
              value={currentTextEl.text}
              onChange={(e) => updateTextProperty({ text: e.target.value })}
              placeholder="e.g. WWW.YOURDOMAIN.COM"
              className="w-full px-3 py-2 text-xs font-medium border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Typography Font Family Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Font Family</label>
            <select
              value={currentTextEl.fontFamily}
              onChange={(e) => updateTextProperty({ fontFamily: e.target.value })}
              className="w-full px-3 py-2 text-xs font-medium border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {AVAILABLE_FONTS.map(font => (
                <option key={font.id} value={font.id}>{font.name}</option>
              ))}
            </select>
          </div>

          {/* Font Size & Weight / Alignment Toolbar */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700">Font Size</span>
                <span className="font-bold text-sky-700">{currentTextEl.fontSize}px</span>
              </div>
              <input
                type="range"
                min="16"
                max="72"
                step="2"
                value={currentTextEl.fontSize}
                onChange={(e) => updateTextProperty({ fontSize: parseInt(e.target.value) })}
                className="w-full accent-sky-600"
              />
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-700 block mb-1">Styling</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => updateTextProperty({ fontWeight: currentTextEl.fontWeight === 'bold' ? 'normal' : 'bold' })}
                  className={`p-1.5 rounded border text-xs ${
                    currentTextEl.fontWeight === 'bold'
                      ? 'bg-sky-600 text-white border-sky-600'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                  title="Toggle Bold"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => updateTextProperty({ textAlign: 'left' })}
                  className={`p-1.5 rounded border text-xs ${
                    currentTextEl.textAlign === 'left'
                      ? 'bg-sky-600 text-white border-sky-600'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                  title="Align Left"
                >
                  <AlignLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => updateTextProperty({ textAlign: 'center' })}
                  className={`p-1.5 rounded border text-xs ${
                    currentTextEl.textAlign === 'center'
                      ? 'bg-sky-600 text-white border-sky-600'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                  title="Align Center"
                >
                  <AlignCenter className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => updateTextProperty({ textAlign: 'right' })}
                  className={`p-1.5 rounded border text-xs ${
                    currentTextEl.textAlign === 'right'
                      ? 'bg-sky-600 text-white border-sky-600'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                  title="Align Right"
                >
                  <AlignRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Text Color Swatches */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-slate-700">Text Ink Color</span>
              <span className="text-[11px] text-slate-500 font-mono">{currentTextEl.color}</span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              {[
                { hex: '#FFFFFF', name: 'White' },
                { hex: '#0F172A', name: 'Dark Slate' },
                { hex: '#EAB308', name: 'Yellow' },
                { hex: '#DC2626', name: 'Red' },
                { hex: '#38BDF8', name: 'Sky Blue' },
                { hex: '#22C55E', name: 'Green' },
                { hex: '#F97316', name: 'Orange' },
              ].map((c) => {
                const isSel = currentTextEl.color.toLowerCase() === c.hex.toLowerCase();
                return (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => updateTextProperty({ color: c.hex })}
                    className={`w-6 h-6 rounded-full border flex-shrink-0 transition-transform ${
                      isSel ? 'ring-2 ring-sky-600 scale-110 border-slate-400' : 'border-slate-300'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  />
                );
              })}
            </div>
          </div>

          {/* Position Sliders */}
          <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-100">
            <div>
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-slate-600">Vertical Height</span>
                <span className="font-semibold text-sky-700">{Math.round(currentTextEl.y)}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="90"
                step="1"
                value={currentTextEl.y}
                onChange={(e) => updateTextProperty({ y: parseInt(e.target.value) })}
                className="w-full accent-sky-600"
              />
            </div>
            <div>
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-slate-600">Horizontal Pos</span>
                <span className="font-semibold text-sky-700">{Math.round(currentTextEl.x)}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="90"
                step="1"
                value={currentTextEl.x}
                onChange={(e) => updateTextProperty({ x: parseInt(e.target.value) })}
                className="w-full accent-sky-600"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
