import React, { useState, useMemo } from 'react';
import { PluginItem, AudioDNA } from '../types/atlas';
import { Database, Search, Filter, Plus, Sparkles, Tag, Sliders, Check, Copy, Download, Layers, Shield } from 'lucide-react';

interface PluginsCatalogViewProps {
  inventory: PluginItem[];
  setInventory: React.Dispatch<React.SetStateAction<PluginItem[]>>;
  currentDNA: AudioDNA;
  onSelectPluginForPlan?: (plugin: PluginItem) => void;
}

export const PluginsCatalogView: React.FC<PluginsCatalogViewProps> = ({
  inventory,
  setInventory,
  currentDNA
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSaturation, setSelectedSaturation] = useState<string>('all');
  const [copied, setCopied] = useState(false);
  const [isAddingPlugin, setIsAddingPlugin] = useState(false);

  // New plugin form state
  const [newPluginName, setNewPluginName] = useState('');
  const [newManufacturer, setNewManufacturer] = useState('');
  const [newCategory, setNewCategory] = useState<PluginItem['category']>('EQ');
  const [newRole, setNewRole] = useState('Custom_Device');
  const [newSaturation, setNewSaturation] = useState<PluginItem['saturation_type']>('Tube');
  const [newTimbre, setNewTimbre] = useState<PluginItem['timbral_curve']>('Bright Air');
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetDesc, setNewPresetDesc] = useState('');

  // Calculate semantic relevance / RAG matching score based on active Audio DNA
  const pluginsWithRAGScore = useMemo(() => {
    return inventory.map((plugin) => {
      let score = 50; // base score

      const timbre = currentDNA.vocal_profile.timbre;
      const isDark = currentDNA.vocal_profile.air_10khz_db < 0 || timbre === 'dark';
      const isDynamic = currentDNA.vocal_profile.dynamic_range_db > 14;
      const isMuddy = currentDNA.vocal_profile.mud_300hz_db > 1.5;
      const isSibilant = currentDNA.vocal_profile.sibilance_score > 40;

      if (isDark && (plugin.role === 'Pultec_EQ' || plugin.timbral_curve === 'Bright Air' || plugin.saturation_type === 'Tube')) {
        score += 42;
      }
      if (isDynamic && (plugin.role === 'SSL_Compressor' || plugin.saturation_type === 'Solid State / VCA' || plugin.role === 'FET_1176_Compressor')) {
        score += 38;
      }
      if (isMuddy && (plugin.role === 'Subtractive_EQ' || plugin.tags.includes('mud_removal'))) {
        score += 40;
      }
      if (isSibilant && (plugin.role === 'DeEsser' || plugin.tags.includes('sibilance'))) {
        score += 44;
      }

      // Stems matching
      if (currentDNA.stems.some(s => s.category === 'bass') && plugin.name.includes('Vital')) {
        score += 30;
      }
      if (currentDNA.stems.some(s => s.category === 'pad') && plugin.name.includes('Analog Lab')) {
        score += 30;
      }

      return {
        ...plugin,
        ragScore: Math.min(99, score)
      };
    });
  }, [inventory, currentDNA]);

  // Filtered list
  const filteredPlugins = useMemo(() => {
    return pluginsWithRAGScore.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
      const matchesSat = selectedSaturation === 'all' || p.saturation_type === selectedSaturation;

      return matchesSearch && matchesCat && matchesSat;
    }).sort((a, b) => b.ragScore - a.ragScore);
  }, [pluginsWithRAGScore, searchTerm, selectedCategory, selectedSaturation]);

  const copyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(inventory, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(inventory, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "plugins_inventory.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleAddPlugin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPluginName.trim()) return;

    const newItem: PluginItem = {
      id: `plg_${Date.now()}`,
      name: newPluginName,
      manufacturer: newManufacturer || 'Studio Hardware / VST',
      category: newCategory,
      role: newRole,
      saturation_type: newSaturation,
      timbral_curve: newTimbre,
      tags: [newRole.toLowerCase(), newCategory.toLowerCase(), newSaturation.toLowerCase().replace(/\s+/g, '_')],
      description: `Dispositivo cargado por el usuario con rol de ${newRole}.`,
      color_accent: '#06b6d4',
      presets: newPresetName ? [
        {
          name: newPresetName,
          suitable_for: 'Producción vocal / stems',
          timbral_flavor: newTimbre,
          description: newPresetDesc || 'Ajustes calibrados de producción'
        }
      ] : []
    };

    setInventory([...inventory, newItem]);
    setIsAddingPlugin(false);
    setNewPluginName('');
    setNewManufacturer('');
    setNewPresetName('');
    setNewPresetDesc('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-900/90 to-neutral-950 border border-neutral-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-mono text-xs border border-indigo-500/30 flex items-center gap-1.5">
                <Database className="w-3 h-3" />
                ENTRADA 2: plugins_inventory.json
              </div>
              <span className="text-xs text-neutral-400">Catálogo Vectorizado de Plugins & Presets</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1 font-['Space_Grotesk']">
              Inventario de Plugins, Modelado Tímbrico & Presets
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              El agente RAG compara la huella de <span className="text-cyan-400 font-mono">audio_dna.json</span> contra este catálogo para seleccionar la cadena de efectos exacta (Pultec, SSL, Pro-Q, Vital, Analog Lab V).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddingPlugin(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold text-xs rounded-lg shadow-md shadow-cyan-500/20 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Añadir Plugin / Preset
            </button>

            <button
              onClick={copyJson}
              className="flex items-center gap-1 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs font-mono transition-colors"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copiado' : 'Copiar JSON'}
            </button>

            <button
              onClick={downloadJson}
              className="flex items-center gap-1 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs font-mono transition-colors"
            >
              <Download className="w-3 h-3" />
              Descargar
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-4 pt-4 border-t border-neutral-800 flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por nombre, rol (SSL, Pultec, Vital), tag, saturación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-neutral-500" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-neutral-950 text-neutral-300 font-mono text-xs px-2.5 py-1.5 rounded-lg border border-neutral-800 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">Todas las Categorías</option>
              <option value="EQ">Equalizers (EQ)</option>
              <option value="Compressor">Compressors (VCA/FET/Opto)</option>
              <option value="DeEsser">De-Essers</option>
              <option value="Saturator">Saturators (Tube/Tape)</option>
              <option value="Synth">Synthesizers & Presets</option>
              <option value="Reverb">Reverbs & Spaces</option>
            </select>
          </div>

          {/* Saturation Filter */}
          <select
            value={selectedSaturation}
            onChange={(e) => setSelectedSaturation(e.target.value)}
            className="bg-neutral-950 text-neutral-300 font-mono text-xs px-2.5 py-1.5 rounded-lg border border-neutral-800 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">Todo Tipo de Saturación</option>
            <option value="Tube">Tube (Válvulas cálidas)</option>
            <option value="Solid State / VCA">Solid State / VCA</option>
            <option value="FET 1176">FET 1176 (Agresivo)</option>
            <option value="Opto LA-2A">Opto LA-2A (Suave)</option>
            <option value="Digital Precision">Digital Precision (Limpio)</option>
          </select>
        </div>
      </div>

      {/* Plugin Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPlugins.map((plugin) => (
          <div
            key={plugin.id}
            className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 hover:border-neutral-700 transition-all flex flex-col justify-between group"
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono text-neutral-500 block">{plugin.manufacturer}</span>
                  <h3 className="font-bold text-white text-sm group-hover:text-cyan-400 transition-colors">
                    {plugin.name}
                  </h3>
                </div>
                {/* RAG Vector Score Badge */}
                <div
                  title="Similitud semántica vectorial RAG con el Audio DNA actual"
                  className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                    plugin.ragScore > 80
                      ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                      : plugin.ragScore > 65
                      ? 'bg-cyan-950/80 text-cyan-400 border border-cyan-800'
                      : 'bg-neutral-950 text-neutral-500 border border-neutral-800'
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  <span>RAG Match: {plugin.ragScore}%</span>
                </div>
              </div>

              {/* Roles & Saturation Badges */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-neutral-950 text-neutral-300 border border-neutral-800">
                  Rol: <strong className="text-white">{plugin.role}</strong>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-amber-950/40 text-amber-300 border border-amber-800/40">
                  Saturación: {plugin.saturation_type}
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-cyan-950/40 text-cyan-300 border border-cyan-800/40">
                  Timbre: {plugin.timbral_curve}
                </span>
              </div>

              <p className="text-neutral-400 text-xs mt-2.5 leading-relaxed">
                {plugin.description}
              </p>

              {/* Presets List */}
              {plugin.presets && plugin.presets.length > 0 && (
                <div className="mt-3 pt-3 border-t border-neutral-800/80 space-y-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 block">
                    Presets Calibrados ({plugin.presets.length}):
                  </span>
                  {plugin.presets.map((preset, pIdx) => (
                    <div
                      key={pIdx}
                      className="bg-neutral-950/80 border border-neutral-800 rounded p-2 text-xs"
                    >
                      <div className="flex items-center justify-between font-mono">
                        <span className="font-semibold text-cyan-300 text-[11px]">{preset.name}</span>
                        <span className="text-[9px] text-neutral-500">{preset.timbral_flavor}</span>
                      </div>
                      <p className="text-neutral-400 text-[11px] mt-0.5">{preset.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer tags */}
            <div className="mt-3 pt-2 border-t border-neutral-800/60 flex flex-wrap gap-1">
              {plugin.tags.map((tag, tIdx) => (
                <span key={tIdx} className="text-[9px] font-mono text-neutral-500 bg-neutral-950 px-1.5 py-0.5 rounded">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add Plugin */}
      {isAddingPlugin && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
                <Plus className="w-4 h-4 text-cyan-400" />
                Añadir Nuevo Plugin / Preset al Catálogo
              </h3>
              <button
                onClick={() => setIsAddingPlugin(false)}
                className="text-neutral-400 hover:text-white text-xs font-mono"
              >
                ✕ Cerrar
              </button>
            </div>

            <form onSubmit={handleAddPlugin} className="space-y-3 text-xs font-mono">
              <div>
                <label className="block text-neutral-400 mb-1">Nombre del Plugin</label>
                <input
                  type="text"
                  required
                  placeholder="ej. UAD Fairchild 670, Serum, soothe2..."
                  value={newPluginName}
                  onChange={(e) => setNewPluginName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Fabricante</label>
                  <input
                    type="text"
                    placeholder="ej. UAD, Waves, FabFilter"
                    value={newManufacturer}
                    onChange={(e) => setNewManufacturer(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">Rol Clave</label>
                  <input
                    type="text"
                    required
                    placeholder="ej. Pultec_EQ, SSL_Compressor"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Tipo de Saturación</label>
                  <select
                    value={newSaturation}
                    onChange={(e) => setNewSaturation(e.target.value as any)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-neutral-200"
                  >
                    <option value="Tube">Tube (Válvula)</option>
                    <option value="Solid State / VCA">Solid State / VCA</option>
                    <option value="FET 1176">FET 1176</option>
                    <option value="Opto LA-2A">Opto LA-2A</option>
                    <option value="Tape">Tape (Cinta)</option>
                    <option value="Digital Precision">Digital Precision</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">Curva Tímbrica</label>
                  <select
                    value={newTimbre}
                    onChange={(e) => setNewTimbre(e.target.value as any)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-neutral-200"
                  >
                    <option value="Bright Air">Bright Air (Agudos sedosos)</option>
                    <option value="Warm Low-Mid">Warm Low-Mid</option>
                    <option value="Aggressive Punch">Aggressive Punch</option>
                    <option value="Transparent Surgical">Transparent Surgical</option>
                    <option value="Silky Highs">Silky Highs</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-800">
                <label className="block text-neutral-400 mb-1">Preset Principal (Opcional)</label>
                <input
                  type="text"
                  placeholder="Nombre del preset (ej. Silk Top End 12kHz)"
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500 mb-2"
                />
                <input
                  type="text"
                  placeholder="Descripción de la acción (ej. Boost 10kHz +3dB)"
                  value={newPresetDesc}
                  onChange={(e) => setNewPresetDesc(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddingPlugin(false)}
                  className="px-4 py-2 rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold"
                >
                  Guardar en Inventario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
