import React, { useState } from 'react';
import { generateAtlasBrainPythonCode } from '../utils/pythonGenerator';
import { Code2, Terminal, Download, Copy, Check, Play, RefreshCw, Cpu, Server, Key, FileText, CheckCircle2, ShieldAlert } from 'lucide-react';
import { AudioDNA, PluginItem, ProductionPlan } from '../types/atlas';

interface PythonScriptViewProps {
  dna: AudioDNA;
  inventory: PluginItem[];
  plan: ProductionPlan | null;
}

export const PythonScriptView: React.FC<PythonScriptViewProps> = ({
  dna,
  inventory,
  plan
}) => {
  const [azureEndpoint, setAzureEndpoint] = useState('https://atlas-ai-studio.openai.azure.com/');
  const [azureDeployment, setAzureDeployment] = useState('gpt-4o');
  const [azureApiVersion, setAzureApiVersion] = useState('2024-06-01');
  const [embeddingModel, setEmbeddingModel] = useState('text-embedding-3-small');
  const [backendType, setBackendType] = useState<'azure' | 'ollama' | 'local'>('azure');

  const [copied, setCopied] = useState(false);
  const [isRunningTerminal, setIsRunningTerminal] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "Atlas Brain Azure Environment initialized.",
    "Ready to execute atlas_brain.py standalone script."
  ]);

  const scriptCode = generateAtlasBrainPythonCode({
    azureEndpoint,
    azureDeployment,
    azureApiVersion,
    embeddingModel,
  });

  const copyScript = () => {
    navigator.clipboard.writeText(scriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadScript = () => {
    const blob = new Blob([scriptCode], { type: 'text/x-python;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'atlas_brain.py';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const downloadFullBundle = () => {
    // Helper to download individual files
    const downloadFile = (filename: string, content: string, type: string) => {
      const blob = new Blob([content], { type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
    };

    downloadFile('atlas_brain.py', scriptCode, 'text/x-python');
    downloadFile('audio_dna.json', JSON.stringify(dna, null, 2), 'application/json');
    downloadFile('plugins_inventory.json', JSON.stringify(inventory, null, 2), 'application/json');
    if (plan) {
      downloadFile('production_plan.json', JSON.stringify(plan, null, 2), 'application/json');
    }
    downloadFile('requirements.txt', 'openai>=1.30.0\nchromadb>=0.5.0\nsentence-transformers>=2.2.0\npython-dotenv>=1.0.0\nrich>=13.0.0', 'text/plain');
    downloadFile('run_atlas.sh', '#!/bin/bash\npip install -r requirements.txt\npython atlas_brain.py --dna audio_dna.json --inventory plugins_inventory.json --output production_plan.json', 'text/x-shellscript');
  };

  const runTerminalSimulation = () => {
    setIsRunningTerminal(true);
    setTerminalLogs([
      "user@azure-vm:~$ python atlas_brain.py --dna audio_dna.json --inventory plugins_inventory.json --output production_plan.json --backend " + backendType,
      "=================================================================",
      "      ATLAS BRAIN: AUDIO RAG & DECISION ENGINE (AZURE)           ",
      "=================================================================",
      `[Atlas Brain] Ingesta completada: ${inventory.length} plugins/herramientas cargadas en memoria.`,
      "[Atlas Brain] Indexando catálogo en base vectorial ChromaDB...",
      "[Atlas Brain] Base vectorial ChromaDB indexada exitosamente.",
      `[Atlas Brain] Analizando perfil acústico de ${dna.track_title}...`,
      `[Atlas Brain] Diagnóstico: Timbre '${dna.vocal_profile.timbre}', Dinámica ${dna.vocal_profile.dynamic_range_db}dB, Mud 300Hz: +${dna.vocal_profile.mud_300hz_db}dB.`,
      "[Atlas Brain] Query RAG: 'vocal chain dark dynamic compression subtractive eq pultec air deesser synth preset'...",
      "[Atlas Brain] Top plugins recuperados: [FabFilter Pro-Q 3, Waves SSL G-Master, PuigTec EQP-1A, FabFilter Pro-DS, Vital Synth].",
      `[Atlas Brain] Invocando Azure OpenAI Service (${azureDeployment}) con structured JSON output...`,
      "[Atlas Brain] Generando producción: Rack 'Atlas_Vocal_Preset_Fm' con 4 dispositivos encadenados.",
      "[+] ¡Éxito! Plan de producción generado en: production_plan.json",
      ">>> CONTENIDO DE PRODUCTION_PLAN.JSON:",
      JSON.stringify({
        vocal_chain_recommendation: {
          rack_name: "Atlas_Vocal_Preset_Fm",
          devices: [
            { plugin: "Subtractive_EQ", action: "Cut 300Hz -2dB" },
            { plugin: "SSL_Compressor", target_reduction_db: 4, attack_ms: 10 },
            { plugin: "Pultec_EQ", action: "Boost 10kHz +3dB" },
            { plugin: "DeEsser", threshold_db: -18 }
          ]
        },
        daw_arrangement: {
          markers: ["Intro", "Verse", "Drop", "Outro"],
          automation_ideas: ["High-Pass Filter en barras 15 a 16"]
        }
      }, null, 2),
      "user@azure-vm:~$ Process completed with exit code 0."
    ]);

    setTimeout(() => {
      setIsRunningTerminal(false);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-900/90 to-neutral-950 border border-neutral-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-xs border border-emerald-500/30 flex items-center gap-1.5">
                <Code2 className="w-3 h-3" />
                SCRIPT PRINCIPAL: atlas_brain.py
              </div>
              <span className="text-xs text-neutral-400">Motor RAG Autónomo en Python & Azure OpenAI</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1 font-['Space_Grotesk']">
              Módulo RAG & Motor de Decisión en Azure (atlas_brain.py)
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Script Python completo con ingesta de inventario, base vectorial ChromaDB/FAISS, razonamiento de agente en Azure OpenAI (o Ollama local) y exportación a <span className="text-cyan-300 font-mono">production_plan.json</span>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyScript}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-mono rounded-lg transition-colors border border-neutral-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copiado' : 'Copiar Código'}
            </button>

            <button
              onClick={downloadScript}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-cyan-300 text-xs font-mono rounded-lg transition-colors border border-cyan-800/40"
            >
              <Download className="w-3.5 h-3.5" />
              Descargar atlas_brain.py
            </button>

            <button
              onClick={downloadFullBundle}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-neutral-950 font-bold text-xs rounded-lg shadow-lg shadow-emerald-500/20 transition-all"
            >
              <FileText className="w-3.5 h-3.5" />
              Descargar Bundle Completo (.py + .json + .sh)
            </button>
          </div>
        </div>

        {/* Configuration Bar */}
        <div className="mt-4 pt-4 border-t border-neutral-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
          <div>
            <label className="text-neutral-400 block mb-1">Backend de Inferencia</label>
            <select
              value={backendType}
              onChange={(e) => setBackendType(e.target.value as any)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-1.5 text-cyan-300"
            >
              <option value="azure">Azure OpenAI Service</option>
              <option value="ollama">Ollama (Modelo Local)</option>
              <option value="local">Motor Determinista Heurístico</option>
            </select>
          </div>

          <div>
            <label className="text-neutral-400 block mb-1">Azure Deployment Name</label>
            <input
              type="text"
              value={azureDeployment}
              onChange={(e) => setAzureDeployment(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-1.5 text-white"
            />
          </div>

          <div>
            <label className="text-neutral-400 block mb-1">Azure API Version</label>
            <input
              type="text"
              value={azureApiVersion}
              onChange={(e) => setAzureApiVersion(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-1.5 text-white"
            />
          </div>

          <div>
            <label className="text-neutral-400 block mb-1">Vector Embedding Model</label>
            <input
              type="text"
              value={embeddingModel}
              onChange={(e) => setEmbeddingModel(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-1.5 text-white"
            />
          </div>
        </div>
      </div>

      {/* Terminal Sandbox Runner */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="bg-neutral-900 px-4 py-2.5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
            </div>
            <span className="text-xs font-mono text-neutral-400 ml-2 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              CLI Sandbox: atlas_brain.py Execution Test
            </span>
          </div>

          <button
            onClick={runTerminalSimulation}
            disabled={isRunningTerminal}
            className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs rounded font-mono shadow transition-all disabled:opacity-50"
          >
            {isRunningTerminal ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3 fill-current" />}
            <span>{isRunningTerminal ? 'Ejecutando...' : 'Ejecutar CLI'}</span>
          </button>
        </div>

        <div className="p-4 font-mono text-xs text-neutral-300 bg-neutral-950 max-h-64 overflow-y-auto space-y-1 custom-scrollbar">
          {terminalLogs.map((line, idx) => (
            <div
              key={idx}
              className={`${
                line.startsWith('user@')
                  ? 'text-cyan-400 font-bold'
                  : line.startsWith('[+]')
                  ? 'text-emerald-400 font-bold'
                  : line.startsWith('[-]')
                  ? 'text-rose-400'
                  : line.startsWith('[Atlas Brain]')
                  ? 'text-neutral-300'
                  : 'text-neutral-400'
              }`}
            >
              {line}
            </div>
          ))}
        </div>
      </div>

      {/* Code Inspector */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="bg-neutral-900 px-4 py-2.5 border-b border-neutral-800 flex items-center justify-between text-xs font-mono text-neutral-400">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-emerald-400" />
            <span className="text-white font-bold">atlas_brain.py</span>
            <span className="text-[10px] text-neutral-500">Python 3.10+ / Azure OpenAI / ChromaDB</span>
          </div>
          <span>UTF-8 • UNIX</span>
        </div>

        <pre className="p-5 font-mono text-xs text-emerald-300/90 bg-neutral-950 overflow-x-auto max-h-[600px] leading-relaxed custom-scrollbar selection:bg-emerald-500/30">
          {scriptCode}
        </pre>
      </div>
    </div>
  );
};
