import { useState, FormEvent, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic2, Sparkles, Send, Loader2, Music, UserSquare, Sliders, Database, Menu, X, Copy, Check, Save, History, ChevronRight, FileUp, FileText, Trash2 } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const StepContent = ({ num, title, active, children }: any) => (
  <div className={`transition-all duration-500 ${active ? 'opacity-100 translate-y-0' : 'opacity-20 translate-y-4 pointer-events-none'}`}>
    <h2 className="text-3xl font-bold tracking-tight text-white mb-6 flex items-center gap-4">
      <span className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl text-[#ff4e00]">{num}</span>
      {title}
    </h2>
    <div className="pl-14">
      {children}
    </div>
  </div>
);

// Data constants
const FORMATS = ['Song', '32-Bar Freestyle', '6-Track EP', '13-Track LP', '25-Track Mixtape'];

const VOCAL_REGISTERS = ['Soprano (Highest)', 'Alto (Mid-High)', 'Tenor (Mid-Low)', 'Baritone (Low-Mid)', 'Bass (Lowest)'];

const VOCAL_TEXTURE_CATEGORIES = [
  {
    category: "Soprano Textures",
    items: ["Ethereal Soprano", "Crisp Soprano", "Bright Authentic Soprano", "Sultry Soprano", "Powerful Soprano", "Smooth Soprano", "Theatrical Soprano", "Breathy Soprano", "Rhythmic Soprano", "G-Funk Soprano", "Nasal Soprano", "Chesty Soprano"]
  },
  {
    category: "Alto Textures",
    items: ["Warm Alto", "Silky Alto", "Rich Authentic Alto", "Sultry Alto", "Powerful Alto", "Breathy Alto", "Rhythmic Alto", "Analytical Alto", "Smooth Alto", "Gritty Alto", "Theatrical Alto", "Nasal Alto", "G-Funk Alto", "Chesty Alto"]
  },
  {
    category: "Tenor Textures",
    items: ["Smooth Velvety Tenor", "Silky Effortless Tenor", "Rich Resonant Tenor", "Rhythmic Soul Tenor", "Airy Falsetto Tenor", "Breathy Tenor", "Gritty Soulful Tenor", "Powerful Tenor", "Analytical Tenor", "Sultry Tenor", "G-Funk Tenor", "Cold Analytical Tenor", "Theatrical Tenor", "Nasal Tenor", "Chesty Tenor", "Light Airy Tenor"]
  },
  {
    category: "Baritone Textures",
    items: ["Deep Soul Baritone", "Smooth Conversational Baritone", "Velvet Deep Baritone", "Rich Resonant Baritone", "Gritty Authoritative Baritone", "Analytical Baritone", "Cold Analytical Baritone", "Smooth Ethereal Baritone", "Breathy Baritone", "Powerful Baritone", "Theatrical Baritone", "G-Funk Baritone", "Warm Island Baritone", "Nasal Baritone", "Chesty Baritone"]
  },
  {
    category: "Bass Textures",
    items: ["Deep Commanding Bass", "Warm Soulful Bass", "Gravelly Deep Bass", "Smooth Deep Bass", "Powerful Deep Bass", "Analytical Deep Bass", "Sultry Deep Bass", "Breathy Deep Bass", "Theatrical Deep Bass", "G-Funk Bass", "Rare Gospel Bass", "Nasal Deep Bass"]
  }
];

const PHRASING_CATEGORIES = [
  {
    category: "Rap Phrasing",
    items: ["Staccato Phrasing", "Legato/Flowing", "Multisyllabic/Internal Rhyme", "Single-Syllable", "Polysyllabic Elongation", "Enjambment/Run-on", "Chopped/Fragmented", "Conversational Rap", "Syncopated Rap", "Call-and-Response Rap", "Streaming (Rapid-Fire)", "Delayed/Lagging", "Punching/Emphasis", "Bounce/Rhythmic Syncopation", "Punch-Delay Combo"]
  },
  {
    category: "Singing Phrasing",
    items: ["Legato/Smooth Singing", "Staccato/Detached", "Breath-Based", "Riff/Melismatic Runs", "Sustained Note", "Conversational/Speech-Like", "Rhythmic Singing", "Breathy/Whispered", "Belted/Powerful", "Falsetto/Head-Voice", "Modal/Chest Voice", "Call-and-Response Singing", "Straight-Time/Gridded", "Rubato/Tempo-Flexible", "Gospel/Inflected"]
  },
  {
    category: "Hybrid Rap-Singing",
    items: ["Rap-With-Singing-Inflection", "Singing-With-Rap-Articulation", "Verse-Rap/Chorus-Singing", "Sung Rap-Verses", "Rhythmic Rap-Singing", "Call-and-Response Hybrid"]
  },
  {
    category: "Production-Specific",
    items: ["Live/Organic", "Produced/Grid-Locked", "Lo-fi/Imperfect", "Dynamic Range", "Minimalist"]
  }
];

const PRODUCER_CATEGORIES = [
  {
    category: "Core Producer Personas",
    items: ["J Soul (90s Boom Bap)", "Marcus Sterling (Luxury Trap)", "The Headliner (Top 40 Pop Rap)", "Velvet Vic (Late Night R&B)", "The Crossover (2000s Blend)", "The Boom (Trap Soul Boom Bap)", "Concrete Conguero (Tribal)", "Soul Provider (Motown Soul)", "Midwest Maestro (Cleveland)", "The Weekender (Upbeat R&B)", "Midnight Confessions (Alt R&B)", "Velvet Pulse (Modern R&B)", "Disney Composer (Cinematic)", "The Mafia (Dark Cinematic Hip Hop)", "Island Wave (Caribbean Fusion)"]
  },
  {
    category: "Industry DNA",
    items: ["Noah 40 Shebib", "Boi-1da", "D'Mile", "DJ Mustard", "Metro Boomin", "Timbaland", "Rodney Jerkins", "Jermaine Dupri"]
  },
  {
    category: "Cinematic / Story Engine",
    items: ["The Broadway Director", "The Island Composer", "The Epic Composer", "The Concrete Conductor"]
  },
  {
    category: "Specialized Lanes",
    items: ["The Pen Griffey (TrapSoul)", "The Don (Mafioso Rap)", "The Delta Drifter (Blues Rap)", "The Calle Flow (Latin Trap)", "The Havana Maestro (Cuban Salsa)"]
  },
  {
    category: "Expanded Modern System",
    items: ["Piano Rap", "Alt Rap Architect", "Modern Jazz Rap", "Cinematic Rap", "Afro-Fusion Rap", "Minimal Bounce"]
  },
  {
    category: "Detroit / Motivation Engine",
    items: ["Detroit Bounce Motivation", "Luxury Motivation", "Wavy Detroit Soul", "Bounce & Flex", "Night Drive Detroit", "Minimal Boss Energy", "Inspirational Grind", "Detroit Hustle", "Smooth Victory Lap", "Cinematic Motivation"]
  }
];

export default function App() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    format: '',
    register: '',
    texture: '',
    phrasing: '',
    producer: '',
    topic: ''
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<{tags: string, lyrics: string} | null>(null);
  
  const [pdfFile, setPdfFile] = useState<{name: string, base64: string} | null>(null);
  
  const [presets, setPresets] = useState<any[]>([]);
  const [showPresets, setShowPresets] = useState(false);
  const [copiedTags, setCopiedTags] = useState(false);
  const [copiedLyrics, setCopiedLyrics] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  // Load presets on mount
  useEffect(() => {
    const saved = localStorage.getItem('vocalforge_presets');
    if (saved) {
      try { setPresets(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  // Update step progression
  useEffect(() => {
    if (form.format && step < 2) setStep(2);
    if (form.register && form.texture && form.phrasing && step < 3) setStep(3);
    if (form.producer && step < 4) setStep(4);
  }, [form, step]);

  // Auto scroll to bottom when result appears
  useEffect(() => {
    if (result) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [result]);

  const handleGenerate = async () => {
    if (!form.format || !form.register || !form.texture || !form.phrasing || !form.producer || (!form.topic && !pdfFile)) {
      alert("Please ensure all steps (Format, Vocal DNA, Production, and Concept) are fully selected before generating.");
      return;
    }
    
    setIsGenerating(true);
    setResult(null);

    try {
      const systemInstruction = `You are "VocalForge AI," an elite music producer and songwriter.
Task: Create a Suno AI prompt package based on the user's selections and the provided concept.

[ELITE LYRIC WRITING MASTERCLASS - STRICT RULES]
You are a master of emotional, lived-in songwriting. Follow these rules unconditionally:
1. Specific Vulnerability vs Generic Emotion: Stop saying you hurt. Show where it hurts. Use sharp, specific imagery (e.g., "Eviction notice on the fridge" vs "I've been through pain"). The brain connects to images, not vague labels.
2. Main Character Energy: Drop listeners into a lived-in movie. Use real places, moments, and tangible memories. Do not sound like you are "performing" on a stage.
3. Conversational Intimacy: Talk directly to ONE person at 2 AM. Ask questions. Break the invisible wall. Never address the crowd.
4. Shared Struggle / Shared Win: Take your specific story and weave in the universal feeling (fear of failing, seeking approval) so the listener says "Damn, that's me."
5. Subtext & Tone: What you DON'T say matters more. Leave gaps for the listener to fill. (e.g., "Still got your hoodie, haven't washed it in weeks" instead of "I miss you").
6. Connect to the Heart: Turn theory/concepts into lived experiences. Make the listener FEEL the message, not just analyze it.

OUTPUT RULES (CRITICAL):
You MUST output EXACTLY two sections separated by the exact string "|||SPLIT|||".

[Section 1: STYLE TAGS]
A comma-separated list of Suno style tags (genres, vocal types, vibes). Max 120 characters. DO NOT include the words "STYLE TAGS" in the output, just the raw text.

|||SPLIT|||

[Section 2: LYRICS]
Write the lyrics optimized for Suno, following the Elite Lyric Writing Masterclass rules above. 
- Use metatags like [Verse 1], [Chorus], [Beat Drop], [Outro].
- If the format is an EP/LP/Mixtape, provide an overarching Album Title, a Tracklist, and then the FULL lyrics for "Track 1" so the user can easily paste it into Suno to begin.
- Do NOT include the word "LYRICS" at the top, just the raw text.`;

      const userPromptText = `Generate my Suno prompt package.
User Selections:
- Format: ${form.format}
- Vocal Style: ${form.register}, ${form.texture}, ${form.phrasing} phrasing
- Production Vibe: ${form.producer}
- Concept: ${form.topic ? form.topic : '(Rely purely on the attached PDF for concept)'}`;

      const contents: any[] = [];
      if (pdfFile) {
        contents.push({
          inlineData: {
            data: pdfFile.base64,
            mimeType: "application/pdf"
          }
        });
      }
      contents.push(userPromptText);

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: contents,
        config: { systemInstruction: systemInstruction, temperature: 0.75 }
      });

      const text = response.text || "";
      const parts = text.split("|||SPLIT|||");
      
      let finalTags = "";
      let finalLyrics = "";
      
      if (parts.length >= 2) {
        finalTags = parts[0]?.replace(/\[.*?STYLE TAGS.*?\]/gi, '').trim() || "Trap, R&B, Smooth Male Vocal";
        finalLyrics = parts.slice(1).join("|||SPLIT|||").replace(/\[.*?LYRICS.*?\]/gi, '').trim() || "Error generating lyrics.";
      } else {
        // Fallback parser if the AI failed to use |||SPLIT|||
        const splitIndex = text.indexOf('\n\n');
        if (splitIndex > -1) {
            finalTags = text.substring(0, splitIndex).replace(/\[.*?STYLE TAGS.*?\]/gi, '').trim();
            finalLyrics = text.substring(splitIndex).replace(/\[.*?LYRICS.*?\]/gi, '').trim();
        } else {
            finalTags = "Custom Vibe, R&B, Rap";
            finalLyrics = text;
        }
      }
      
      const newResult = {
        tags: finalTags,
        lyrics: finalLyrics
      };
      
      setResult(newResult);

      // Auto-Save Preset
      const newPreset = {
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        title: (form.topic || pdfFile?.name || 'Session').substring(0, 30) + '...',
        form: { ...form },
        result: newResult
      };
      const updatedPresets = [newPreset, ...presets].slice(0, 20); // Keep last 20
      setPresets(updatedPresets);
      localStorage.setItem('vocalforge_presets', JSON.stringify(updatedPresets));

    } catch (error) {
      console.error(error);
      alert("Error generating. Check your API key, console, or ensure the PDF is a valid text-based file.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToSuno = (text: string, type: 'tags' | 'lyrics') => {
    navigator.clipboard.writeText(text);
    if (type === 'tags') {
      setCopiedTags(true);
      setTimeout(() => setCopiedTags(false), 2000);
    } else {
      setCopiedLyrics(true);
      setTimeout(() => setCopiedLyrics(false), 2000);
    }
  };

  const loadPreset = (p: any) => {
    setForm(p.form);
    setResult(p.result);
    setStep(5);
    setShowPresets(false);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#e0d8d0] font-sans selection:bg-[#ff4e00]/30 overflow-x-hidden">
      
      {/* Top Navigation */}
      <nav className="fixed top-0 w-full bg-black/80 backdrop-blur-xl border-b border-white/5 z-50 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#ff4e00] flex items-center justify-center shadow-[0_0_15px_rgba(255,78,0,0.6)]">
            <div className="w-3 h-3 border-2 border-black rounded-sm rotate-45"></div>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white hidden sm:block">VOCALFORGE<span className="text-[#ff4e00]">AI</span></h1>
        </div>
        <button 
          onClick={() => setShowPresets(true)}
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-5 py-2.5 rounded-full text-sm font-semibold transition-colors"
        >
          <History size={16} /> Saved Presets
        </button>
      </nav>

      {/* Main Flow (Centered Column) */}
      <main className="max-w-3xl mx-auto pt-32 pb-40 px-6 space-y-20">
        
        {/* Step 1: Format */}
        <StepContent num={1} title="Choose Format" active={true}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FORMATS.map(fmt => (
              <button
                key={fmt}
                onClick={() => setForm({ ...form, format: fmt })}
                className={`p-6 rounded-3xl border-2 text-left transition-all ${form.format === fmt ? 'border-[#ff4e00] bg-[#ff4e00]/10 text-white' : 'border-white/5 bg-white/5 hover:border-white/20'}`}
              >
                <div className="text-2xl font-bold">{fmt}</div>
              </button>
            ))}
          </div>
        </StepContent>

        {/* Step 2: Vocal Details */}
        <StepContent num={2} title="Design Vocal DNA" active={step >= 2}>
          <div className="space-y-6 bg-white/5 border border-white/5 p-8 rounded-3xl">
            <div className="space-y-3">
              <label className="text-sm font-bold uppercase tracking-widest text-[#8e9299]">Vocal Register</label>
              <select 
                title="Vocal Register"
                className="w-full bg-black/50 border border-white/10 text-white p-5 rounded-2xl text-lg appearance-none focus:outline-none focus:border-[#ff4e00] transition-colors"
                value={form.register}
                onChange={e => setForm({...form, register: e.target.value})}
              >
                <option value="" disabled>Select range...</option>
                {VOCAL_REGISTERS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            
            <div className="space-y-3">
              <label className="text-sm font-bold uppercase tracking-widest text-[#8e9299]">Vocal Texture</label>
              <select 
                title="Vocal Texture"
                className="w-full bg-black/50 border border-white/10 text-white p-5 rounded-2xl text-lg appearance-none focus:outline-none focus:border-[#ff4e00] transition-colors"
                value={form.texture}
                onChange={e => setForm({...form, texture: e.target.value})}
              >
                <option value="" disabled>Select tone...</option>
                {VOCAL_TEXTURE_CATEGORIES.map(group => (
                  <optgroup key={group.category} label={group.category}>
                    {group.items.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </optgroup>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold uppercase tracking-widest text-[#8e9299]">Phrasing / Flow Style</label>
              <select 
                title="Phrasing Style"
                className="w-full bg-black/50 border border-white/10 text-white p-5 rounded-2xl text-lg appearance-none focus:outline-none focus:border-[#ff4e00] transition-colors"
                value={form.phrasing}
                onChange={e => setForm({...form, phrasing: e.target.value})}
              >
                <option value="" disabled>Select delivery style...</option>
                {PHRASING_CATEGORIES.map(group => (
                  <optgroup key={group.category} label={group.category}>
                    {group.items.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>
        </StepContent>

        {/* Step 3: Production */}
        <StepContent num={3} title="Set Production Vibe" active={step >= 3}>
          <div className="bg-white/5 border border-white/5 p-8 rounded-3xl">
            <label className="text-sm font-bold uppercase tracking-widest text-[#8e9299] block mb-3">Producer Persona</label>
            <select 
              title="Producer Persona"
              className="w-full bg-black/50 border border-white/10 text-white p-5 rounded-2xl text-lg appearance-none focus:outline-none focus:border-[#ff4e00] transition-colors"
              value={form.producer}
              onChange={e => setForm({...form, producer: e.target.value})}
            >
              <option value="" disabled>Select producer / beat vibe...</option>
              {PRODUCER_CATEGORIES.map(group => (
                <optgroup key={group.category} label={group.category}>
                  {group.items.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </optgroup>
              ))}
            </select>
          </div>
        </StepContent>

        {/* Step 4: Concept & Generation */}
        <StepContent num={4} title="The Concept" active={step >= 4}>
          <div className="space-y-6">
            <textarea
              placeholder="What is this track about? (e.g. 'Throwing pennies on 5th street, knowing we were meant for more...')"
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-xl text-white focus:outline-none focus:border-[#ff4e00] transition-all resize-none"
              value={form.topic}
              onChange={e => setForm({...form, topic: e.target.value})}
            />

            {/* PDF Uploader */}
            <div className="bg-black/30 border border-white/10 border-dashed rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#ff4e00]/10 flex items-center justify-center text-[#ff4e00]">
                  {pdfFile ? <FileText size={24} /> : <FileUp size={24} />}
                </div>
                <div>
                  <h3 className="text-white font-bold">{pdfFile ? pdfFile.name : 'Upload PDF Concept (Optional)'}</h3>
                  <p className="text-[#8e9299] text-sm">{pdfFile ? 'PDF attached successfully.' : 'Let the engine extract themes from your documents.'}</p>
                </div>
              </div>
              
              {pdfFile ? (
                <button 
                  onClick={() => setPdfFile(null)}
                  className="px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl transition-colors flex items-center gap-2 text-sm font-bold"
                >
                  <Trash2 size={16} /> REMOVE
                </button>
              ) : (
                <label className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl cursor-pointer transition-colors text-white text-sm font-bold tracking-widest uppercase flex-shrink-0">
                  Select File
                  <input 
                    type="file" 
                    accept="application/pdf" 
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if(!file) return;
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const base64String = (event.target?.result as string).split(',')[1];
                        setPdfFile({ name: file.name, base64: base64String });
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>
              )}
            </div>

            <button 
              onClick={handleGenerate}
              disabled={isGenerating || !form.format || !form.register || !form.texture || !form.phrasing || !form.producer || (!form.topic && !pdfFile)}
              className="w-full py-8 px-6 bg-[#ff4e00] hover:bg-[#ff6a2b] text-black rounded-3xl font-black text-2xl tracking-widest uppercase transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4 shadow-[0_0_30px_rgba(255,78,0,0.3)] mt-4"
            >
              {isGenerating ? (
                <><Loader2 size={32} className="animate-spin" /> WRITING LYRICS & TAGS...</>
              ) : (
                <><Sparkles size={32} /> GENERATE (AUTO-SAVES)</>
              )}
            </button>
          </div>
        </StepContent>

        {/* Results Section */}
        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-10 space-y-12"
          >
            <div className="flex items-center gap-4 mb-10">
              <div className="h-px bg-white/20 flex-1"></div>
              <h2 className="text-[#ff4e00] font-mono tracking-widest text-sm uppercase">Suno Ready Output</h2>
              <div className="h-px bg-white/20 flex-1"></div>
            </div>

            {/* STYLE TAG BLOCK */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 relative group">
              <p className="text-xs font-bold uppercase tracking-widest text-[#8e9299] mb-4">Suno Style Tags</p>
              <p className="text-2xl font-serif text-white font-medium leading-relaxed pr-24">{result.tags}</p>
              
              <button 
                onClick={() => copyToSuno(result.tags, 'tags')}
                className="absolute top-8 right-8 bg-white/10 hover:bg-white/20 p-4 rounded-2xl text-white transition-colors flex items-center flex-col gap-2"
              >
                {copiedTags ? <Check size={28} className="text-[#00FF00]" /> : <Copy size={28} />}
                <span className="text-[10px] uppercase font-bold tracking-widest">{copiedTags ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* LYRICS BLOCK */}
            <div className="bg-zinc-900 border border-[#ff4e00]/30 rounded-3xl p-8 relative">
              <p className="text-xs font-bold uppercase tracking-widest text-[#ff4e00] mb-6">Suno Lyrics Generation</p>
              
              <div className="whitespace-pre-line text-lg font-mono text-white/90 leading-loose pr-24 max-h-[600px] overflow-y-auto scrollbar-hide">
                {result.lyrics}
              </div>

              <button 
                onClick={() => copyToSuno(result.lyrics, 'lyrics')}
                className="absolute top-8 right-8 bg-[#ff4e00] hover:bg-[#ff6a2b] text-zinc-950 p-4 rounded-2xl transition-colors flex items-center flex-col gap-2 shadow-[0_0_20px_rgba(255,78,0,0.4)]"
              >
                {copiedLyrics ? <Check size={28} /> : <Copy size={28} />}
                <span className="text-[10px] uppercase font-black tracking-widest">{copiedLyrics ? 'Saved' : 'Copy'}</span>
              </button>
            </div>
            
            <div ref={bottomRef} className="h-10"></div>
          </motion.div>
        )}

      </main>

      {/* Slide-over Presets Panel */}
      <AnimatePresence>
        {showPresets && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPresets(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-zinc-950 border-l border-white/5 z-50 p-8 flex flex-col"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3"><History size={24} className="text-[#ff4e00]" /> History & Presets</h2>
                <button onClick={() => setShowPresets(false)} className="p-2 bg-white/5 rounded-full hover:bg-white/10"><X size={24} /></button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 scrollbar-hide">
                {presets.length === 0 ? (
                  <div className="text-center text-white/40 mt-20">
                    <Save size={48} className="mx-auto mb-4 opacity-20" />
                    <p>Generations will auto-save here.</p>
                  </div>
                ) : (
                  presets.map((p, i) => (
                    <div 
                      key={p.id}
                      onClick={() => loadPreset(p)}
                      className="bg-white/5 border border-white/5 p-5 rounded-2xl cursor-pointer hover:bg-white/10 hover:border-white/20 transition-colors group"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg text-white group-hover:text-[#ff4e00] transition-colors">{p.title}</h3>
                        <span className="text-xs text-white/40 font-mono">{p.date}</span>
                      </div>
                      <p className="text-xs text-white/50 mb-3">{p.form.format} • {p.form.producer}</p>
                      <div className="flex items-center text-[10px] text-[#ff4e00] font-bold uppercase tracking-widest gap-1 group-hover:translate-x-2 transition-transform">
                        Load Preset <ChevronRight size={12} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}

