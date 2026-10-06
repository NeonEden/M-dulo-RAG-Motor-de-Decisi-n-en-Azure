import React, { useState, useEffect } from 'react';
import { ProductionPlan, AudioDNA } from '../types/atlas';
import { audioDSP } from '../utils/audioEngine';
import { Sliders, Play, Square, Volume2, Power, Layers, Activity, Gauge, Zap, Disc, Sparkles } from 'lucide-react';

interface VirtualRackDawViewProps {
  plan: ProductionPlan;
  dna: AudioDNA;
}

export const VirtualRackDawView: React.FC<VirtualRackDawViewProps> = ({
  plan,
  dna
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBypassed, setIsBypassed] = useState(false);
  const [activeNode, setActiveNode] = useState<number | null>(null);
  const [vuNeedle, setVuNeedle] = useState<number>(0);
  const [playheadPos, setPlayheadPos] = useState<number>(0);

  // Dynamic parameters controllable by knobs
  const [mudCut, setMudCut] = useState(2.0);
  const [sslReduction, setSslReduction] = useState(4.0);
  const [sslAttack, setSslAttack] = useState(10);
  const [pultecBoost, setPultecBoost] = useState(3.0);
  const [pultecFreq, setPultecFreq] = useState(10);
  const [deEsserThresh, setDeEsserThresh] = useState(-18);

  // Synchronize initial plan values
  useEffect(() => {
    if (plan?.vocal_chain_recommendation?.devices) {
      plan.vocal_chain_recommendation.devices.forEach((dev) => {
        if (dev.plugin === 'Subtractive_EQ' && dev.action) {
          const match = dev.action.match(/Cut 300Hz -([0-9.]+)dB/i);
          if (match) setMudCut(parseFloat(match[1]));
        }
        if (dev.plugin === 'SSL_Compressor') {
          if (dev.target_reduction_db) setSslReduction(dev.target_reduction_db);
          if (dev.attack_ms) setSslAttack(dev.attack_ms);
        }
        if (dev.plugin === 'Pultec_EQ' && dev.action) {
          const match = dev.action.match(/Boost ([0-9]+)kHz \+([0-9.]+)dB/i);
          if (match) {
            setPultecFreq(parseInt(match[1]));
            setPultecBoost(parseFloat(match[2]));
          }
        }
        if (dev.plugin === 'DeEsser' && dev.threshold_db) {
          setDeEsserThresh(dev.threshold_db);
        }
      });
    }
  }, [plan]);

  // Audio Playback handler
  const handlePlayToggle = () => {
    if (isPlaying) {
      audioDSP.stop();
      setIsPlaying(false);
      setVuNeedle(0);
      setPlayheadPos(0);
    } else {
      audioDSP.updateParameters({
        mudCutDb: mudCut,
        airBoostDb: pultecBoost,
        compThresholdDb: -sslReduction * 4,
        compRatio: 4,
        deEsserThresholdDb: deEsserThresh
      });
      audioDSP.playVocalSimulation((sec) => {
        setIsPlaying(audioDSP.getIsPlaying());
        setPlayheadPos((sec / 3.6) * 100);
        // Animate VU meter needle
        setVuNeedle(Math.sin(sec * 8) * (sslReduction * 2) + sslReduction);
      });
      setIsPlaying(true);
    }
  };

  const handleBypassToggle = () => {
    const nextBypass = !isBypassed;
    setIsBypassed(nextBypass);
    audioDSP.setBypass(nextBypass);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-900/90 to-neutral-950 border border-neutral-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-mono text-xs border border-cyan-500/30 flex items-center gap-1.5">
                <Sliders className="w-3 h-3" />
                VIRTUAL HARDWARE RACK & DAW TIMELINE
              </div>
              <span className="text-xs text-neutral-400 font-mono">
                Preset: {plan?.vocal_chain_recommendation.rack_name || 'Atlas_Vocal_Preset_Fm'}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1 font-['Space_Grotesk']">
              Simulador DSP del Rack Vocal & Timeline DAW
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Audiciona interactivamente en tiempo real los 4 nodos de efectos sugeridos por el motor de decisión (Web Audio API).
            </p>
          </div>

          {/* Player controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleBypassToggle}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all border ${
                isBypassed
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-lg shadow-amber-500/10'
                  : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:text-white'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{isBypassed ? 'BYPASS (Sin Efectos)' : 'PROCESS (Efectos ON)'}</span>
            </button>

            <button
              onClick={handlePlayToggle}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-mono font-bold shadow-lg transition-all ${
                isPlaying
                  ? 'bg-rose-500 text-white shadow-rose-500/25 animate-pulse'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-neutral-950 shadow-cyan-500/25'
              }`}
            >
              {isPlaying ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isPlaying ? 'Detener Test' : 'Audicionar Cadena Vocal'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Rack Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Module 1: Subtractive EQ (FabFilter Style) */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex flex-col justify-between shadow-xl relative group hover:border-cyan-500/40 transition-all">
          <div>
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2 mb-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                <span className="font-bold text-xs font-mono text-white">1. Subtractive_EQ</span>
              </div>
              <span className="text-[10px] font-mono text-neutral-500">Surgical Notch</span>
            </div>

            {/* EQ Frequency Curve Screen */}
            <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 h-28 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#00d2ff_1px,transparent_1px)] [background-size:8px_8px]"></div>

              {/* Curve Drawing */}
              <svg className="w-full h-full" viewBox="0 0 200 80" preserveAspectRatio="none">
                <path
                  d={`M 0,40 Q 60,40 85,${40 + mudCut * 4} T 115,40 Q 160,40 200,40`}
                  fill="none"
                  stroke="#00d2ff"
                  strokeWidth="2.5"
                />
                <circle cx="95" cy={40 + mudCut * 4} r="4" fill="#f59e0b" />
              </svg>

              <div className="flex justify-between text-[10px] font-mono text-neutral-400 z-10">
                <span>300Hz</span>
                <span className="text-amber-400 font-bold">-{mudCut} dB</span>
                <span>Q: 1.8</span>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-neutral-400">Mud Cut Freq:</span>
                <span className="text-white">300 Hz</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Reducción Notch:</span>
                <span className="text-amber-400 font-bold">-{mudCut} dB</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="6"
                step="0.5"
                value={mudCut}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  setMudCut(v);
                  audioDSP.updateParameters({ mudCutDb: v });
                }}
                className="w-full accent-cyan-500 bg-neutral-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-neutral-800 text-[10px] font-mono text-neutral-500 flex items-center justify-between">
            <span>Objetivo: Quitar resonancia caja</span>
            <span className="text-cyan-400">HPF: 80Hz ON</span>
          </div>
        </div>

        {/* Module 2: SSL Compressor (Waves Style) */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex flex-col justify-between shadow-xl relative group hover:border-amber-500/40 transition-all">
          <div>
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2 mb-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span className="font-bold text-xs font-mono text-white">2. SSL_Compressor</span>
              </div>
              <span className="text-[10px] font-mono text-neutral-500">Solid State VCA</span>
            </div>

            {/* Analog VU Gain Reduction Meter */}
            <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 h-28 flex flex-col justify-between relative overflow-hidden">
              <div className="text-[9px] font-mono text-neutral-400 flex justify-between">
                <span>VU GAIN REDUCTION</span>
                <span className="text-amber-400 font-bold">-{isPlaying ? vuNeedle.toFixed(1) : sslReduction} dB</span>
              </div>

              {/* Meter Dial Visual */}
              <div className="relative w-full h-12 flex items-end justify-center">
                <div className="w-32 h-16 border-t-2 border-dashed border-neutral-700 rounded-t-full relative flex justify-center">
                  <div
                    className="w-0.5 h-14 bg-rose-500 origin-bottom transition-all duration-100 shadow-md shadow-rose-500/50"
                    style={{
                      transform: `rotate(${isPlaying ? (vuNeedle - 6) * 6 : (sslReduction - 4) * 8}deg)`
                    }}
                  ></div>
                </div>
              </div>

              <div className="flex justify-between text-[9px] font-mono text-neutral-500">
                <span>0dB</span>
                <span>-4dB</span>
                <span>-8dB</span>
                <span>-12dB</span>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-neutral-400">Target Reduction:</span>
                <span className="text-rose-400 font-bold">{sslReduction} dB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Attack Time:</span>
                <span className="text-white">{sslAttack} ms</span>
              </div>
              <input
                type="range"
                min="1"
                max="8"
                step="0.5"
                value={sslReduction}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  setSslReduction(v);
                  audioDSP.updateParameters({ compThresholdDb: -v * 4 });
                }}
                className="w-full accent-amber-500 bg-neutral-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-neutral-800 text-[10px] font-mono text-neutral-500 flex items-center justify-between">
            <span>Ratio: 4:1</span>
            <span className="text-amber-400">Release: AUTO</span>
          </div>
        </div>

        {/* Module 3: Pultec EQ (PuigTec EQP-1A) */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex flex-col justify-between shadow-xl relative group hover:border-emerald-500/40 transition-all">
          <div>
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2 mb-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="font-bold text-xs font-mono text-white">3. Pultec_EQ</span>
              </div>
              <span className="text-[10px] font-mono text-neutral-500">Passive Tube</span>
            </div>

            {/* Vintage Tube Display */}
            <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 h-28 flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-emerald-400 font-bold">12AX7 TUBE WARMTH</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[9px] border border-emerald-800/40">
                  WARM GLOW
                </span>
              </div>

              {/* Glowing Tubes */}
              <div className="flex items-center justify-center gap-4 py-1">
                <div className="w-6 h-12 rounded-t-full bg-amber-600/30 border border-amber-500/50 flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <div className="w-1.5 h-6 bg-amber-400/80 rounded-full animate-pulse blur-[1px]"></div>
                </div>
                <div className="w-6 h-12 rounded-t-full bg-amber-600/30 border border-amber-500/50 flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <div className="w-1.5 h-6 bg-amber-400/80 rounded-full animate-pulse blur-[1px]"></div>
                </div>
              </div>

              <div className="flex justify-between text-[10px] font-mono text-neutral-400">
                <span>FREQ: {pultecFreq}kHz</span>
                <span className="text-emerald-400 font-bold">+{pultecBoost}dB</span>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-neutral-400">High Air Boost:</span>
                <span className="text-emerald-400 font-bold">+{pultecBoost} dB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Frecuencia Seleccionada:</span>
                <span className="text-white">{pultecFreq} kHz (Air Band)</span>
              </div>
              <input
                type="range"
                min="1"
                max="6"
                step="0.5"
                value={pultecBoost}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  setPultecBoost(v);
                  audioDSP.updateParameters({ airBoostDb: v });
                }}
                className="w-full accent-emerald-500 bg-neutral-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-neutral-800 text-[10px] font-mono text-neutral-500 flex items-center justify-between">
            <span>Bandwidth: Broad (Q 4)</span>
            <span className="text-emerald-400">Silk Sheen ON</span>
          </div>
        </div>

        {/* Module 4: DeEsser (Dynamic Split) */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex flex-col justify-between shadow-xl relative group hover:border-pink-500/40 transition-all">
          <div>
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2 mb-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-pink-400"></span>
                <span className="font-bold text-xs font-mono text-white">4. DeEsser</span>
              </div>
              <span className="text-[10px] font-mono text-neutral-500">Split Band 6.5kHz</span>
            </div>

            {/* Sibilance Reduction Meter */}
            <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 h-28 flex flex-col justify-between relative overflow-hidden">
              <div className="text-[9px] font-mono text-neutral-400 flex justify-between">
                <span>SIBILANCE TAME</span>
                <span className="text-pink-400 font-bold">{deEsserThresh} dB</span>
              </div>

              {/* Reduction Bar Visual */}
              <div className="space-y-1 my-auto">
                <div className="flex justify-between text-[8px] font-mono text-neutral-500">
                  <span>-30dB</span>
                  <span>-18dB</span>
                  <span>0dB</span>
                </div>
                <div className="w-full bg-neutral-800 h-3 rounded-full overflow-hidden p-0.5">
                  <div
                    className="bg-gradient-to-r from-pink-500 to-rose-400 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, Math.max(10, (Math.abs(deEsserThresh) / 30) * 100))}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex justify-between text-[9px] font-mono text-neutral-500">
                <span>Target: 'S', 'T'</span>
                <span className="text-pink-400">Clean Top</span>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-neutral-400">Threshold:</span>
                <span className="text-pink-400 font-bold">{deEsserThresh} dB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Band:</span>
                <span className="text-white">Split-Band Dynamic</span>
              </div>
              <input
                type="range"
                min="-30"
                max="-10"
                step="1"
                value={deEsserThresh}
                onChange={(e) => {
                  const v = parseInt(e.target.value);
                  setDeEsserThresh(v);
                  audioDSP.updateParameters({ deEsserThresholdDb: v });
                }}
                className="w-full accent-pink-500 bg-neutral-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-neutral-800 text-[10px] font-mono text-neutral-500 flex items-center justify-between">
            <span>Range: -6dB</span>
            <span className="text-pink-400">Lookahead: 2ms</span>
          </div>
        </div>
      </div>

      {/* DAW Arrangement Timeline & Automation Graph */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <h3 className="font-bold text-white font-['Space_Grotesk'] text-sm">
              Línea de Tiempo DAW & Curvas de Automatización (DAW Arrangement)
            </h3>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono text-neutral-400">
            <span>Tempo: <strong className="text-white">{dna.bpm} BPM</strong></span>
            <span>Tonalidad: <strong className="text-white">{dna.key_signature}</strong></span>
          </div>
        </div>

        {/* Timeline Ruler */}
        <div className="space-y-2">
          {/* Bar Ruler */}
          <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
            {plan?.daw_arrangement.markers.map((marker, idx) => (
              <div
                key={idx}
                className="bg-neutral-950 border border-neutral-800/80 rounded-lg p-2 relative overflow-hidden"
              >
                <span className="text-[10px] text-neutral-500 block">
                  Barras {(idx * 8) + 1} - {(idx + 1) * 8}
                </span>
                <span className="font-bold text-cyan-300 text-xs mt-0.5 block">{marker}</span>

                {/* Playhead marker indicator */}
                {isPlaying && (
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-cyan-400 shadow-md shadow-cyan-400"
                    style={{ left: `${playheadPos}%` }}
                  ></div>
                )}
              </div>
            ))}
          </div>

          {/* Automation Curves Graphical Visualizer */}
          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="flex items-center gap-2 text-amber-300 font-bold">
                <Zap className="w-3.5 h-3.5" />
                Curva de Automatización: High-Pass Filter Cutoff Sweep (Barras 15 a 16)
              </span>
              <span className="text-[10px] text-neutral-500">20Hz ➔ 450Hz ➔ Drop Reset</span>
            </div>

            {/* Sweep Curve Graphic */}
            <div className="h-16 w-full bg-neutral-900/80 border border-neutral-800 rounded-lg p-2 relative flex items-center">
              <svg className="w-full h-full" viewBox="0 0 400 60" preserveAspectRatio="none">
                {/* Grid lines */}
                <line x1="100" y1="0" x2="100" y2="60" stroke="#333" strokeDasharray="2" />
                <line x1="200" y1="0" x2="200" y2="60" stroke="#333" strokeDasharray="2" />
                <line x1="300" y1="0" x2="300" y2="60" stroke="#333" strokeDasharray="2" />

                {/* HPF Cutoff ramp on bar 15-16 */}
                <path
                  d="M 0,50 L 180,50 Q 195,50 200,10 L 202,50 L 400,50"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="3"
                />
              </svg>

              <span className="absolute left-[46%] top-2 text-[10px] bg-amber-950 text-amber-300 px-1.5 py-0.5 rounded border border-amber-800 font-bold">
                HPF 450Hz Climax
              </span>
            </div>

            {/* Automation ideas listing */}
            <div className="pt-2 flex flex-wrap gap-2">
              {plan?.daw_arrangement.automation_ideas.map((idea, idx) => (
                <div
                  key={idx}
                  className="px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 text-[11px] flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  <span>{idea}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
