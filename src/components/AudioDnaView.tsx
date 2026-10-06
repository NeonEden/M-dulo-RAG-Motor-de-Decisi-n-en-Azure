import React, { useRef, useState, useMemo } from 'react';
import { AudioDNA } from '../types/atlas';
import { DEFAULT_AUDIO_DNA_PRESETS } from '../data/defaultData';
import { extractAudioDNAFromFile } from '../utils/audioEngine';
import {
  Activity,
  Upload,
  Disc,
  Sparkles,
  Copy,
  Check,
  Download,
  Zap,
  ShieldCheck,
  TrendingUp,
  BarChart3,
  Waves
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend
} from 'recharts';

interface AudioDnaViewProps {
  dna: AudioDNA;
  setDna: (dna: AudioDNA) => void;
  onExecuteRAG: () => void;
}

export const AudioDnaView: React.FC<AudioDnaViewProps> = ({
  dna,
  setDna,
  onExecuteRAG
}) => {
  const [copied, setCopied] = useState(false);
  const [isAnalyzingAudio, setIsAnalyzingAudio] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState<string | null>(null);
  const [chartMode, setChartMode] = useState<'spectrum' | 'radar'>('spectrum');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);

  const copyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(dna, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dna, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "audio_dna.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsAnalyzingAudio(true);
      setAnalysisStatus(`Analizando espectro acústico y crest factor de '${file.name}'...`);
      const extracted = await extractAudioDNAFromFile(file);

      const updatedDNA: AudioDNA = {
        ...dna,
        track_title: file.name.replace(/\.[^/.]+$/, ""),
        vocal_profile: {
          ...dna.vocal_profile,
          timbre: extracted.timbre,
          dynamic_range_db: extracted.dynamic_range_db,
          crest_factor: extracted.crest_factor,
          sibilance_score: extracted.sibilance_score,
          mud_300hz_db: extracted.mud_300hz_db,
          air_10khz_db: extracted.air_10khz_db,
        },
        overall_lufs: extracted.lufs_integrated,
      };

      setDna(updatedDNA);
      setAnalysisStatus(`¡Extracción completada! Dinámica: ${extracted.dynamic_range_db}dB, Sibilancia: ${extracted.sibilance_score}/100.`);
      setTimeout(() => setAnalysisStatus(null), 4000);
    } catch (err) {
      console.error(err);
      setAnalysisStatus("Error analizando el archivo de audio. Asegúrate de que sea WAV/MP3 válido.");
    } finally {
      setIsAnalyzingAudio(false);
    }
  };

  const handleJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        setDna(parsed);
      } catch {
        alert("Archivo JSON inválido.");
      }
    };
    reader.readAsText(file);
  };

  const updateVocalField = (field: keyof AudioDNA['vocal_profile'], value: any) => {
    setDna({
      ...dna,
      vocal_profile: {
        ...dna.vocal_profile,
        [field]: value
      }
    });
  };

  // 1. Calculate Spectral Curve data points for Recharts AreaChart
  const spectralData = useMemo(() => {
    const mud = dna.vocal_profile.mud_300hz_db || 0;
    const air = dna.vocal_profile.air_10khz_db || 0;
    const sibilance = (dna.vocal_profile.sibilance_score - 50) / 10;
    const mid = dna.vocal_profile.mid_energy_db || 0;

    return [
      { freq: '30 Hz', band: 'Sub Bass', currentDb: -0.5, targetDb: 0, delta: 0.5, info: 'Corte pasa-altos HPF' },
      { freq: '80 Hz', band: 'Bass Fundamental', currentDb: 0.8, targetDb: 0, delta: -0.8, info: 'Cuerpo vocal / Bombo' },
      { freq: '300 Hz', band: 'Mud / Boxiness', currentDb: mud, targetDb: 0, delta: -mud, info: 'Resonancia caja (Pro-Q 3 Cut)' },
      { freq: '1 kHz', band: 'Mid Body', currentDb: mid, targetDb: 0, delta: -mid, info: 'Presencia inteligible' },
      { freq: '3.5 kHz', band: 'Aggressive Bite', currentDb: dna.vocal_profile.timbre === 'harsh' ? 3.8 : 0.2, targetDb: 0, delta: -1.0, info: 'Ataque consonantes' },
      { freq: '6.5 kHz', band: 'Sibilance S/T', currentDb: sibilance, targetDb: 0, delta: -sibilance, info: 'Frecuencia sibilante (De-Esser)' },
      { freq: '10 kHz', band: 'Air Band', currentDb: air, targetDb: 3.0, delta: 3.0 - air, info: 'Apertura de agudos (Pultec EQP-1A)' },
      { freq: '16 kHz', band: 'Silk Sheen', currentDb: Math.round(air * 0.8 * 10) / 10, targetDb: 2.0, delta: 2.0 - air * 0.8, info: 'Brillo caro y moderno' },
    ];
  }, [dna]);

  // 2. Calculate Radar Chart data points for Recharts RadarChart
  const radarData = useMemo(() => {
    const vp = dna.vocal_profile;
    return [
      {
        metric: 'Rango Dinámico (Crest)',
        detected: Math.min(100, Math.max(10, (vp.dynamic_range_db / 24) * 100)),
        target: 65,
        fullMark: 100,
      },
      {
        metric: 'Brillo / Aire (10kHz)',
        detected: Math.min(100, Math.max(10, ((vp.air_10khz_db + 8) / 14) * 100)),
        target: 85,
        fullMark: 100,
      },
      {
        metric: 'Claridad 300Hz (Clean)',
        detected: Math.min(100, Math.max(10, ((6 - vp.mud_300hz_db) / 10) * 100)),
        target: 80,
        fullMark: 100,
      },
      {
        metric: 'Control Sibilancia',
        detected: Math.min(100, Math.max(10, 100 - vp.sibilance_score)),
        target: 75,
        fullMark: 100,
      },
      {
        metric: 'Intensidad LUFS',
        detected: Math.min(100, Math.max(10, ((dna.overall_lufs + 24) / 18) * 100)),
        target: 70,
        fullMark: 100,
      },
      {
        metric: 'Velocidad Transiente',
        detected: vp.transient_speed === 'fast' ? 90 : vp.transient_speed === 'moderate' ? 60 : 35,
        target: 75,
        fullMark: 100,
      },
    ];
  }, [dna]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Preset Selector */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-900/90 to-neutral-950 border border-neutral-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-mono text-xs border border-cyan-500/30 flex items-center gap-1.5">
                <Activity className="w-3 h-3" />
                ENTRADA 1: audio_dna.json
              </div>
              <span className="text-xs text-neutral-400">Perfil Acústico & Visualización Recharts</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1 font-['Space_Grotesk']">
              Diagnóstico Acústico y Huella Tímbrica (Audio DNA)
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Visualización espectral y dinámica de <span className="text-cyan-400 font-mono">{dna.track_title}</span> ({dna.key_signature}, {dna.bpm} BPM).
            </p>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-neutral-500">Presets DNA:</span>
            {DEFAULT_AUDIO_DNA_PRESETS.map((preset) => {
              const isActive = dna.track_id === preset.track_id;
              return (
                <button
                  key={preset.track_id}
                  onClick={() => setDna(preset)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium font-mono transition-all ${
                    isActive
                      ? 'bg-cyan-500 text-neutral-950 font-bold shadow-md shadow-cyan-500/20 ring-2 ring-cyan-400/50'
                      : 'bg-neutral-800/80 text-neutral-300 hover:bg-neutral-700 hover:text-white border border-neutral-700'
                  }`}
                >
                  {preset.track_title.split('&')[0].trim()}
                </button>
              );
            })}
          </div>
        </div>

        {/* Upload bar */}
        <div className="mt-4 pt-4 border-t border-neutral-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAudioUpload}
              accept="audio/wav, audio/mp3, audio/mpeg, audio/ogg"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isAnalyzingAudio}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-cyan-300 border border-cyan-800/40 font-medium transition-all"
            >
              <Upload className="w-3.5 h-3.5" />
              {isAnalyzingAudio ? 'Analizando audio...' : 'Cargar Audio Real (WAV/MP3)'}
            </button>

            <input
              type="file"
              ref={jsonInputRef}
              onChange={handleJsonUpload}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => jsonInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 font-medium transition-all"
            >
              <Disc className="w-3.5 h-3.5" />
              Importar audio_dna.json
            </button>
          </div>

          {analysisStatus && (
            <div className="flex items-center gap-1.5 text-cyan-300 bg-cyan-950/60 px-3 py-1 rounded-md border border-cyan-800 font-mono">
              <Zap className="w-3 h-3 text-amber-400" />
              <span>{analysisStatus}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={copyJson}
              className="flex items-center gap-1 px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded font-mono transition-colors"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copiado' : 'Copiar JSON'}
            </button>
            <button
              onClick={downloadJson}
              className="flex items-center gap-1 px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded font-mono transition-colors"
            >
              <Download className="w-3 h-3" />
              Descargar
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RECHARTS DATA VISUALIZATION SECTION                                       */}
      {/* ========================================================================= */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-white font-['Space_Grotesk'] text-sm">
              Analizador Gráfico Recharts: Balance Espectral y Rango Dinámico
            </h3>
          </div>

          {/* Visualization mode toggle */}
          <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-800 text-xs font-mono">
            <button
              onClick={() => setChartMode('spectrum')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
                chartMode === 'spectrum'
                  ? 'bg-cyan-500 text-neutral-950 font-bold shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Waves className="w-3 h-3" />
              Espectro Frecuencial (AreaChart)
            </button>
            <button
              onClick={() => setChartMode('radar')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
                chartMode === 'radar'
                  ? 'bg-cyan-500 text-neutral-950 font-bold shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3 h-3" />
              Radar Dinámico (RadarChart)
            </button>
          </div>
        </div>

        {/* 1. Spectrum Area Chart */}
        {chartMode === 'spectrum' ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-neutral-400 px-1">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-cyan-500"></span>
                  <span>Respuesta Actual Detectada (dB)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-indigo-500"></span>
                  <span>Curva Ideal / Target (dB)</span>
                </span>
              </div>
              <span className="text-[11px] text-neutral-500">
                Mud: <strong className="text-amber-400">{dna.vocal_profile.mud_300hz_db}dB</strong> | Air: <strong className="text-cyan-400">{dna.vocal_profile.air_10khz_db}dB</strong>
              </span>
            </div>

            <div className="h-72 w-full bg-neutral-950/80 rounded-xl border border-neutral-800 p-2 relative">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={spectralData} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>

                  <XAxis
                    dataKey="freq"
                    stroke="#525252"
                    tick={{ fill: '#a3a3a3', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                  />
                  <YAxis
                    stroke="#525252"
                    tick={{ fill: '#a3a3a3', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                    domain={[-8, 8]}
                    unit="dB"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0a0a0a',
                      borderColor: '#262626',
                      borderRadius: '8px',
                      fontFamily: 'JetBrains Mono',
                      fontSize: '12px',
                      color: '#e5e5e5',
                    }}
                    formatter={(value: any, name: any, props: any) => {
                      const label = name === 'currentDb' ? 'Detectado' : 'Target Ideal';
                      return [`${value} dB (${props.payload.band})`, label];
                    }}
                  />
                  <ReferenceLine y={0} stroke="#3f3f46" strokeDasharray="3 3" />
                  <ReferenceLine x="300 Hz" stroke="#f59e0b" strokeDasharray="2 2" label={{ value: 'Mud 300Hz', fill: '#f59e0b', fontSize: 10 }} />
                  <ReferenceLine x="10 kHz" stroke="#06b6d4" strokeDasharray="2 2" label={{ value: 'Air 10kHz', fill: '#06b6d4', fontSize: 10 }} />

                  <Area
                    type="monotone"
                    dataKey="currentDb"
                    stroke="#06b6d4"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorCurrent)"
                    name="currentDb"
                  />
                  <Area
                    type="monotone"
                    dataKey="targetDb"
                    stroke="#6366f1"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    fillOpacity={1}
                    fill="url(#colorTarget)"
                    name="targetDb"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          /* 2. Dynamic Radar Chart */
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-neutral-400 px-1">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-cyan-400"></span>
                  <span>Huella Audio DNA Actual</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
                  <span>Estándar Comercial de Producción</span>
                </span>
              </div>
              <span className="text-[11px] text-neutral-500">
                Crest Factor: <strong className="text-amber-400">{dna.vocal_profile.crest_factor}dB</strong> | Dinámica: <strong className="text-purple-400">{dna.vocal_profile.dynamic_range_db}dB</strong>
              </span>
            </div>

            <div className="h-72 w-full bg-neutral-950/80 rounded-xl border border-neutral-800 p-2 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                  <PolarGrid stroke="#262626" />
                  <PolarAngleAxis
                    dataKey="metric"
                    tick={{ fill: '#a3a3a3', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 100]}
                    stroke="#3f3f46"
                    tick={{ fill: '#737373', fontSize: 9 }}
                  />
                  <Radar
                    name="DNA Detectado"
                    dataKey="detected"
                    stroke="#06b6d4"
                    fill="#06b6d4"
                    fillOpacity={0.45}
                  />
                  <Radar
                    name="Target Comercial"
                    dataKey="target"
                    stroke="#6366f1"
                    fill="#6366f1"
                    fillOpacity={0.2}
                  />
                  <Legend
                    wrapperStyle={{ fontFamily: 'JetBrains Mono', fontSize: '11px', paddingTop: '10px' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0a0a0a',
                      borderColor: '#262626',
                      borderRadius: '8px',
                      fontFamily: 'JetBrains Mono',
                      fontSize: '11px',
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Grid: Acoustic Dashboard & Sliders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Vocal Acoustic Profile Breakdown (7 cols) */}
        <div className="lg:col-span-7 bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <h3 className="font-bold text-white flex items-center gap-2 text-sm font-['Space_Grotesk']">
              <Disc className="w-4 h-4 text-cyan-400" />
              Perfil Vocal del Modelo (Vocal Profile)
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400">Timbre detectado:</span>
              <select
                value={dna.vocal_profile.timbre}
                onChange={(e) => updateVocalField('timbre', e.target.value)}
                className="bg-neutral-950 text-cyan-300 font-mono text-xs px-2.5 py-1 rounded border border-neutral-700 focus:outline-none focus:border-cyan-500"
              >
                <option value="dark">Dark (Opaco / Falta aire)</option>
                <option value="harsh">Harsh (Estridente / Agresivo)</option>
                <option value="warm">Warm (Cálido / Intimista)</option>
                <option value="boxy">Boxy (Resonante en medios)</option>
                <option value="balanced">Balanced (Equilibrado)</option>
              </select>
            </div>
          </div>

          {/* Acoustic Diagnostic Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Air at 10kHz */}
            <div className="bg-neutral-950/70 border border-neutral-800/80 rounded-xl p-3">
              <span className="text-[11px] text-neutral-400 block font-mono">Aire (10kHz - 16kHz)</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className={`text-lg font-bold font-mono ${dna.vocal_profile.air_10khz_db < 0 ? 'text-indigo-400' : 'text-emerald-400'}`}>
                  {dna.vocal_profile.air_10khz_db > 0 ? `+${dna.vocal_profile.air_10khz_db}` : dna.vocal_profile.air_10khz_db} dB
                </span>
              </div>
              <span className="text-[10px] text-neutral-500 block mt-0.5 font-mono">
                {dna.vocal_profile.air_10khz_db < 0 ? '⚠️ Falta aire (Opaca)' : '✅ Aire suficiente'}
              </span>
            </div>

            {/* Dynamic Range Crest */}
            <div className="bg-neutral-950/70 border border-neutral-800/80 rounded-xl p-3">
              <span className="text-[11px] text-neutral-400 block font-mono">Crest Factor / Dinámica</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-lg font-bold font-mono text-amber-400">
                  {dna.vocal_profile.crest_factor} dB
                </span>
              </div>
              <span className="text-[10px] text-neutral-500 block mt-0.5 font-mono">
                {dna.vocal_profile.crest_factor > 13 ? '⚡ Alto rango dinámico' : '🎚️ Dinámica controlada'}
              </span>
            </div>

            {/* Mud 300Hz */}
            <div className="bg-neutral-950/70 border border-neutral-800/80 rounded-xl p-3">
              <span className="text-[11px] text-neutral-400 block font-mono">Resonancia (300Hz)</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className={`text-lg font-bold font-mono ${dna.vocal_profile.mud_300hz_db > 2 ? 'text-rose-400' : 'text-neutral-200'}`}>
                  {dna.vocal_profile.mud_300hz_db > 0 ? `+${dna.vocal_profile.mud_300hz_db}` : dna.vocal_profile.mud_300hz_db} dB
                </span>
              </div>
              <span className="text-[10px] text-neutral-500 block mt-0.5 font-mono">
                {dna.vocal_profile.mud_300hz_db > 2 ? '⚠️ Exceso de barro/caja' : '✅ Limpio'}
              </span>
            </div>

            {/* Sibilance */}
            <div className="bg-neutral-950/70 border border-neutral-800/80 rounded-xl p-3">
              <span className="text-[11px] text-neutral-400 block font-mono">Sibilancia (6.5kHz)</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className={`text-lg font-bold font-mono ${dna.vocal_profile.sibilance_score > 60 ? 'text-rose-400' : 'text-cyan-400'}`}>
                  {dna.vocal_profile.sibilance_score} / 100
                </span>
              </div>
              <span className="text-[10px] text-neutral-500 block mt-0.5 font-mono">
                {dna.vocal_profile.sibilance_score > 60 ? '⚠️ De-Esser agresivo' : '✅ De-Esser liviano'}
              </span>
            </div>
          </div>

          {/* Interactive Acoustic Parameter Sliders */}
          <div className="space-y-4 pt-2">
            <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-400">
              Moduladores Acústicos en Tiempo Real (Actualizan Gráficos Recharts)
            </h4>

            {/* Mud slider */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-neutral-300">Nivel de Barro en 300Hz (Mud Index)</span>
                <span className="text-amber-400 font-bold">{dna.vocal_profile.mud_300hz_db} dB</span>
              </div>
              <input
                type="range"
                min="-4"
                max="8"
                step="0.5"
                value={dna.vocal_profile.mud_300hz_db}
                onChange={(e) => updateVocalField('mud_300hz_db', parseFloat(e.target.value))}
                className="w-full accent-amber-500 bg-neutral-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-500 mt-0.5 font-mono">
                <span>-4dB (Hollow)</span>
                <span>0dB (Neutral)</span>
                <span>+8dB (Exceso Mud)</span>
              </div>
            </div>

            {/* Air slider */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-neutral-300">Brillo / Aire en 10kHz (Air Sheen)</span>
                <span className="text-cyan-400 font-bold">{dna.vocal_profile.air_10khz_db} dB</span>
              </div>
              <input
                type="range"
                min="-8"
                max="6"
                step="0.5"
                value={dna.vocal_profile.air_10khz_db}
                onChange={(e) => updateVocalField('air_10khz_db', parseFloat(e.target.value))}
                className="w-full accent-cyan-500 bg-neutral-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-500 mt-0.5 font-mono">
                <span>-8dB (Muy Opaca)</span>
                <span>0dB (Plana)</span>
                <span>+6dB (Ultra Brillante)</span>
              </div>
            </div>

            {/* Dynamic Range slider */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-neutral-300">Rango Dinámico / Crest Factor</span>
                <span className="text-purple-400 font-bold">{dna.vocal_profile.dynamic_range_db} dB (Crest: {dna.vocal_profile.crest_factor})</span>
              </div>
              <input
                type="range"
                min="6"
                max="26"
                step="0.5"
                value={dna.vocal_profile.dynamic_range_db}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setDna({
                    ...dna,
                    vocal_profile: {
                      ...dna.vocal_profile,
                      dynamic_range_db: val,
                      crest_factor: Math.round(val * 0.8 * 10) / 10
                    }
                  });
                }}
                className="w-full accent-purple-500 bg-neutral-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-500 mt-0.5 font-mono">
                <span>6dB (Squashed/Trap)</span>
                <span>14dB (Pop)</span>
                <span>26dB (Acoustic/Dynamic)</span>
              </div>
            </div>

            {/* Sibilance slider */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-neutral-300">Intensidad de Sibilancia ('S' energy)</span>
                <span className="text-rose-400 font-bold">{dna.vocal_profile.sibilance_score} / 100</span>
              </div>
              <input
                type="range"
                min="10"
                max="95"
                step="1"
                value={dna.vocal_profile.sibilance_score}
                onChange={(e) => updateVocalField('sibilance_score', parseInt(e.target.value))}
                className="w-full accent-rose-500 bg-neutral-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* Stems list */}
          <div className="pt-2 border-t border-neutral-800">
            <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-2">
              Stems & Pistas Aisladas Detectadas ({dna.stems.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {dna.stems.map((stem, i) => (
                <div key={i} className="bg-neutral-950/80 border border-neutral-800 rounded-lg p-2.5 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-neutral-200">{stem.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400">{stem.category}</span>
                  </div>
                  <p className="text-neutral-400 text-[11px] mt-1 line-clamp-1">{stem.notes}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Metadata, Rule Trigger & JSON Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Metadata & Rules Trigger Card */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-white text-sm font-['Space_Grotesk'] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Reglas de Decisión del Agente (Acoustic Logic)
            </h3>

            <div className="space-y-2 text-xs font-mono">
              <div className={`p-2.5 rounded-lg border transition-all ${
                dna.vocal_profile.timbre === 'dark' || dna.vocal_profile.air_10khz_db < 0
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                  : 'bg-neutral-950 border-neutral-800 text-neutral-500'
              }`}>
                <span className="font-bold">Regla 1: Voz Opaca ➔ Pultec Boost</span>
                <p className="text-[11px] mt-0.5 text-neutral-400">
                  Condición: Air &lt; 0dB. Decisión: <strong className="text-white">Pultec EQP-1A Boost 10kHz +3dB</strong>.
                </p>
              </div>

              <div className={`p-2.5 rounded-lg border transition-all ${
                dna.vocal_profile.dynamic_range_db > 14
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                  : 'bg-neutral-950 border-neutral-800 text-neutral-500'
              }`}>
                <span className="font-bold">Regla 2: Alta Dinámica ➔ SSL VCA Comp</span>
                <p className="text-[11px] mt-0.5 text-neutral-400">
                  Condición: Crest &gt; 13dB. Decisión: <strong className="text-white">Waves SSL G-Master Target 4dB GR @ 10ms</strong>.
                </p>
              </div>

              <div className={`p-2.5 rounded-lg border transition-all ${
                dna.vocal_profile.mud_300hz_db > 1.5
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                  : 'bg-neutral-950 border-neutral-800 text-neutral-500'
              }`}>
                <span className="font-bold">Regla 3: Barro 300Hz ➔ Subtractive EQ</span>
                <p className="text-[11px] mt-0.5 text-neutral-400">
                  Condición: Mud &gt; +1.5dB. Decisión: <strong className="text-white">FabFilter Pro-Q3 Cut 300Hz -2dB</strong>.
                </p>
              </div>

              <div className={`p-2.5 rounded-lg border transition-all ${
                dna.vocal_profile.sibilance_score > 35
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                  : 'bg-neutral-950 border-neutral-800 text-neutral-500'
              }`}>
                <span className="font-bold">Regla 4: Sibilancia ➔ De-Esser Split</span>
                <p className="text-[11px] mt-0.5 text-neutral-400">
                  Condición: Sibilance &gt; 35. Decisión: <strong className="text-white">De-Esser Threshold -18dB</strong>.
                </p>
              </div>
            </div>

            <button
              onClick={onExecuteRAG}
              className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-neutral-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 font-mono"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Ejecutar Razonamiento RAG sobre este DNA</span>
            </button>
          </div>

          {/* Raw JSON Preview */}
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800 text-neutral-400">
              <span>audio_dna.json (Vista Previa)</span>
              <span className="text-[10px] text-cyan-400">{dna.track_id}</span>
            </div>
            <pre className="mt-2 text-[11px] text-cyan-300/90 overflow-x-auto max-h-56 p-2 bg-neutral-900/50 rounded-lg border border-neutral-800/60 custom-scrollbar leading-relaxed">
              {JSON.stringify(dna, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
