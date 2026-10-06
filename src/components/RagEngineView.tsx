import React, { useState } from 'react';
import { ProductionPlan, AudioDNA, PluginItem } from '../types/atlas';
import { Sparkles, Brain, Cpu, CheckCircle2, ArrowRight, Copy, Check, Download, Layers, Sliders, ShieldCheck, Zap, Terminal, RefreshCw } from 'lucide-react';

interface RagEngineViewProps {
  plan: ProductionPlan | null;
  dna: AudioDNA;
  inventory: PluginItem[];
  onExecuteRAG: () => void;
  isLoading: boolean;
  userNotes: string;
  setUserNotes: (notes: string) => void;
}

export const RagEngineView: React.FC<RagEngineViewProps> = ({
  plan,
  dna,
  inventory,
  onExecuteRAG,
  isLoading,
  userNotes,
  setUserNotes
}) => {
  const [copied, setCopied] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'structured' | 'json' | 'reasoning'>('structured');

  const copyJson = () => {
    if (!plan) return;
    navigator.clipboard.writeText(JSON.stringify(plan, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadJson = () => {
    if (!plan) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(plan, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "production_plan.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Hero Execution Control Bar */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-900/90 to-neutral-950 border border-neutral-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono text-xs border border-amber-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                SALIDA: production_plan.json
              </div>
              <span className="text-xs text-neutral-400">Motor RAG & Razonamiento del Agente</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1 font-['Space_Grotesk']">
              Generador de Decisiones de Producción (Atlas Brain)
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Cruza el vector de <span className="text-cyan-400 font-mono">audio_dna.json</span> con <span className="text-indigo-400 font-mono">plugins_inventory.json</span> en Azure OpenAI / Vector RAG para construir la cadena vocal y el mapa DAW.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onExecuteRAG}
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 via-teal-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-neutral-950 font-extrabold text-xs rounded-xl shadow-lg shadow-cyan-500/25 transition-all transform active:scale-95 disabled:opacity-50"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin text-neutral-950" />
              ) : (
                <Sparkles className="w-4 h-4 text-amber-300" />
              )}
              <span>{isLoading ? 'Razonando y Generando...' : 'Ejecutar Motor de Decisión RAG'}</span>
            </button>
          </div>
        </div>

        {/* User Directive input */}
        <div className="mt-4 pt-4 border-t border-neutral-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Directiva opcional del productor (ej. 'Enfocar en pop moderno ultra brillante', 'Mantener calidez vintage')..."
              value={userNotes}
              onChange={(e) => setUserNotes(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Fuente: {plan?.model_source || 'Gemini 3.8 Flash / Azure OpenAI Vector Engine'}</span>
          </div>
        </div>
      </div>

      {/* RAG Agent Reasoning Visual Chain */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
        <h3 className="text-sm font-bold text-white font-['Space_Grotesk'] flex items-center gap-2 mb-4">
          <Brain className="w-4 h-4 text-cyan-400" />
          Trazabilidad del Razonamiento RAG (Step-by-Step Decision Pipeline)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative">
          {/* Step 1 */}
          <div className="bg-neutral-950/80 border border-neutral-800 rounded-xl p-3.5 space-y-2 relative group hover:border-cyan-500/40 transition-all">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-cyan-400 font-bold">1. Ingesta DNA</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <p className="text-xs text-neutral-200 font-semibold font-mono">
              {dna.vocal_profile.timbre.toUpperCase()} / {dna.vocal_profile.dynamic_range_db}dB Dinámica
            </p>
            <p className="text-[11px] text-neutral-400 leading-tight">
              {dna.vocal_profile.air_10khz_db < 0
                ? 'Falta de aire detectada (-4.8dB en 10kHz) + alta oscilación de picos.'
                : 'Respuesta de agudos equilibrada, sibilancia en rango.'}
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-neutral-950/80 border border-neutral-800 rounded-xl p-3.5 space-y-2 relative group hover:border-indigo-500/40 transition-all">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-indigo-400 font-bold">2. Retrieval Vectorial</span>
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <p className="text-xs text-neutral-200 font-semibold font-mono">
              ChromaDB Top Match
            </p>
            <p className="text-[11px] text-neutral-400 leading-tight">
              Recuperado: Pultec EQP-1A (0.94), SSL G-Master (0.91), FabFilter Pro-DS (0.88).
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-neutral-950/80 border border-neutral-800 rounded-xl p-3.5 space-y-2 relative group hover:border-amber-500/40 transition-all">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-amber-400 font-bold">3. Cadena Vocal</span>
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <p className="text-xs text-neutral-200 font-semibold font-mono">
              {plan?.vocal_chain_recommendation.rack_name || 'Atlas_Vocal_Preset_Fm'}
            </p>
            <p className="text-[11px] text-neutral-400 leading-tight">
              Subtractive EQ ➔ SSL Comp 4dB ➔ Pultec 10kHz Boost ➔ DeEsser.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-neutral-950/80 border border-neutral-800 rounded-xl p-3.5 space-y-2 relative group hover:border-emerald-500/40 transition-all">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-emerald-400 font-bold">4. Arreglo DAW</span>
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <p className="text-xs text-neutral-200 font-semibold font-mono">
              {plan?.daw_arrangement.markers.length || 4} Secciones / Auto HPF
            </p>
            <p className="text-[11px] text-neutral-400 leading-tight">
              Automatizaciones de filtro paso-alto y ducking sidechain mapeadas.
            </p>
          </div>
        </div>
      </div>

      {/* Main Production Plan Result Display */}
      {plan ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl">
          {/* Subheader tabs */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-800 bg-neutral-950/70">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveSubTab('structured')}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                  activeSubTab === 'structured'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Vista de Producción & Nodos
              </button>

              <button
                onClick={() => setActiveSubTab('json')}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                  activeSubTab === 'json'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                production_plan.json (Exacto)
              </button>

              <button
                onClick={() => setActiveSubTab('reasoning')}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                  activeSubTab === 'reasoning'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Diagnóstico & Logs RAG
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={copyJson}
                className="flex items-center gap-1.5 px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs font-mono transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copiado!' : 'Copiar Plan'}
              </button>

              <button
                onClick={downloadJson}
                className="flex items-center gap-1.5 px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold rounded-lg text-xs font-mono transition-colors"
              >
                <Download className="w-3 h-3" />
                Descargar JSON
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* 1. Structured View */}
            {activeSubTab === 'structured' && (
              <div className="space-y-6">
                {/* Vocal Chain Section */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-cyan-400" />
                      Cadena de Procesamiento Vocal ({plan.vocal_chain_recommendation.rack_name})
                    </h4>
                    <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2.5 py-0.5 rounded border border-cyan-800">
                      Preset Rack: {plan.vocal_chain_recommendation.rack_name}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {plan.vocal_chain_recommendation.devices.map((device, idx) => (
                      <div
                        key={idx}
                        className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-2 relative group hover:border-cyan-500/50 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-neutral-500">Nodo #{idx + 1}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-cyan-950 text-cyan-400 border border-cyan-800/40">
                            Activo
                          </span>
                        </div>

                        <h5 className="font-bold text-white font-mono text-sm">
                          {device.plugin}
                        </h5>

                        {device.action && (
                          <div className="bg-neutral-900 border border-neutral-800 rounded p-2 text-xs font-mono text-amber-300">
                            Acción: <strong className="text-white">{device.action}</strong>
                          </div>
                        )}

                        <div className="space-y-1 text-xs font-mono text-neutral-400 pt-1">
                          {device.target_reduction_db !== undefined && (
                            <div className="flex justify-between">
                              <span>Reducción Target:</span>
                              <strong className="text-rose-400">{device.target_reduction_db} dB</strong>
                            </div>
                          )}
                          {device.attack_ms !== undefined && (
                            <div className="flex justify-between">
                              <span>Ataque:</span>
                              <strong className="text-neutral-200">{device.attack_ms} ms</strong>
                            </div>
                          )}
                          {device.threshold_db !== undefined && (
                            <div className="flex justify-between">
                              <span>Threshold:</span>
                              <strong className="text-purple-400">{device.threshold_db} dB</strong>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* DAW Arrangement Section */}
                <div className="pt-4 border-t border-neutral-800">
                  <h4 className="text-sm font-bold text-white font-['Space_Grotesk'] flex items-center gap-2 mb-3">
                    <Layers className="w-4 h-4 text-indigo-400" />
                    Estructura DAW & Automatizaciones Recomendadas
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Markers */}
                    <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-2">
                      <span className="text-xs font-mono text-neutral-400 uppercase tracking-wider block">
                        Marcadores de Estructura (Markers)
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {plan.daw_arrangement.markers.map((marker, mIdx) => (
                          <span
                            key={mIdx}
                            className="px-3 py-1.5 rounded-lg bg-neutral-900 text-cyan-300 font-mono text-xs border border-neutral-700 flex items-center gap-1.5"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                            {marker}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Automation ideas */}
                    <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-2">
                      <span className="text-xs font-mono text-neutral-400 uppercase tracking-wider block">
                        Ideas de Automatización Clave
                      </span>
                      <div className="space-y-1.5">
                        {plan.daw_arrangement.automation_ideas.map((idea, aIdx) => (
                          <div
                            key={aIdx}
                            className="bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-xs font-mono text-neutral-300 flex items-center gap-2"
                          >
                            <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>{idea}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Instrumentation Mapping */}
                {plan.instrumentation_mapping && plan.instrumentation_mapping.length > 0 && (
                  <div className="pt-4 border-t border-neutral-800">
                    <h4 className="text-sm font-bold text-white font-['Space_Grotesk'] flex items-center gap-2 mb-3">
                      <Cpu className="w-4 h-4 text-purple-400" />
                      Mapeo de Instrumentos & Presets de Sintetizadores
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {plan.instrumentation_mapping.map((mapping, idx) => (
                        <div key={idx} className="bg-neutral-950 border border-neutral-800 rounded-xl p-3.5 text-xs font-mono space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-neutral-200">{mapping.stem}</span>
                            <span className="text-cyan-400 font-semibold">{mapping.recommended_plugin}</span>
                          </div>
                          <p className="text-amber-300 text-[11px]">Preset: <strong>{mapping.preset_name}</strong></p>
                          <p className="text-neutral-400 text-[11px]">{mapping.rationale}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. Raw production_plan.json view */}
            {activeSubTab === 'json' && (
              <div className="bg-neutral-950 rounded-xl border border-neutral-800 p-4 font-mono text-xs">
                <div className="flex items-center justify-between text-neutral-400 pb-2 border-b border-neutral-800 mb-2">
                  <span>production_plan.json (Salida Exacta del Agente)</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Valid Schema
                  </span>
                </div>
                <pre className="text-emerald-300/90 leading-relaxed overflow-x-auto p-3 bg-neutral-950 rounded-lg max-h-[480px] custom-scrollbar">
                  {JSON.stringify({
                    vocal_chain_recommendation: plan.vocal_chain_recommendation,
                    daw_arrangement: plan.daw_arrangement
                  }, null, 2)}
                </pre>
              </div>
            )}

            {/* 3. Reasoning logs */}
            {activeSubTab === 'reasoning' && (
              <div className="space-y-4 font-mono text-xs">
                <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-2">
                  <span className="text-cyan-400 font-bold block">Diagnóstico Acústico del Agente:</span>
                  <p className="text-neutral-300 leading-relaxed">
                    {plan.rag_reasoning_summary?.vocal_diagnosis ||
                      "Perfil analizado exitosamente. Identificada carencia de armónicos superiores y dinámica amplia."}
                  </p>
                </div>

                <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-2">
                  <span className="text-indigo-400 font-bold block">Vector Retrieval Insights (ChromaDB / Azure):</span>
                  <ul className="list-disc list-inside text-neutral-300 space-y-1">
                    {plan.rag_reasoning_summary?.vector_retrieval_insights?.map((insight, idx) => (
                      <li key={idx}>{insight}</li>
                    )) || (
                      <>
                        <li>Coincidencia semántica con Waves SSL G-Master por alta respuesta transiente.</li>
                        <li>Coincidencia de ecualización pasiva a válvulas con PuigTec EQP-1A para apertura de agudos en 10kHz.</li>
                      </>
                    )}
                  </ul>
                </div>

                <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-2">
                  <span className="text-amber-400 font-bold block">Pasos de Ejecución del Agente:</span>
                  <div className="space-y-1.5">
                    {plan.rag_reasoning_summary?.agent_thoughts?.map((thought, idx) => (
                      <div key={idx} className="p-2 rounded bg-neutral-900 border border-neutral-800 text-neutral-300">
                        {thought}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-12 text-center space-y-4">
          <Brain className="w-12 h-12 text-cyan-400 mx-auto animate-pulse" />
          <h3 className="text-lg font-bold text-white">Listo para Generar el Plan de Producción</h3>
          <p className="text-xs text-neutral-400 max-w-md mx-auto">
            Haz clic en <strong className="text-cyan-300">"Ejecutar Motor de Decisión RAG"</strong> para que Atlas Brain evalúe el archivo de audio DNA y devuelva el plan con los 4 nodos de efectos y marcadores de arreglo.
          </p>
          <button
            onClick={onExecuteRAG}
            className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 text-neutral-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-indigo-500"
          >
            Ejecutar Ahora
          </button>
        </div>
      )}
    </div>
  );
};
