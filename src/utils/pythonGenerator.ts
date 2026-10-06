export const generateAtlasBrainPythonCode = (config?: {
  azureEndpoint?: string;
  azureDeployment?: string;
  azureApiVersion?: string;
  embeddingModel?: string;
}) => {
  const endpoint = config?.azureEndpoint || "https://your-resource-name.openai.azure.com/";
  const deployment = config?.azureDeployment || "gpt-4o";
  const apiVersion = config?.azureApiVersion || "2024-06-01";
  const embModel = config?.embeddingModel || "text-embedding-3-small";

  return `#!/usr/bin/env python3
"""
=============================================================================
ATLAS BRAIN - MÓDULO RAG & MOTOR DE DECISIÓN EN AZURE (atlas_brain.py)
=============================================================================
Objetivo:
  Recibir 'audio_dna.json', comparar el perfil acústico con el catálogo de
  plugins y presets ('plugins_inventory.json') usando embeddings vectoriales
  (ChromaDB / FAISS) y razonamiento del agente en Azure OpenAI (o Ollama local),
  y exportar el plan de producción final 'production_plan.json'.

Requisitos:
  pip install openai chromadb sentence-transformers rich python-dotenv
=============================================================================
"""

import os
import json
import argparse
import sys
from typing import Dict, Any, List
from dotenv import load_dotenv

# Cargar variables de entorno desde .env si existe
load_dotenv()

# =============================================================================
# CONFIGURACIÓN DE AZURE OPENAI & VECTOR STORE
# =============================================================================
AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT", "${endpoint}")
AZURE_OPENAI_API_KEY = os.getenv("AZURE_OPENAI_API_KEY", "")
AZURE_OPENAI_DEPLOYMENT = os.getenv("AZURE_OPENAI_DEPLOYMENT", "${deployment}")
AZURE_OPENAI_API_VERSION = os.getenv("AZURE_OPENAI_API_VERSION", "${apiVersion}")
EMBEDDING_DEPLOYMENT = os.getenv("AZURE_EMBEDDING_DEPLOYMENT", "${embModel}")
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")

class AtlasBrainRAG:
    """
    Motor de Decisión y RAG para producción musical asistida por IA.
    """
    def __init__(self, inventory_path: str, backend: str = "azure"):
        self.inventory_path = inventory_path
        self.backend = backend.lower()
        self.inventory: List[Dict[str, Any]] = []
        self.vector_db = None
        self.load_inventory()
        self.init_vector_store()
        self.init_llm_client()

    def load_inventory(self):
        """Carga y valida el archivo plano/estructurado de plugins_inventory.json"""
        if not os.path.exists(self.inventory_path):
            raise FileNotFoundError(f"Inventario no encontrado en: {self.inventory_path}")
        with open(self.inventory_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            # Soporta formato objeto { "plugins": [...] } o lista directa [...]
            self.inventory = data.get("plugins", data) if isinstance(data, dict) else data
        print(f"[Atlas Brain] Ingesta completada: {len(self.inventory)} plugins/herramientas cargadas en memoria.")

    def init_vector_store(self):
        """Inicializa una base de datos vectorial liviana (ChromaDB en memoria o similitud semántica)"""
        try:
            import chromadb
            client = chromadb.Client()
            self.collection = client.create_collection(name="atlas_plugins_catalog")
            
            # Indexar plugins y sus presets
            for idx, item in enumerate(self.inventory):
                doc_text = f"Plugin: {item.get('name')} | Rol: {item.get('role')} | Tipo: {item.get('saturation_type')} | Timbre: {item.get('timbral_curve')} | Tags: {', '.join(item.get('tags', []))} | Desc: {item.get('description', '')}"
                # Agregar presets como contexto
                for p in item.get('presets', []):
                    doc_text += f" | Preset: {p.get('name')} ({p.get('suitable_for', '')} - {p.get('description', '')})"
                
                self.collection.add(
                    documents=[doc_text],
                    metadatas=[{"plugin_id": item.get("id", str(idx)), "name": item.get("name", ""), "role": item.get("role", "")}],
                    ids=[f"doc_{idx}"]
                )
            print("[Atlas Brain] Base vectorial ChromaDB indexada exitosamente.")
        except Exception as e:
            print(f"[Atlas Brain] Advertencia: ChromaDB no disponible ({e}). Utilizando motor de búsqueda estructurado nativo.")
            self.collection = None

    def init_llm_client(self):
        """Configura el cliente de inferencia (Azure OpenAI o Ollama)"""
        if self.backend == "azure":
            if not AZURE_OPENAI_API_KEY:
                print("[Atlas Brain] AVISO: AZURE_OPENAI_API_KEY no configurada en .env. Se usará el motor heurístico local de emergencia si la API falla.")
            try:
                from openai import AzureOpenAI
                self.client = AzureOpenAI(
                    azure_endpoint=AZURE_OPENAI_ENDPOINT,
                    api_key=AZURE_OPENAI_API_KEY,
                    api_version=AZURE_OPENAI_API_VERSION
                )
            except Exception as err:
                print(f"[Atlas Brain] Error instanciando AzureOpenAI: {err}")
                self.client = None
        elif self.backend == "ollama":
            try:
                from openai import OpenAI
                self.client = OpenAI(
                    base_url=f"{OLLAMA_HOST}/v1",
                    api_key="ollama"
                )
            except Exception as err:
                print(f"[Atlas Brain] Error instanciando Ollama: {err}")
                self.client = None
        else:
            self.client = None

    def retrieve_relevant_tools(self, query: str, top_k: int = 6) -> List[Dict[str, Any]]:
        """Recupera los plugins y presets más afines a las necesidades acústicas"""
        if self.collection:
            results = self.collection.query(query_texts=[query], n_results=min(top_k, len(self.inventory)))
            matched_names = [m.get("name") for m in results["metadatas"][0]]
            return [item for item in self.inventory if item.get("name") in matched_names]
        
        # Fallback de coincidencia léxica por palabras clave
        keywords = query.lower().split()
        scored = []
        for item in self.inventory:
            score = 0
            text = f"{item.get('name')} {item.get('role')} {item.get('saturation_type')} {item.get('timbral_curve')} {' '.join(item.get('tags', []))}".lower()
            for kw in keywords:
                if kw in text:
                    score += 1
            scored.append((score, item))
        scored.sort(key=lambda x: x[0], reverse=True)
        return [item for score, item in scored[:top_k]]

    def analyze_vocal_acoustics(self, vocal_profile: Dict[str, Any]) -> str:
        """
        Razonamiento acústico del agente sobre el perfil vocal.
        Reglas de producción:
          - Si la voz es opaca y con alto rango dinámico -> EQ Pultec agudos + Compresión rápida (SSL/VCA) + De-Esser liviano.
          - Si la voz es harsh -> De-Esser agresivo + Saturación a válvulas (Decapitator) + Pro-Q3 notch.
        """
        timbre = vocal_profile.get("timbre", "balanced")
        dynamic_range = vocal_profile.get("dynamic_range_db", 14)
        crest_factor = vocal_profile.get("crest_factor", 12)
        sibilance = vocal_profile.get("sibilance_score", 40)
        mud_300hz = vocal_profile.get("mud_300hz_db", 0)
        air_10khz = vocal_profile.get("air_10khz_db", 0)

        diagnosis = []
        if timbre == "dark" or air_10khz < -2:
            diagnosis.append("Voz opaca / falta de aire en agudos -> Requerido boost Pultec EQP-1A en 10kHz o 16kHz.")
        if dynamic_range > 15 or crest_factor > 13:
            diagnosis.append("Alto rango dinámico / picos rápidos -> Requerida compresión rápida VCA (SSL G-Master) o FET 1176 para control de transientes.")
        if sibilance > 50:
            diagnosis.append(f"Sibilancia marcada (score {sibilance}/100) -> De-Esser split-band con threshold aprox -18dB a -22dB.")
        if mud_300hz > 2.0:
            diagnosis.append(f"Exceso de resonancia en medios-graves (+{mud_300hz}dB en 300Hz) -> Subtractive EQ notch -2dB a -3.5dB en 300Hz.")

        return "\\n".join(diagnosis)

    def generate_production_plan(self, audio_dna: Dict[str, Any]) -> Dict[str, Any]:
        """
        Ejecuta el ciclo de decisión RAG y genera el 'production_plan.json' con la estructura exacta.
        """
        vocal_profile = audio_dna.get("vocal_profile", {})
        key_signature = audio_dna.get("key_signature", "F minor (Fm)")
        bpm = audio_dna.get("bpm", 120)
        stems = audio_dna.get("stems", [])
        detected_arrangement = audio_dna.get("arrangement_detected", ["Intro", "Verse", "Drop", "Outro"])

        # Extraer tonalidad corta para el rack_name (ej. "Fm")
        key_short = "Fm"
        if "minor" in key_signature.lower():
            root = key_signature.split()[0]
            key_short = f"{root}m"
        elif "major" in key_signature.lower():
            root = key_signature.split()[0]
            key_short = f"{root}maj"
        rack_name = f"Atlas_Vocal_Preset_{key_short}"

        # 1. Diagnóstico del Agente
        diagnosis_text = self.analyze_vocal_acoustics(vocal_profile)

        # 2. RAG Retrieval de herramientas
        search_query = f"vocal chain {vocal_profile.get('timbre', '')} dynamic compression subtractive eq pultec air deesser synth preset"
        retrieved_plugins = self.retrieve_relevant_tools(search_query, top_k=8)

        # 3. Inferencia con LLM (Azure OpenAI o Ollama)
        if self.client and AZURE_OPENAI_API_KEY:
            try:
                system_prompt = (
                    "Eres Atlas Brain, un ingeniero de mezcla de élite y productor musical. "
                    "Tu tarea es recibir el perfil acústico de audio_dna.json y las herramientas recuperadas del inventario "
                    "para emitir un plan de producción JSON con la estructura EXACTA requerida:\\n"
                    "{\\n"
                    '  "vocal_chain_recommendation": {\\n'
                    f'    "rack_name": "{rack_name}",\\n'
                    '    "devices": [\\n'
                    '      { "plugin": "Subtractive_EQ", "action": "Cut 300Hz -2dB" },\\n'
                    '      { "plugin": "SSL_Compressor", "target_reduction_db": 4, "attack_ms": 10 },\\n'
                    '      { "plugin": "Pultec_EQ", "action": "Boost 10kHz +3dB" },\\n'
                    '      { "plugin": "DeEsser", "threshold_db": -18 }\\n'
                    '    ]\\n'
                    '  },\\n'
                    '  "daw_arrangement": {\\n'
                    '    "markers": ["Intro", "Verse", "Drop", "Outro"],\\n'
                    '    "automation_ideas": ["High-Pass Filter en barras 15 a 16"]\\n'
                    '  }\\n'
                    "}\\n"
                    "Responde ÚNICAMENTE con el objeto JSON válido, sin bloques de código markdown ni texto adicional."
                )

                user_prompt = (
                    f"AUDIO DNA:\\n{json.dumps(audio_dna, indent=2)}\\n\\n"
                    f"DIAGNÓSTICO ACÚSTICO:\\n{diagnosis_text}\\n\\n"
                    f"HERRAMIENTAS Y PRESETS RAG RECUPERADOS:\\n{json.dumps(retrieved_plugins, indent=2)}\\n"
                )

                response = self.client.chat.completions.create(
                    model=AZURE_OPENAI_DEPLOYMENT,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    temperature=0.2,
                    response_format={"type": "json_object"}
                )

                content = response.choices[0].message.content
                plan = json.loads(content)
                return plan

            except Exception as e:
                print(f"[Atlas Brain] Error en llamada a LLM ({e}). Aplicando motor determinista RAG.")

        # 4. Motor Determinista de Producción (Garantiza siempre la salida JSON esperada)
        mud_cut = max(1.5, round(vocal_profile.get("mud_300hz_db", 3.0), 1))
        air_boost = 3 if vocal_profile.get("air_10khz_db", -4) < 0 else 2
        deesser_thresh = -18 if vocal_profile.get("sibilance_score", 45) < 60 else -22
        comp_reduction = 4 if vocal_profile.get("dynamic_range_db", 16) > 14 else 3

        markers = ["Intro", "Verse", "Drop", "Outro"]
        if detected_arrangement:
            # Limpiar marcadores
            markers = [m.split("(")[0].strip() for m in detected_arrangement[:4]]

        plan = {
            "vocal_chain_recommendation": {
                "rack_name": rack_name,
                "devices": [
                    { "plugin": "Subtractive_EQ", "action": f"Cut 300Hz -{int(mud_cut)}dB" },
                    { "plugin": "SSL_Compressor", "target_reduction_db": comp_reduction, "attack_ms": 10 },
                    { "plugin": "Pultec_EQ", "action": f"Boost 10kHz +{air_boost}dB" },
                    { "plugin": "DeEsser", "threshold_db": deesser_thresh }
                ]
            },
            "daw_arrangement": {
                "markers": markers,
                "automation_ideas": [
                    "High-Pass Filter en barras 15 a 16",
                    f"Sidechain ducking en el Lead Vocal durante el Drop ({key_short})"
                ]
            }
        }
        return plan

# =============================================================================
# CLI & PUNTO DE ENTRADA
# =============================================================================
def main():
    parser = argparse.ArgumentParser(description="Atlas Brain - Motor RAG y Decisión de Producción en Azure")
    parser.add_argument("--dna", "-d", default="audio_dna.json", help="Ruta al archivo audio_dna.json")
    parser.add_argument("--inventory", "-i", default="plugins_inventory.json", help="Ruta al catálogo de plugins/presets")
    parser.add_argument("--output", "-o", default="production_plan.json", help="Ruta de salida para production_plan.json")
    parser.add_argument("--backend", "-b", choices=["azure", "ollama", "local"], default="azure", help="Backend de inferencia")
    args = parser.parse_args()

    print("=================================================================")
    print("      ATLAS BRAIN: AUDIO RAG & DECISION ENGINE (AZURE)           ")
    print("=================================================================")

    if not os.path.exists(args.dna):
        print(f"[-] Error: Archivo DNA no encontrado: {args.dna}")
        sys.exit(1)

    with open(args.dna, "r", encoding="utf-8") as f:
        audio_dna = json.load(f)

    brain = AtlasBrainRAG(inventory_path=args.inventory, backend=args.backend)
    production_plan = brain.generate_production_plan(audio_dna)

    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(production_plan, f, indent=2, ensure_ascii=False)

    print(f"[+] ¡Éxito! Plan de producción generado en: {args.output}\\n")
    print(">>> CONTENIDO DE PRODUCTION_PLAN.JSON:")
    print(json.dumps(production_plan, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    main()
`;
};
