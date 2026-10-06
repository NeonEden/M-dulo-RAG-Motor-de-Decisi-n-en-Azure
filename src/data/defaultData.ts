import { AudioDNA, PluginItem } from '../types/atlas';

export const DEFAULT_AUDIO_DNA_PRESETS: AudioDNA[] = [
  {
    track_id: "dna_vocal_fm_dark",
    track_title: "Dark Vocal & High Dynamic Range (Atlas Lead)",
    bpm: 124,
    key_signature: "F minor (Fm)",
    genre: "Melodic Techno / Pop Electronic",
    vocal_profile: {
      timbre: "dark",
      dynamic_range_db: 18.5,
      crest_factor: 14.2,
      sibilance_score: 42,
      mud_300hz_db: 3.4,
      air_10khz_db: -4.8,
      mid_energy_db: -1.2,
      fundamental_pitch: "F3",
      transient_speed: "fast"
    },
    stems: [
      { name: "Lead Vocal", category: "vocal", prominence: 95, spectral_balance: "Dark, Muddy at 300Hz, High dynamic spikes", notes: "Needs Pultec sheen, SSL leveling and surgical mud dip" },
      { name: "Bassline Stabs", category: "bass", prominence: 85, spectral_balance: "Deep sub 45Hz, sharp punch at 90Hz", notes: "Needs punchy analog synth preset" },
      { name: "Atmospheric Pad", category: "pad", prominence: 60, spectral_balance: "Wide stereo, lush midrange", notes: "Vintage Roland style Juno pad" },
      { name: "Drums & Percussion", category: "drums", prominence: 90, spectral_balance: "Snappy 200Hz snare, crisp 8kHz hats", notes: "Tight transient shaping needed" }
    ],
    arrangement_detected: ["Intro (Bars 1-8)", "Verse (Bars 9-16)", "Build-up (Bars 17-24)", "Drop (Bars 25-40)", "Outro (Bars 41-48)"],
    overall_lufs: -16.4,
    target_aesthetic: "Crisp modern pop-electronic hybrid with upfront silky vocal and wide analog warmth"
  },
  {
    track_id: "dna_harsh_sibilant_am",
    track_title: "Harsh Mid Sibilant Vocal & Trap Beat (Am)",
    bpm: 140,
    key_signature: "A minor (Am)",
    genre: "Trap / Modern Urban",
    vocal_profile: {
      timbre: "harsh",
      dynamic_range_db: 12.0,
      crest_factor: 9.8,
      sibilance_score: 88,
      mud_300hz_db: -1.5,
      air_10khz_db: 4.2,
      mid_energy_db: 5.5,
      fundamental_pitch: "A3",
      transient_speed: "fast"
    },
    stems: [
      { name: "Main Vocal Rap", category: "vocal", prominence: 95, spectral_balance: "Aggressive 3.5kHz bite, piercing 6.8kHz sibilance", notes: "Heavy De-Esser + Tube saturation warming" },
      { name: "808 Sub Bass", category: "bass", prominence: 92, spectral_balance: "Massive 35Hz sub rumble with harmonic 3rd", notes: "Vital Sub 808 with soft clipping" },
      { name: "Dark Bell Synth", category: "synth_lead", prominence: 70, spectral_balance: "High-mid percussive pluck", notes: "Analog Lab V Dark Glass Bells" }
    ],
    arrangement_detected: ["Intro (Bars 1-4)", "Verse (Bars 5-20)", "Chorus / Drop (Bars 21-36)", "Verse 2 (Bars 37-52)", "Outro (Bars 53-60)"],
    overall_lufs: -11.2,
    target_aesthetic: "Gritty, upfront commercial trap with controlled highs and devastating low-end"
  },
  {
    track_id: "dna_warm_acoustic_c",
    track_title: "Warm Acoustic Ballad (C Major)",
    bpm: 76,
    key_signature: "C major",
    genre: "Indie Acoustic / Neo-Soul",
    vocal_profile: {
      timbre: "warm",
      dynamic_range_db: 22.0,
      crest_factor: 16.5,
      sibilance_score: 30,
      mud_300hz_db: 1.2,
      air_10khz_db: -2.0,
      mid_energy_db: 0.5,
      fundamental_pitch: "G3",
      transient_speed: "slow"
    },
    stems: [
      { name: "Lead Intimate Vocal", category: "vocal", prominence: 98, spectral_balance: "Intimate chest resonance, low sibilance, high breath dynamics", notes: "Opto LA-2A smooth leveling + gentle high shelf" },
      { name: "Acoustic Fingerpicking", category: "guitar", prominence: 80, spectral_balance: "Natural wood body 180Hz, string shimmer 5kHz", notes: "Tape saturation + subtle plate space" },
      { name: "Warm Rhodes Piano", category: "pad", prominence: 75, spectral_balance: "Vintage bell harmonics with tremolo", notes: "Analog Lab V Stage 73 Suitcase" }
    ],
    arrangement_detected: ["Intro (Bars 1-4)", "Verse 1 (Bars 5-16)", "Chorus (Bars 17-28)", "Verse 2 (Bars 29-40)", "Bridge (Bars 41-48)", "Outro (Bars 49-56)"],
    overall_lufs: -18.2,
    target_aesthetic: "Organic, breathy, analog warmth with zero digital fatigue"
  },
  {
    track_id: "dna_synthwave_gm",
    track_title: "Cyberpunk Synthwave & Vocoder (Gm)",
    bpm: 118,
    key_signature: "G minor (Gm)",
    genre: "Synthwave / Cyberpunk",
    vocal_profile: {
      timbre: "boxy",
      dynamic_range_db: 14.5,
      crest_factor: 11.0,
      sibilance_score: 55,
      mud_300hz_db: 4.8,
      air_10khz_db: -1.0,
      mid_energy_db: 2.1,
      fundamental_pitch: "D3",
      transient_speed: "moderate"
    },
    stems: [
      { name: "Robotic Vocoder Lead", category: "vocal", prominence: 90, spectral_balance: "Formant heavy, boxy resonance around 400Hz", notes: "Subtractive notch + aggressive 1176 punch" },
      { name: "Analog Arp Lead", category: "synth_lead", prominence: 85, spectral_balance: "Filter cutoff sweep 500Hz-8kHz", notes: "Vital Retro Saw Arp" },
      { name: "LinnDrum Gated Snare", category: "drums", prominence: 92, spectral_balance: "Heavy 200Hz punch + gated non-linear reverb", notes: "SSL Talkback compressor style" }
    ],
    arrangement_detected: ["Intro (Bars 1-8)", "Verse (Bars 9-24)", "Build (Bars 25-32)", "Drop / Main Hook (Bars 33-48)", "Outro (Bars 49-56)"],
    overall_lufs: -13.0,
    target_aesthetic: "Nostalgic 80s neon grit with laser-sharp top end and driving bass"
  }
];

export const DEFAULT_PLUGINS_INVENTORY: PluginItem[] = [
  {
    id: "plg_subtractive_eq",
    name: "FabFilter Pro-Q 3",
    manufacturer: "FabFilter",
    category: "EQ",
    role: "Subtractive_EQ",
    saturation_type: "Digital Precision",
    timbral_curve: "Transparent Surgical",
    tags: ["surgical", "clean", "linear_phase", "mud_removal", "high_pass", "dynamic_eq", "resonance_tamer"],
    description: "Industry-standard surgical equalizer with ultra-clean filters, dynamic bands, and brickwall slopes.",
    color_accent: "#00d2ff",
    presets: [
      { name: "Vocal Cleanup Mud 300Hz", suitable_for: "Vocals with boxiness/mud", timbral_flavor: "Transparent", description: "Notches 300Hz by -2.5dB with Q 1.8 and 80Hz 18dB/oct HPF." },
      { name: "Harsh Mid Notch 3.2kHz", suitable_for: "Harsh piercing vocals/guitars", timbral_flavor: "Clean", description: "Dynamic notch at 3.2kHz to reduce ear fatigue without dulling presence." },
      { name: "Sub Kick Low End Tightener", suitable_for: "Kick/Bass cleanup", timbral_flavor: "Surgical", description: "High pass 30Hz brickwall with steep dip at 250Hz for sub headroom." }
    ]
  },
  {
    id: "plg_ssl_comp",
    name: "Waves SSL G-Master / Channel Comp",
    manufacturer: "Waves / SSL",
    category: "Compressor",
    role: "SSL_Compressor",
    saturation_type: "Solid State / VCA",
    timbral_curve: "Aggressive Punch",
    tags: ["vca", "fast_attack", "glue", "punchy", "vocal_control", "drum_glue", "modern_pop"],
    description: "Classic solid-state VCA compressor famous for legendary snap, vocal leveling, and mix-bus glue.",
    color_accent: "#f59e0b",
    presets: [
      { name: "Vocal Leveler 4dB GR", suitable_for: "Vocals with wide dynamic range", timbral_flavor: "VCA Snap", description: "Attack 10ms, Release Auto, Ratio 4:1, Target reduction 4dB." },
      { name: "Fast Transient Grab", suitable_for: "Percussive vocals & snares", timbral_flavor: "Punchy bite", description: "Attack 3ms, Release 0.1s, Ratio 4:1, aggressive transient clamp." },
      { name: "Master Bus 2dB Glue", suitable_for: "Overall mix bus", timbral_flavor: "Cohesive glue", description: "Attack 30ms, Release Auto, Ratio 2:1, 2dB gentle bus compression." }
    ]
  },
  {
    id: "plg_pultec_eq",
    name: "Waves PuigTec EQP-1A / Tube EQ",
    manufacturer: "Waves / Pultec",
    category: "EQ",
    role: "Pultec_EQ",
    saturation_type: "Tube",
    timbral_curve: "Bright Air",
    tags: ["tube", "smooth_air", "10khz_boost", "warmth", "analog_sheen", "silky", "vintage"],
    description: "Legendary passive tube equalizer renowned for its musical high-frequency air boost (10kHz-16kHz) and solid low-end trick.",
    color_accent: "#10b981",
    presets: [
      { name: "Silk Air 10kHz +3dB", suitable_for: "Dark or dull vocals/instruments", timbral_flavor: "Velvety air", description: "Boost 10kHz +3dB with Broad Bandwidth (Q 4) for instant radio openness." },
      { name: "16kHz Vocal Sparkle", suitable_for: "Pop vocal sheen", timbral_flavor: "Ultra air", description: "Boost 16kHz +2.5dB, giving modern expensive shimmer without harshness." },
      { name: "Low End Weight 60Hz", suitable_for: "Kick/Bass/Warmth", timbral_flavor: "Tube fatness", description: "Boost & Atten trick at 60Hz +3dB for rounded analog foundation." }
    ]
  },
  {
    id: "plg_deesser",
    name: "FabFilter Pro-DS / Waves DeEsser",
    manufacturer: "FabFilter / Waves",
    category: "DeEsser",
    role: "DeEsser",
    saturation_type: "Digital Precision",
    timbral_curve: "Transparent Surgical",
    tags: ["sibilance", "deesser", "harshness", "6khz", "split_band", "clean"],
    description: "Precision dynamic sibilance suppressor to tame piercing 'S', 'T', and 'Sh' sounds without lisping.",
    color_accent: "#ec4899",
    presets: [
      { name: "Atlas Vocal Tame -18dB", suitable_for: "Vocals with high sibilance", timbral_flavor: "Transparent", description: "Threshold -18dB, center frequency 6.5kHz, split-band mode, range -6dB." },
      { name: "Heavy Rap De-Ess -24dB", suitable_for: "Close-mic aggressive vocals", timbral_flavor: "Deep notch", description: "Threshold -24dB, range -9dB, fast lookahead." },
      { name: "Subtle Overhead Cymbal Softener", suitable_for: "Bright drum cymbals", timbral_flavor: "Natural", description: "Threshold -14dB, wide band 8kHz, smooth reduction." }
    ]
  },
  {
    id: "plg_soothe2",
    name: "Oeksound soothe2",
    manufacturer: "Oeksound",
    category: "EQ",
    role: "Dynamic_Resonance_Suppressor",
    saturation_type: "Digital Precision",
    timbral_curve: "Silky Highs",
    tags: ["resonance", "harshness_killer", "smart_eq", "smooth", "mud_fix"],
    description: "Dynamic resonance suppressor that auto-identifies and removes harsh frequencies in real-time.",
    color_accent: "#8b5cf6",
    presets: [
      { name: "Vocal Harshness Remover", suitable_for: "Nasal, abrasive mid frequencies", timbral_flavor: "Silky smooth", description: "Depth 3.5, Sharpness 5.0, focused on 2kHz - 6kHz band." },
      { name: "Vocal Boxiness Relaxer", suitable_for: "Resonant chest build-up at 350Hz", timbral_flavor: "Clean clear", description: "Low-mid focus with fast recovery." }
    ]
  },
  {
    id: "plg_1176",
    name: "Universal Audio 1176 LN Classic Limiting Amp",
    manufacturer: "UAD / Waves CLA-76",
    category: "Compressor",
    role: "FET_1176_Compressor",
    saturation_type: "FET 1176",
    timbral_curve: "Aggressive Punch",
    tags: ["fet", "ultra_fast", "analog_grit", "in_your_face", "transient_smack"],
    description: "Lightning fast FET limiting amplifier delivering iconic aggression, presence and immediate vocal upfrontness.",
    color_accent: "#ef4444",
    presets: [
      { name: "All-Buttons Lead Vocal Grab", suitable_for: "Heavy pop/rock vocals", timbral_flavor: "FET saturation", description: "Ratio 4:1, Attack 3 (fast), Release 7 (instant), grabbing first 3-5dB peaks." },
      { name: "Parallel Snare Smack", suitable_for: "Drums in need of power", timbral_flavor: "Explosive", description: "All buttons in mode, 50% dry/wet blend." }
    ]
  },
  {
    id: "plg_la2a",
    name: "Teletronix LA-2A Leveling Amplifier",
    manufacturer: "UAD / Waves CLA-2A",
    category: "Compressor",
    role: "Opto_LA2A_Compressor",
    saturation_type: "Opto LA-2A",
    timbral_curve: "Warm Low-Mid",
    tags: ["opto", "smooth", "warm", "musical_release", "ballad_vocal", "acoustic"],
    description: "Legendary optical tube compressor famous for its two-stage photo-cell release and lush harmonic warmth.",
    color_accent: "#eab308",
    presets: [
      { name: "Smooth Acoustic Vocal Glide", suitable_for: "Dynamic singing / warm ballad", timbral_flavor: "Tube cream", description: "Peak Reduction set to 35, yielding 2-3dB of transparent musical hugging." }
    ]
  },
  {
    id: "plg_decapitator",
    name: "Soundtoys Decapitator",
    manufacturer: "Soundtoys",
    category: "Saturator",
    role: "Analog_Color_Saturator",
    saturation_type: "Tube",
    timbral_curve: "Vintage Warmth",
    tags: ["saturation", "drive", "tube_warmth", "analog_harmonics", "pentode", "triode"],
    description: "Analog saturation modeler with 5 distinct tube/transistor console circuits and Tone control.",
    color_accent: "#d97706",
    presets: [
      { name: "Style T Subtle Vocal Thickener", suitable_for: "Thin sterile vocals", timbral_flavor: "Triode tube", description: "Drive 1.8, Tone 6.2, Style T, adds even-order harmonics without audible distortion." },
      { name: "Style A Neve Console Bite", suitable_for: "Bass & drums punch", timbral_flavor: "Class A console", description: "Drive 3.5, Tone 5.0, Thump ON." }
    ]
  },
  {
    id: "plg_vital_synth",
    name: "Vital Spectral Wavetable Synth",
    manufacturer: "Matt Tytel",
    category: "Synth",
    role: "Vital_Synth_Engine",
    saturation_type: "Digital Precision",
    timbral_curve: "Aggressive Punch",
    tags: ["wavetable", "sub_808", "acid_lead", "cyberpunk", "modern_bass", "synth"],
    description: "Cutting-edge spectral warping wavetable synthesizer for devastating sub-basses, tearing leads, and futuristic textures.",
    color_accent: "#06b6d4",
    presets: [
      { name: "Vital Sub 808 - Atlas Low End", suitable_for: "Trap & Urban Basslines", timbral_flavor: "Sub weight with 2nd harmonic", description: "Pure sine with subtle drive, glide 60ms, pitched to key." },
      { name: "Vital Cyberpunk Neon Saw Pluck", suitable_for: "Melodic Techno & Synthwave", timbral_flavor: "Bright filtered saw", description: "Unison 7, LP12 filter envelope, stereo spread 100%." }
    ]
  },
  {
    id: "plg_analog_lab",
    name: "Arturia Analog Lab V",
    manufacturer: "Arturia",
    category: "Synth",
    role: "Analog_Lab_V_Synth_Engine",
    saturation_type: "Tape",
    timbral_curve: "Vintage Warmth",
    tags: ["vintage_synth", "juno", "rhodes", "prophet", "lush_pad", "analog_warmth"],
    description: "Definitive collection of modeled iconic analog synthesizers, electric pianos, and lush vintage keyboards.",
    color_accent: "#6366f1",
    presets: [
      { name: "Choral Juno-106 Lush Pad", suitable_for: "Atmospheric breakdowns & drops", timbral_flavor: "Chorus-rich warmth", description: "Roland Juno-106 dual DCO pad with iconic stereo BBD Chorus II." },
      { name: "Stage 73 Suitcase Velvet EP", suitable_for: "Neo-soul & Pop verses", timbral_flavor: "Tine resonance", description: "Warm 1973 Fender Rhodes with dynamic velocity bark." }
    ]
  },
  {
    id: "plg_valhalla_verb",
    name: "Valhalla VintageVerb",
    manufacturer: "Valhalla DSP",
    category: "Reverb",
    role: "Atlas_Spatial_Reverb",
    saturation_type: "Digital Precision",
    timbral_curve: "Silky Highs",
    tags: ["reverb", "space", "80s_plate", "hall", "vocal_depth", "lush"],
    description: "Versatile algorithmic reverb modeling 1970s and 1980s digital hardware reverbs with exceptional bloom.",
    color_accent: "#a855f7",
    presets: [
      { name: "Atlas Vocal Plate 1.8s", suitable_for: "Lead vocals", timbral_flavor: "Diffuse shimmer", description: "Pre-delay 35ms, Decay 1.8s, Color 1980s, Low Cut 250Hz, High Cut 7kHz." },
      { name: "Lush Massive Drop Hall 4.0s", suitable_for: "Build-ups and sidechain swells", timbral_flavor: "Epic space", description: "Decay 4.2s, Mix 100% on send, Damping 6kHz." }
    ]
  }
];
