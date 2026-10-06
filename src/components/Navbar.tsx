import React from 'react';
import { Brain, Cpu, Sparkles, Download, Volume2, Play, Square, Activity, Database, Sliders, Code2, Layers } from 'lucide-react';
import { audioDSP } from '../utils/audioEngine';

interface NavbarProps {
  activeTab: 'dna' | 'inventory' | 'rag' | 'rack' | 'python';
  setActiveTab: (tab: 'dna' | 'inventory' | 'rag' | 'rack' | 'python') => void;
  onExecuteRAG: () => void;
  isLoading: boolean;
  activeTrackTitle: string;
  keySignature: string;
  bpm: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onExecuteRAG,
  isLoading,
  activeTrackTitle,
  keySignature,
  bpm
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = React.useState(false);
  const [isBypassed, setIsBypassed] = React.useState(false);

  const togglePlayback = () => {
    if (isPlayingAudio) {
      audioDSP.stop();
      setIsPlayingAudio(false);
    } else {
      audioDSP.playVocalSimulation(() => {
        setIsPlayingAudio(audioDSP.getIsPlaying());
      });
      setIsPlayingAudio(true);
    }
  };

  const toggleBypass = () => {
    const nextState = !isBypassed;
    setIsBypassed(nextState);
    audioDSP.setBypass(nextState);
  };

  return (
    <header className="border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 p-0.5 shadow-lg shadow-cyan-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-neutral-950 rounded-[7px] flex items-center justify-center">
                <Brain className="w-5 h-5 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-white font-['Space_Grotesk'] text-lg">
                  ATLAS<span className="text-cyan-400">BRAIN</span>
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-mono font-medium rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/50">
                  RAG AUDIO v2.4
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 flex items-center gap-1.5 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                Azure OpenAI & Vector Decision Engine
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-neutral-900/90 p-1 rounded-xl border border-neutral-800">
            <button
              onClick={() => setActiveTab('dna')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'dna'
                  ? 'bg-cyan-500 text-neutral-950 font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              1. Audio DNA
            </button>

            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'inventory'
                  ? 'bg-cyan-500 text-neutral-950 font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              2. Catálogo Plugins
            </button>

            <button
              onClick={() => setActiveTab('rag')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'rag'
                  ? 'bg-gradient-to-r from-cyan-400 to-indigo-500 text-neutral-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-800/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              3. Motor RAG & Plan
            </button>

            <button
              onClick={() => setActiveTab('rack')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'rack'
                  ? 'bg-cyan-500 text-neutral-950 font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              4. Rack DAW & DSP
            </button>

            <button
              onClick={() => setActiveTab('python')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'python'
                  ? 'bg-cyan-500 text-neutral-950 font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              5. atlas_brain.py
            </button>
          </nav>

          {/* Quick Actions & Audition Player */}
          <div className="flex items-center gap-2">
            {/* Audio Preview DSP */}
            <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-lg p-1">
              <button
                onClick={togglePlayback}
                title="Audicionar simulación DSP de cadena vocal"
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-medium transition-all ${
                  isPlayingAudio
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                    : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                }`}
              >
                {isPlayingAudio ? <Square className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
                {isPlayingAudio ? 'Stop DSP' : 'Test Vocal DSP'}
              </button>

              {isPlayingAudio && (
                <button
                  onClick={toggleBypass}
                  className={`ml-1 px-2 py-1 text-[11px] font-mono rounded transition-colors ${
                    isBypassed
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                      : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  }`}
                >
                  {isBypassed ? 'BYPASS (Dry)' : 'PROCESS (Wet)'}
                </button>
              )}
            </div>

            {/* Execute RAG Decision button */}
            <button
              onClick={onExecuteRAG}
              disabled={isLoading}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-neutral-950 font-bold text-xs rounded-lg shadow-lg shadow-cyan-500/25 transition-all transform active:scale-95 disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Razonando...' : 'Ejecutar RAG'}</span>
            </button>
          </div>
        </div>

        {/* Sub-header info bar */}
        <div className="flex items-center justify-between py-1.5 border-t border-neutral-900 text-[11px] font-mono text-neutral-400">
          <div className="flex items-center gap-4 truncate">
            <span className="text-neutral-500">Track activo:</span>
            <span className="text-cyan-300 font-medium truncate">{activeTrackTitle}</span>
            <span className="text-neutral-600">|</span>
            <span>Tonalidad: <strong className="text-white">{keySignature}</strong></span>
            <span className="text-neutral-600">|</span>
            <span>Tempo: <strong className="text-white">{bpm} BPM</strong></span>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Azure OpenAI Ready
            </span>
            <span className="flex items-center gap-1 text-indigo-400">
              <Database className="w-3 h-3" />
              ChromaDB Vector Store
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
