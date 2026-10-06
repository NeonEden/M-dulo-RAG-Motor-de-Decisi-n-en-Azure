export interface VocalProfile {
  timbre: 'dark' | 'bright' | 'warm' | 'harsh' | 'boxy' | 'balanced';
  dynamic_range_db: number;
  crest_factor: number;
  sibilance_score: number; // 0 to 100
  mud_300hz_db: number; // positive = excess mud, negative = clean
  air_10khz_db: number; // negative = dark/needs air boost, positive = airy
  mid_energy_db: number;
  fundamental_pitch: string; // e.g. "F3"
  transient_speed: 'fast' | 'moderate' | 'slow';
}

export interface StemAnalysis {
  name: string;
  category: 'vocal' | 'bass' | 'drums' | 'synth_lead' | 'pad' | 'guitar' | 'fx';
  prominence: number; // 0-100
  spectral_balance: string;
  notes: string;
}

export interface AudioDNA {
  track_id: string;
  track_title: string;
  bpm: number;
  key_signature: string; // e.g. "F minor", "A minor", "C major"
  genre: string;
  vocal_profile: VocalProfile;
  stems: StemAnalysis[];
  arrangement_detected: string[]; // ["Intro", "Verse 1", "Buildup", "Drop", "Outro"]
  overall_lufs: number;
  target_aesthetic: string;
  created_at?: string;
}

export interface PluginPreset {
  name: string;
  suitable_for: string;
  timbral_flavor: string;
  description: string;
}

export interface PluginItem {
  id: string;
  name: string;
  manufacturer: string;
  category: 'EQ' | 'Compressor' | 'Saturator' | 'DeEsser' | 'Reverb' | 'Delay' | 'Synth' | 'Mastering';
  role: string;
  saturation_type: 'Tube' | 'Tape' | 'Solid State / VCA' | 'FET 1176' | 'Opto LA-2A' | 'Digital Precision' | 'Multiband';
  timbral_curve: 'Bright Air' | 'Warm Low-Mid' | 'Aggressive Punch' | 'Transparent Surgical' | 'Silky Highs' | 'Vintage Warmth';
  tags: string[];
  presets: PluginPreset[];
  description: string;
  color_accent: string;
}

export interface VocalChainDevice {
  plugin: string;
  action?: string;
  target_reduction_db?: number;
  attack_ms?: number;
  release_ms?: number;
  ratio?: string;
  threshold_db?: number;
  frequency_hz?: number;
  gain_db?: number;
  drive_pct?: number;
  preset?: string;
  mix_pct?: number;
  q_factor?: number;
}

export interface InstrumentationMapping {
  stem: string;
  recommended_plugin: string;
  preset_name: string;
  rationale: string;
}

export interface MasterBusDevice {
  plugin: string;
  role: string;
  settings: string;
}

export interface ProductionPlan {
  vocal_chain_recommendation: {
    rack_name: string;
    devices: VocalChainDevice[];
  };
  daw_arrangement: {
    markers: string[];
    automation_ideas: string[];
  };
  instrumentation_mapping?: InstrumentationMapping[];
  master_bus_chain?: MasterBusDevice[];
  rag_reasoning_summary?: {
    vocal_diagnosis: string;
    vector_retrieval_insights: string[];
    decision_confidence: number;
    agent_thoughts: string[];
  };
  generated_at?: string;
  model_source?: string;
}
