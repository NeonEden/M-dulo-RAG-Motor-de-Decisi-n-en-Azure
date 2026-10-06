/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AudioDnaView } from './components/AudioDnaView';
import { PluginsCatalogView } from './components/PluginsCatalogView';
import { RagEngineView } from './components/RagEngineView';
import { VirtualRackDawView } from './components/VirtualRackDawView';
import { PythonScriptView } from './components/PythonScriptView';
import { AudioDNA, PluginItem, ProductionPlan } from './types/atlas';
import { DEFAULT_AUDIO_DNA_PRESETS, DEFAULT_PLUGINS_INVENTORY } from './data/defaultData';
import { Sparkles, Brain, Cpu, Database, Activity, Sliders, Code2, AlertCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dna' | 'inventory' | 'rag' | 'rack' | 'python'>('dna');
  const [audioDNA, setAudioDNA] = useState<AudioDNA>(DEFAULT_AUDIO_DNA_PRESETS[0]);
  const [pluginsInventory, setPluginsInventory] = useState<PluginItem[]>(DEFAULT_PLUGINS_INVENTORY);
  const [userNotes, setUserNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Initial production plan matching user's exact specification
  const [productionPlan, setProductionPlan] = useState<ProductionPlan>({
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
      automation_ideas: ["High-Pass Filter en barras 15 a 16", "Sidechain Ducking en Lead Vocal"]
    },
    instrumentation_mapping: [
      {
        stem: "Bassline Stabs",
        recommended_plugin: "Vital Spectral Wavetable Synth",
        preset_name: "Vital Sub 808 - Atlas Low End",
        rationale: "Fija el sub-grave con saturación armónica par a 45Hz."
      },
      {
        stem: "Atmospheric Pad",
        recommended_plugin: "Arturia Analog Lab V",
        preset_name: "Choral Juno-106 Lush Pad",
        rationale: "Abre el campo estéreo sin saturar la zona media del lead."
      }
    ],
    rag_reasoning_summary: {
      vocal_diagnosis: "Voz opaca detectada (-4.8dB en 10kHz) con alta dinámica (Crest Factor 14.2dB) y resonancia parásita en 300Hz (+3.4dB).",
      vector_retrieval_insights: [
        "ChromaDB Query: PuigTec EQP-1A para apertura de aire suave.",
        "ChromaDB Query: Waves SSL G-Master para control de transientes rápidos.",
        "ChromaDB Query: FabFilter Pro-DS para control de sibilancia."
      ],
      decision_confidence: 97.4,
      agent_thoughts: [
        "1. Ingestado audio_dna.json (Fm, 124 BPM).",
        "2. Recuperado inventario de plugins y presets estructurados.",
        "3. Sintetizado rack de 4 nodos y mapa de arreglo DAW con HPF en compases 15-16.",
        "4. Exportado production_plan.json validado."
      ]
    },
    model_source: "Azure OpenAI Service / Gemini 3.8 Flash RAG"
  });

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Execute RAG Decision Loop
  const handleExecuteRAG = async () => {
    try {
      setIsLoading(true);
      showToast("Atlas Brain: Ejecutando Ingesta y Razonamiento RAG...");

      const res = await fetch("/api/rag/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audio_dna: audioDNA,
          plugins_inventory: pluginsInventory,
          user_notes: userNotes
        })
      });

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }

      const planData = await res.json();
      setProductionPlan(planData);
      setActiveTab('rag');
      showToast("¡Plan de producción generado exitosamente en production_plan.json!");
    } catch (err: any) {
      console.warn("Backend API call fallback:", err);

      // Local fallback calculation if offline
      const mudCut = Math.max(1.5, Math.round(audioDNA.vocal_profile.mud_300hz_db || 3.0));
      const airBoost = (audioDNA.vocal_profile.air_10khz_db || -4) < 0 ? 3 : 2;
      const deesserThresh = (audioDNA.vocal_profile.sibilance_score || 45) > 60 ? -22 : -18;
      const compReduction = (audioDNA.vocal_profile.dynamic_range_db || 16) > 14 ? 4 : 3;

      let keyShort = "Fm";
      if (audioDNA.key_signature.toLowerCase().includes("minor")) {
        keyShort = `${audioDNA.key_signature.split(" ")[0]}m`;
      } else if (audioDNA.key_signature.toLowerCase().includes("major")) {
        keyShort = `${audioDNA.key_signature.split(" ")[0]}maj`;
      }

      const localPlan: ProductionPlan = {
        vocal_chain_recommendation: {
          rack_name: `Atlas_Vocal_Preset_${keyShort}`,
          devices: [
            { plugin: "Subtractive_EQ", action: `Cut 300Hz -${mudCut}dB` },
            { plugin: "SSL_Compressor", target_reduction_db: compReduction, attack_ms: 10 },
            { plugin: "Pultec_EQ", action: `Boost 10kHz +${airBoost}dB` },
            { plugin: "DeEsser", threshold_db: deesserThresh }
          ]
        },
        daw_arrangement: {
          markers: audioDNA.arrangement_detected
            ? audioDNA.arrangement_detected.map(m => m.split("(")[0].trim()).slice(0, 4)
            : ["Intro", "Verse", "Drop", "Outro"],
          automation_ideas: [
            "High-Pass Filter en barras 15 a 16",
            `Sidechain ducking previo al Drop en ${keyShort}`
          ]
        },
        model_source: "Atlas Brain Local Vector RAG"
      };

      setProductionPlan(localPlan);
      setActiveTab('rag');
      showToast("Plan generado con motor heurístico RAG local.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-['Plus_Jakarta_Sans'] selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 border border-cyan-500/60 text-cyan-300 text-xs font-mono px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onExecuteRAG={handleExecuteRAG}
        isLoading={isLoading}
        activeTrackTitle={audioDNA.track_title}
        keySignature={audioDNA.key_signature}
        bpm={audioDNA.bpm}
      />

      {/* Main Workspace Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dna' && (
          <AudioDnaView
            dna={audioDNA}
            setDna={setAudioDNA}
            onExecuteRAG={handleExecuteRAG}
          />
        )}

        {activeTab === 'inventory' && (
          <PluginsCatalogView
            inventory={pluginsInventory}
            setInventory={setPluginsInventory}
            currentDNA={audioDNA}
          />
        )}

        {activeTab === 'rag' && (
          <RagEngineView
            plan={productionPlan}
            dna={audioDNA}
            inventory={pluginsInventory}
            onExecuteRAG={handleExecuteRAG}
            isLoading={isLoading}
            userNotes={userNotes}
            setUserNotes={setUserNotes}
          />
        )}

        {activeTab === 'rack' && (
          <VirtualRackDawView
            plan={productionPlan}
            dna={audioDNA}
          />
        )}

        {activeTab === 'python' && (
          <PythonScriptView
            dna={audioDNA}
            inventory={pluginsInventory}
            plan={productionPlan}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-900 py-4 bg-neutral-950/60 text-[11px] font-mono text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span>ATLAS BRAIN: Decision & Vector RAG Module (audio_dna.json ➔ production_plan.json)</span>
          </div>
          <div className="flex items-center gap-4 text-neutral-400">
            <span>Azure OpenAI Service</span>
            <span>ChromaDB / FAISS</span>
            <span>Python 3.10+ (atlas_brain.py)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
